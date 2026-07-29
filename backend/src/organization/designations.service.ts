import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Designation } from './entities/designation.entity';
import { CreateDesignationDto } from './dto/create-designation.dto';
import { UpdateDesignationDto } from './dto/update-designation.dto';
import { OrgListQueryDto } from './dto/list-query.dto';
import { AuditLogService } from '../audit-logs/audit-log.service';

@Injectable()
export class DesignationsService {
  constructor(
    @InjectRepository(Designation)
    private readonly repository: Repository<Designation>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(
    dto: CreateDesignationDto,
    actorId?: string,
  ): Promise<Designation> {
    const saved = await this.repository.save(this.repository.create(dto));
    await this.auditLogService.record({
      userId: actorId,
      module: 'ORGANIZATION',
      entity: 'Designation',
      entityId: saved.id,
      action: 'CREATE',
      newValue: { name: saved.name, designationCode: saved.designationCode },
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

  async findOne(id: string): Promise<Designation> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity)
      throw new NotFoundException(`Designation with ID ${id} not found`);
    return entity;
  }

  async update(
    id: string,
    dto: UpdateDesignationDto,
    actorId?: string,
  ): Promise<Designation> {
    const entity = await this.findOne(id);
    const oldValue = { name: entity.name, isActive: entity.isActive };
    Object.assign(entity, dto);
    const saved = await this.repository.save(entity);
    await this.auditLogService.record({
      userId: actorId,
      module: 'ORGANIZATION',
      entity: 'Designation',
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
      entity: 'Designation',
      entityId: id,
      action: 'DELETE',
      oldValue: { name: entity.name },
    });
  }

  async restore(id: string, actorId?: string): Promise<Designation> {
    const entity = await this.repository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!entity)
      throw new NotFoundException(`Designation with ID ${id} not found`);
    if (!entity.deletedAt)
      throw new ConflictException('Designation is not deleted');
    await this.repository.restore(id);
    await this.auditLogService.record({
      userId: actorId,
      module: 'ORGANIZATION',
      entity: 'Designation',
      entityId: id,
      action: 'RESTORE',
      newValue: { name: entity.name },
    });
    return this.findOne(id);
  }

  async findAllForReport(): Promise<Designation[]> {
    return this.repository.find({ order: { name: 'ASC' } });
  }

  private buildFindQuery(
    query: OrgListQueryDto,
  ): SelectQueryBuilder<Designation> {
    const queryBuilder = this.repository.createQueryBuilder('designation');
    if (query.includeDeleted) queryBuilder.withDeleted();
    if (query.search) {
      queryBuilder.andWhere(
        '(designation.name ILIKE :search OR designation.designationCode ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }
    if (query.status) {
      queryBuilder.andWhere('designation.isActive = :isActive', {
        isActive: query.status === 'active',
      });
    }
    queryBuilder.orderBy('designation.name', 'ASC');
    return queryBuilder;
  }
}
