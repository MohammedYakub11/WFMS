import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Holiday } from './entities/holiday.entity';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';
import { HolidayListQueryDto } from './dto/holiday-list-query.dto';
import { AuditLogService } from '../audit-logs/audit-log.service';

@Injectable()
export class HolidaysService {
  constructor(
    @InjectRepository(Holiday)
    private readonly repository: Repository<Holiday>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(dto: CreateHolidayDto, actorId?: string): Promise<Holiday> {
    const saved = await this.repository.save(this.repository.create(dto));
    await this.auditLogService.record({
      userId: actorId,
      module: 'ORGANIZATION',
      entity: 'Holiday',
      entityId: saved.id,
      action: 'CREATE',
      newValue: { name: saved.name, date: saved.date },
    });
    return this.findOne(saved.id);
  }

  async findAll(query: HolidayListQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const [items, total] = await this.buildFindQuery(query)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<Holiday> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['location'],
    });
    if (!entity) throw new NotFoundException(`Holiday with ID ${id} not found`);
    return entity;
  }

  async update(
    id: string,
    dto: UpdateHolidayDto,
    actorId?: string,
  ): Promise<Holiday> {
    const entity = await this.findOne(id);
    const oldValue = { name: entity.name, date: entity.date };
    Object.assign(entity, dto);
    const saved = await this.repository.save(entity);
    await this.auditLogService.record({
      userId: actorId,
      module: 'ORGANIZATION',
      entity: 'Holiday',
      entityId: id,
      action: 'UPDATE',
      oldValue,
      newValue: { name: saved.name, date: saved.date },
    });
    return this.findOne(id);
  }

  async remove(id: string, actorId?: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repository.softRemove(entity);
    await this.auditLogService.record({
      userId: actorId,
      module: 'ORGANIZATION',
      entity: 'Holiday',
      entityId: id,
      action: 'DELETE',
      oldValue: { name: entity.name },
    });
  }

  async restore(id: string, actorId?: string): Promise<Holiday> {
    const entity = await this.repository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!entity) throw new NotFoundException(`Holiday with ID ${id} not found`);
    await this.repository.restore(id);
    await this.auditLogService.record({
      userId: actorId,
      module: 'ORGANIZATION',
      entity: 'Holiday',
      entityId: id,
      action: 'RESTORE',
      newValue: { name: entity.name },
    });
    return this.findOne(id);
  }

  private buildFindQuery(
    query: HolidayListQueryDto,
  ): SelectQueryBuilder<Holiday> {
    const queryBuilder = this.repository
      .createQueryBuilder('holiday')
      .leftJoinAndSelect('holiday.location', 'location');
    if (query.year) {
      queryBuilder.andWhere('EXTRACT(YEAR FROM holiday.date) = :year', {
        year: query.year,
      });
    }
    if (query.locationId) {
      queryBuilder.andWhere(
        '(holiday.locationId = :locationId OR holiday.locationId IS NULL)',
        { locationId: query.locationId },
      );
    }
    queryBuilder.orderBy('holiday.date', 'ASC');
    return queryBuilder;
  }
}
