import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Department } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { OrgListQueryDto } from './dto/list-query.dto';
import { AuditLogService } from '../audit-logs/audit-log.service';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly repository: Repository<Department>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(
    dto: CreateDepartmentDto,
    actorId?: string,
  ): Promise<Department> {
    const saved = await this.repository.save(this.repository.create(dto));
    await this.auditLogService.record({
      userId: actorId,
      module: 'ORGANIZATION',
      entity: 'Department',
      entityId: saved.id,
      action: 'CREATE',
      newValue: { name: saved.name, departmentCode: saved.departmentCode },
    });
    return this.findOne(saved.id);
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

  async findOne(id: string): Promise<Department> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['businessUnit'],
    });
    if (!entity)
      throw new NotFoundException(`Department with ID ${id} not found`);
    return entity;
  }

  async update(
    id: string,
    dto: UpdateDepartmentDto,
    actorId?: string,
  ): Promise<Department> {
    const entity = await this.findOne(id);
    const oldValue = { name: entity.name, isActive: entity.isActive };
    Object.assign(entity, dto);
    const saved = await this.repository.save(entity);
    await this.auditLogService.record({
      userId: actorId,
      module: 'ORGANIZATION',
      entity: 'Department',
      entityId: id,
      action: 'UPDATE',
      oldValue,
      newValue: { name: saved.name, isActive: saved.isActive },
    });
    return this.findOne(id);
  }

  async remove(id: string, actorId?: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repository.softRemove(entity);
    await this.auditLogService.record({
      userId: actorId,
      module: 'ORGANIZATION',
      entity: 'Department',
      entityId: id,
      action: 'DELETE',
      oldValue: { name: entity.name },
    });
  }

  async restore(id: string, actorId?: string): Promise<Department> {
    const entity = await this.repository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!entity)
      throw new NotFoundException(`Department with ID ${id} not found`);
    if (!entity.deletedAt)
      throw new ConflictException('Department is not deleted');
    await this.repository.restore(id);
    await this.auditLogService.record({
      userId: actorId,
      module: 'ORGANIZATION',
      entity: 'Department',
      entityId: id,
      action: 'RESTORE',
      newValue: { name: entity.name },
    });
    return this.findOne(id);
  }

  async findAllForReport(): Promise<Department[]> {
    return this.repository.find({ order: { name: 'ASC' } });
  }

  private buildFindQuery(
    query: OrgListQueryDto,
  ): SelectQueryBuilder<Department> {
    const queryBuilder = this.repository
      .createQueryBuilder('department')
      .leftJoinAndSelect('department.businessUnit', 'businessUnit');
    if (query.includeDeleted) queryBuilder.withDeleted();
    if (query.search) {
      queryBuilder.andWhere(
        '(department.name ILIKE :search OR department.departmentCode ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }
    if (query.status) {
      queryBuilder.andWhere('department.isActive = :isActive', {
        isActive: query.status === 'active',
      });
    }
    queryBuilder.orderBy('department.name', 'ASC');
    return queryBuilder;
  }
}
