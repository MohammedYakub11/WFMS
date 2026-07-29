import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { BusinessUnit } from './entities/business-unit.entity';
import { CreateBusinessUnitDto } from './dto/create-business-unit.dto';
import { UpdateBusinessUnitDto } from './dto/update-business-unit.dto';
import { OrgListQueryDto } from './dto/list-query.dto';
import { AuditLogService } from '../audit-logs/audit-log.service';

@Injectable()
export class BusinessUnitsService {
  constructor(
    @InjectRepository(BusinessUnit)
    private readonly repository: Repository<BusinessUnit>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(
    dto: CreateBusinessUnitDto,
    actorId?: string,
  ): Promise<BusinessUnit> {
    const saved = await this.repository.save(this.repository.create(dto));
    await this.auditLogService.record({
      userId: actorId,
      module: 'ORGANIZATION',
      entity: 'BusinessUnit',
      entityId: saved.id,
      action: 'CREATE',
      newValue: { name: saved.name },
    });
    return saved;
  }

  async findAll(query: OrgListQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const [items, total] = await this.buildFindQuery(query)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<BusinessUnit> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity)
      throw new NotFoundException(`BusinessUnit with ID ${id} not found`);
    return entity;
  }

  async update(
    id: string,
    dto: UpdateBusinessUnitDto,
    actorId?: string,
  ): Promise<BusinessUnit> {
    const entity = await this.findOne(id);
    const oldValue = { name: entity.name, isActive: entity.isActive };
    Object.assign(entity, dto);
    const saved = await this.repository.save(entity);
    await this.auditLogService.record({
      userId: actorId,
      module: 'ORGANIZATION',
      entity: 'BusinessUnit',
      entityId: id,
      action: 'UPDATE',
      oldValue,
      newValue: { name: saved.name, isActive: saved.isActive },
    });
    return saved;
  }

  async remove(id: string, actorId?: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repository.softRemove(entity);
    await this.auditLogService.record({
      userId: actorId,
      module: 'ORGANIZATION',
      entity: 'BusinessUnit',
      entityId: id,
      action: 'DELETE',
      oldValue: { name: entity.name },
    });
  }

  async restore(id: string, actorId?: string): Promise<BusinessUnit> {
    const entity = await this.repository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!entity)
      throw new NotFoundException(`BusinessUnit with ID ${id} not found`);
    if (!entity.deletedAt)
      throw new ConflictException('BusinessUnit is not deleted');
    await this.repository.restore(id);
    await this.auditLogService.record({
      userId: actorId,
      module: 'ORGANIZATION',
      entity: 'BusinessUnit',
      entityId: id,
      action: 'RESTORE',
      newValue: { name: entity.name },
    });
    return this.findOne(id);
  }

  async findAllForReport(): Promise<BusinessUnit[]> {
    return this.repository.find({ order: { name: 'ASC' } });
  }

  private buildFindQuery(
    query: OrgListQueryDto,
  ): SelectQueryBuilder<BusinessUnit> {
    const queryBuilder = this.repository.createQueryBuilder('bu');
    if (query.includeDeleted) queryBuilder.withDeleted();
    if (query.search) {
      queryBuilder.andWhere('bu.name ILIKE :search', {
        search: `%${query.search}%`,
      });
    }
    if (query.status) {
      queryBuilder.andWhere('bu.isActive = :isActive', {
        isActive: query.status === 'active',
      });
    }
    queryBuilder.orderBy('bu.name', 'ASC');
    return queryBuilder;
  }
}
