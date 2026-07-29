import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeSkill } from './entities/employee-skill.entity';
import { CreateEmployeeSkillDto } from './dto/create-employee-skill.dto';
import { UpdateEmployeeSkillDto } from './dto/update-employee-skill.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import { AuditLogService } from '../audit-logs/audit-log.service';

@Injectable()
export class EmployeeSkillsService {
  private readonly logger = new Logger(EmployeeSkillsService.name);

  constructor(
    @InjectRepository(EmployeeSkill)
    private readonly employeeSkillRepository: Repository<EmployeeSkill>,
    private readonly notificationsService: NotificationsService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(createDto: CreateEmployeeSkillDto): Promise<EmployeeSkill> {
    const employeeSkill = this.employeeSkillRepository.create(createDto);
    // Explicitly set pending when creating as per Phase 3.6 states
    employeeSkill.approvalStatus = 'pending';
    employeeSkill.submittedAt = new Date();
    return this.employeeSkillRepository.save(employeeSkill);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    employeeId?: string,
    skillId?: string,
  ) {
    const query = this.employeeSkillRepository
      .createQueryBuilder('employeeSkill')
      .leftJoinAndSelect('employeeSkill.skill', 'skill')
      .leftJoinAndSelect('skill.category', 'category')
      .leftJoinAndSelect('employeeSkill.employee', 'employee');

    if (employeeId) {
      query.andWhere('employeeSkill.employeeId = :employeeId', { employeeId });
    }
    if (skillId) {
      query.andWhere('employeeSkill.skillId = :skillId', { skillId });
    }

    const [items, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findPending(
    page: number = 1,
    limit: number = 10,
    filters?: {
      search?: string;
      department?: string;
      categoryId?: string;
      status?: 'new' | 'resubmitted';
      sortBy?: 'submittedAt' | 'employeeName';
      sortOrder?: 'ASC' | 'DESC';
    },
  ) {
    const query = this.employeeSkillRepository
      .createQueryBuilder('employeeSkill')
      .leftJoinAndSelect('employeeSkill.skill', 'skill')
      .leftJoinAndSelect('skill.category', 'category')
      .leftJoinAndSelect('employeeSkill.employee', 'employee')
      .where('employeeSkill.approvalStatus = :status', { status: 'pending' });

    if (filters?.search) {
      query.andWhere(
        '(employee.first_name ILIKE :search OR employee.last_name ILIKE :search OR skill.skillName ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }
    if (filters?.department) {
      query.andWhere('employee.department = :department', {
        department: filters.department,
      });
    }
    if (filters?.categoryId) {
      query.andWhere('skill.categoryId = :categoryId', {
        categoryId: filters.categoryId,
      });
    }
    if (filters?.status === 'new') {
      query.andWhere('employeeSkill.previousStatus IS NULL');
    } else if (filters?.status === 'resubmitted') {
      query.andWhere('employeeSkill.previousStatus IS NOT NULL');
    }

    const sortOrder = filters?.sortOrder || 'ASC';
    if (filters?.sortBy === 'employeeName') {
      query.orderBy('employee.first_name', sortOrder).addOrderBy('employee.last_name', sortOrder);
    } else {
      query.orderBy('employeeSkill.submittedAt', sortOrder);
    }

    const [items, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<EmployeeSkill> {
    const employeeSkill = await this.employeeSkillRepository.findOne({
      where: { id },
      relations: ['skill', 'skill.category', 'employee'],
    });

    if (!employeeSkill) {
      throw new NotFoundException(`EmployeeSkill with ID ${id} not found`);
    }
    return employeeSkill;
  }

  async update(
    id: string,
    updateDto: UpdateEmployeeSkillDto,
  ): Promise<EmployeeSkill> {
    const employeeSkill = await this.findOne(id);
    const prevStatus = employeeSkill.approvalStatus;

    Object.assign(employeeSkill, updateDto);

    // If a skill is updated, it typically goes back to pending/resubmitted
    // But since the DTO doesn't explicitly enforce state here, we'll let specific actions handle it
    if (prevStatus === 'changes_requested') {
      employeeSkill.approvalStatus = 'pending';
      employeeSkill.resubmittedAt = new Date();
    }

    return this.employeeSkillRepository.save(employeeSkill);
  }

  async remove(id: string): Promise<void> {
    const employeeSkill = await this.findOne(id);
    await this.employeeSkillRepository.remove(employeeSkill);
  }

  // Manager Approval Workflow Methods
  async approve(
    id: string,
    reviewerId: string,
    comments?: string,
  ): Promise<EmployeeSkill> {
    const skill = await this.findOne(id);
    if (skill.approvalStatus === 'approved') {
      throw new BadRequestException('Skill is already approved.');
    }
    skill.previousStatus = skill.approvalStatus;
    skill.approvalStatus = 'approved';
    skill.reviewedBy = reviewerId;
    skill.reviewedAt = new Date();
    if (comments) skill.reviewComments = comments;
    const saved = await this.employeeSkillRepository.save(skill);

    try {
      await this.auditLogService.record({
        userId: reviewerId,
        module: 'EMPLOYEE_SKILLS',
        entity: 'EmployeeSkill',
        entityId: id,
        action: 'SKILL_APPROVED',
        newValue: { comments },
      });
    } catch (err) {
      this.logger.error(
        `Failed to write audit log for employeeSkill ${id} approval`,
        err instanceof Error ? err.stack : String(err),
      );
    }

    try {
      await this.notificationsService.create({
        employeeId: skill.employeeId,
        title: 'Skill Approved',
        message: comments
          ? `Your skill submission was approved. ${comments}`
          : 'Your skill submission was approved.',
        type: NotificationType.SKILL_APPROVAL,
      });
    } catch (err) {
      this.logger.error(
        `Failed to send skill approval notification for employeeSkill ${id}`,
        err instanceof Error ? err.stack : String(err),
      );
    }

    return saved;
  }

  async reject(
    id: string,
    reviewerId: string,
    comments?: string,
  ): Promise<EmployeeSkill> {
    const skill = await this.findOne(id);
    if (skill.approvalStatus === 'rejected') {
      throw new BadRequestException('Skill is already rejected.');
    }
    skill.previousStatus = skill.approvalStatus;
    skill.approvalStatus = 'rejected';
    skill.reviewedBy = reviewerId;
    skill.reviewedAt = new Date();
    if (comments) skill.reviewComments = comments;
    const saved = await this.employeeSkillRepository.save(skill);

    try {
      await this.auditLogService.record({
        userId: reviewerId,
        module: 'EMPLOYEE_SKILLS',
        entity: 'EmployeeSkill',
        entityId: id,
        action: 'SKILL_REJECTED',
        newValue: { comments },
      });
    } catch (err) {
      this.logger.error(
        `Failed to write audit log for employeeSkill ${id} rejection`,
        err instanceof Error ? err.stack : String(err),
      );
    }

    try {
      await this.notificationsService.create({
        employeeId: skill.employeeId,
        title: 'Skill Rejected',
        message: comments
          ? `Your skill submission was rejected. ${comments}`
          : 'Your skill submission was rejected.',
        type: NotificationType.SKILL_REJECTION,
      });
    } catch (err) {
      this.logger.error(
        `Failed to send skill rejection notification for employeeSkill ${id}`,
        err instanceof Error ? err.stack : String(err),
      );
    }

    return saved;
  }

  async requestChanges(
    id: string,
    reviewerId: string,
    comments: string,
  ): Promise<EmployeeSkill> {
    const skill = await this.findOne(id);
    skill.previousStatus = skill.approvalStatus;
    skill.approvalStatus = 'changes_requested';
    skill.reviewedBy = reviewerId;
    skill.reviewedAt = new Date();
    if (comments) skill.reviewComments = comments;
    const saved = await this.employeeSkillRepository.save(skill);

    try {
      await this.auditLogService.record({
        userId: reviewerId,
        module: 'EMPLOYEE_SKILLS',
        entity: 'EmployeeSkill',
        entityId: id,
        action: 'CHANGES_REQUESTED',
        newValue: { comments },
      });
    } catch (err) {
      this.logger.error(
        `Failed to write audit log for employeeSkill ${id} changes-requested`,
        err instanceof Error ? err.stack : String(err),
      );
    }

    try {
      await this.notificationsService.create({
        employeeId: skill.employeeId,
        title: 'Changes Requested',
        message: comments
          ? `Changes were requested on your skill submission. ${comments}`
          : 'Changes were requested on your skill submission.',
        type: NotificationType.SKILL_APPROVAL,
      });
    } catch (err) {
      this.logger.error(
        `Failed to send changes-requested notification for employeeSkill ${id}`,
        err instanceof Error ? err.stack : String(err),
      );
    }

    return saved;
  }
}
