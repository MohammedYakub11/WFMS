import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Location } from './entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { OrgListQueryDto } from './dto/list-query.dto';
import { AuditLogService } from '../audit-logs/audit-log.service';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private readonly repository: Repository<Location>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(dto: CreateLocationDto, actorId?: string): Promise<Location> {
    const saved = await this.repository.save(this.repository.create(dto));
    await this.auditLogService.record({
      userId: actorId,
      module: 'ORGANIZATION',
      entity: 'Location',
      entityId: saved.id,
      action: 'CREATE',
      newValue: { name: saved.name, locationCode: saved.locationCode },
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

  async findOne(id: string): Promise<Location> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity)
      throw new NotFoundException(`Location with ID ${id} not found`);
    return entity;
  }

  async update(
    id: string,
    dto: UpdateLocationDto,
    actorId?: string,
  ): Promise<Location> {
    const entity = await this.findOne(id);
    const oldValue = { name: entity.name, isActive: entity.isActive };
    Object.assign(entity, dto);
    const saved = await this.repository.save(entity);
    await this.auditLogService.record({
      userId: actorId,
      module: 'ORGANIZATION',
      entity: 'Location',
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
      entity: 'Location',
      entityId: id,
      action: 'DELETE',
      oldValue: { name: entity.name },
    });
  }

  async restore(id: string, actorId?: string): Promise<Location> {
    const entity = await this.repository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!entity)
      throw new NotFoundException(`Location with ID ${id} not found`);
    if (!entity.deletedAt)
      throw new ConflictException('Location is not deleted');
    await this.repository.restore(id);
    await this.auditLogService.record({
      userId: actorId,
      module: 'ORGANIZATION',
      entity: 'Location',
      entityId: id,
      action: 'RESTORE',
      newValue: { name: entity.name },
    });
    return this.findOne(id);
  }

  async findAllForReport(): Promise<Location[]> {
    return this.repository.find({ order: { name: 'ASC' } });
  }

  private buildFindQuery(query: OrgListQueryDto): SelectQueryBuilder<Location> {
    const queryBuilder = this.repository.createQueryBuilder('location');
    if (query.includeDeleted) queryBuilder.withDeleted();
    if (query.search) {
      queryBuilder.andWhere(
        '(location.name ILIKE :search OR location.locationCode ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }
    if (query.status) {
      queryBuilder.andWhere('location.isActive = :isActive', {
        isActive: query.status === 'active',
      });
    }
    queryBuilder.orderBy('location.name', 'ASC');
    return queryBuilder;
  }
}
