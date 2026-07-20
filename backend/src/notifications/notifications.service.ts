import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import {
  Notification,
  NotificationPriority,
  NotificationType,
} from './entities/notification.entity';
import { NotificationPreference } from './entities/notification-preference.entity';
import { Employee } from '../employees/entities/employee.entity';
import { AuditLogService } from '../audit-logs/audit-log.service';
import { NotificationListQueryDto } from './dto/notification-list-query.dto';
import { SendNotificationDto } from './dto/send-notification.dto';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';

type PreferenceFlag =
  | 'onSkillApproval'
  | 'onSkillRejection'
  | 'onRoleChange'
  | 'onEmployeeUpdate'
  | 'onBroadcast';

interface CreateNotificationInput {
  employeeId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority?: NotificationPriority;
  link?: string;
  isBroadcast?: boolean;
}

const DEFAULT_PREFERENCES: Omit<
  NotificationPreference,
  'id' | 'employee' | 'createdAt' | 'updatedAt'
> = {
  employeeId: '',
  onSkillApproval: true,
  onSkillRejection: true,
  onRoleChange: true,
  onEmployeeUpdate: true,
  onBroadcast: true,
};

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(NotificationPreference)
    private readonly notificationPreferenceRepository: Repository<NotificationPreference>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async countUnread(employeeId?: string): Promise<number> {
    if (!employeeId) return 0;
    return this.notificationRepository.count({
      where: { employee_id: employeeId, is_read: false },
    });
  }

  // Maps a notification type to the preference flag that can suppress it.
  // Types not present here (INFO, SYSTEM, REMINDER, SECURITY_ALERT) are always sent.
  private mapTypeToPreferenceFlag(
    type: NotificationType,
  ): PreferenceFlag | null {
    switch (type) {
      case NotificationType.SKILL_APPROVAL:
        return 'onSkillApproval';
      case NotificationType.SKILL_REJECTION:
        return 'onSkillRejection';
      case NotificationType.ROLE_ASSIGNED:
      case NotificationType.ROLE_REVOKED:
        return 'onRoleChange';
      case NotificationType.EMPLOYEE_UPDATE:
        return 'onEmployeeUpdate';
      case NotificationType.SYSTEM_ANNOUNCEMENT:
        return 'onBroadcast';
      default:
        return null;
    }
  }

  async create(input: CreateNotificationInput): Promise<Notification | null> {
    const flag = this.mapTypeToPreferenceFlag(input.type);
    if (flag) {
      const preference = await this.notificationPreferenceRepository.findOne({
        where: { employeeId: input.employeeId },
      });
      if (preference && preference[flag] === false) {
        return null;
      }
    }

    const notification = this.notificationRepository.create({
      employee_id: input.employeeId,
      title: input.title,
      message: input.message,
      type: input.type,
      priority: input.priority ?? NotificationPriority.NORMAL,
      link: input.link ?? null,
      isBroadcast: input.isBroadcast ?? false,
    });
    return this.notificationRepository.save(notification);
  }

  async findAllForUser(employeeId: string, query: NotificationListQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;

    const queryBuilder = this.notificationRepository
      .createQueryBuilder('n')
      .where('n.employee_id = :employeeId', { employeeId })
      .andWhere('n.deletedAt IS NULL');

    if (query.filter === 'unread') {
      queryBuilder.andWhere('n.is_read = :isRead', { isRead: false });
    } else if (query.filter === 'read') {
      queryBuilder.andWhere('n.is_read = :isRead', { isRead: true });
    }

    if (query.type) {
      queryBuilder.andWhere('n.type = :type', { type: query.type });
    }

    queryBuilder
      .orderBy('n.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private async findOwned(
    id: string,
    employeeId: string,
  ): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id, employee_id: employeeId },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found.');
    }
    return notification;
  }

  async markRead(id: string, employeeId: string): Promise<Notification> {
    const notification = await this.findOwned(id, employeeId);
    notification.is_read = true;
    notification.readAt = new Date();
    return this.notificationRepository.save(notification);
  }

  async markAllRead(employeeId: string): Promise<{ updated: boolean }> {
    await this.notificationRepository.update(
      { employee_id: employeeId, is_read: false, deletedAt: IsNull() },
      { is_read: true, readAt: new Date() },
    );
    return { updated: true };
  }

  async remove(id: string, employeeId: string): Promise<{ removed: boolean }> {
    const notification = await this.findOwned(id, employeeId);
    await this.notificationRepository.softRemove(notification);
    return { removed: true };
  }

  async broadcast(
    dto: SendNotificationDto,
    actorId?: string,
  ): Promise<{ sent: number }> {
    let recipientIds: string[];
    if (dto.target === 'all') {
      const employees = await this.employeeRepository.find({
        where: { deletedAt: IsNull() },
      });
      recipientIds = employees.map((e) => e.id);
    } else {
      recipientIds = dto.employeeIds ?? [];
    }

    const type = dto.type ?? NotificationType.SYSTEM_ANNOUNCEMENT;
    const priority = dto.priority ?? NotificationPriority.NORMAL;

    // Pragmatic simplification: fan out via create() per recipient rather than a bulk
    // insert, so per-recipient notification-preference suppression (e.g. onBroadcast=false)
    // is respected without duplicating that logic for a bulk path. This app's employee
    // counts don't warrant the extra complexity of a chunked bulk insert.
    for (const recipientId of recipientIds) {
      await this.create({
        employeeId: recipientId,
        title: dto.title,
        message: dto.message,
        type,
        priority,
        link: dto.link,
        isBroadcast: true,
      });
    }

    await this.auditLogService.record({
      userId: actorId,
      module: 'NOTIFICATIONS',
      entity: 'Notification',
      action: 'NOTIFICATION_SENT',
      newValue: {
        target: dto.target,
        count: recipientIds.length,
        title: dto.title,
      },
    });

    return { sent: recipientIds.length };
  }

  async getPreferences(
    employeeId: string,
  ): Promise<
    | NotificationPreference
    | Omit<
        NotificationPreference,
        'id' | 'employee' | 'createdAt' | 'updatedAt'
      >
  > {
    const preference = await this.notificationPreferenceRepository.findOne({
      where: { employeeId },
    });
    if (preference) return preference;
    return { ...DEFAULT_PREFERENCES, employeeId };
  }

  async updatePreferences(
    employeeId: string,
    dto: UpdateNotificationPreferencesDto,
  ): Promise<NotificationPreference> {
    let preference = await this.notificationPreferenceRepository.findOne({
      where: { employeeId },
    });
    if (!preference) {
      preference = this.notificationPreferenceRepository.create({
        employeeId,
      });
    }
    Object.assign(preference, dto);
    return this.notificationPreferenceRepository.save(preference);
  }
}
