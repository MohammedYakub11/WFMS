import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { AuditLog, AuditAction } from './entities/audit-log.entity';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';

interface RecordAuditLogInput {
  userId?: string | null;
  module: string;
  entity: string;
  entityId?: string | null;
  action: AuditAction;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
}

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async record(input: RecordAuditLogInput): Promise<AuditLog> {
    const entry = this.auditLogRepository.create({
      userId: input.userId ?? null,
      module: input.module,
      entity: input.entity,
      entityId: input.entityId ?? null,
      action: input.action,
      oldValue: input.oldValue ?? null,
      newValue: input.newValue ?? null,
    });
    return this.auditLogRepository.save(entry);
  }

  async findAll(query: AuditLogQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;

    const [items, total] = await this.buildFindQuery(query)
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

  async findOne(id: string): Promise<AuditLog | null> {
    return this.auditLogRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async exportRows(query: AuditLogQueryDto): Promise<AuditLog[]> {
    return this.buildFindQuery(query).take(50000).getMany();
  }

  private buildFindQuery(
    query: AuditLogQueryDto,
  ): SelectQueryBuilder<AuditLog> {
    const queryBuilder = this.auditLogRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user');

    if (query.module) {
      queryBuilder.andWhere('log.module = :module', { module: query.module });
    }
    if (query.entity) {
      queryBuilder.andWhere('log.entity = :entity', { entity: query.entity });
    }
    if (query.entityId) {
      queryBuilder.andWhere('log.entityId = :entityId', {
        entityId: query.entityId,
      });
    }
    if (query.action) {
      queryBuilder.andWhere('log.action = :action', { action: query.action });
    }
    if (query.userId) {
      queryBuilder.andWhere('log.userId = :userId', { userId: query.userId });
    }
    if (query.dateFrom) {
      queryBuilder.andWhere('log.createdAt >= :dateFrom', {
        dateFrom: query.dateFrom,
      });
    }
    if (query.dateTo) {
      queryBuilder.andWhere('log.createdAt <= :dateTo', {
        dateTo: query.dateTo,
      });
    }

    queryBuilder.orderBy('log.createdAt', 'DESC');

    return queryBuilder;
  }
}
