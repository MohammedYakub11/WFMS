import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, SelectQueryBuilder } from 'typeorm';
import { Skill } from './entities/skill.entity';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { SkillListQueryDto } from './dto/skill-list-query.dto';
import { BulkSkillActionDto } from './dto/bulk-skill-action.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { AuditLogService } from '../audit-logs/audit-log.service';

interface DatabaseError {
  code?: string;
  driverError?: { code?: string };
}

function isUniqueViolation(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const dbError = error as Error & DatabaseError;
  return dbError.code === '23505' || dbError.driverError?.code === '23505';
}

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(createDto: CreateSkillDto, actorId?: string): Promise<Skill> {
    const skill = this.skillRepository.create(createDto);

    let saved: Skill;
    try {
      saved = await this.skillRepository.save(skill);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('Skill code already in use');
      }
      throw error;
    }

    await this.auditLogService.record({
      userId: actorId,
      module: 'SKILLS',
      entity: 'Skill',
      entityId: saved.id,
      action: 'CREATE',
      newValue: {
        skillName: saved.skillName,
        skillCode: saved.skillCode,
        categoryId: saved.categoryId,
      },
    });

    return saved;
  }

  async findAll(query: SkillListQueryDto): Promise<{
    items: Skill[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 10;

    const [items, total] = await this.buildFindQuery(query)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<Skill> {
    const skill = await this.skillRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!skill) throw new NotFoundException(`Skill with ID ${id} not found`);
    return skill;
  }

  async update(
    id: string,
    updateDto: UpdateSkillDto,
    actorId?: string,
  ): Promise<Skill> {
    const skill = await this.findOne(id);

    const oldValue = {
      skillName: skill.skillName,
      skillCode: skill.skillCode,
      description: skill.description,
      isActive: skill.isActive,
      requiredCertification: skill.requiredCertification,
    };

    Object.assign(skill, updateDto);

    let saved: Skill;
    try {
      saved = await this.skillRepository.save(skill);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('Skill code already in use');
      }
      throw error;
    }

    await this.auditLogService.record({
      userId: actorId,
      module: 'SKILLS',
      entity: 'Skill',
      entityId: id,
      action: 'UPDATE',
      oldValue,
      newValue: {
        skillName: saved.skillName,
        skillCode: saved.skillCode,
        description: saved.description,
        isActive: saved.isActive,
        requiredCertification: saved.requiredCertification,
      },
    });

    return saved;
  }

  async remove(id: string, actorId?: string): Promise<void> {
    const skill = await this.findOne(id);
    await this.skillRepository.softRemove(skill);

    await this.auditLogService.record({
      userId: actorId,
      module: 'SKILLS',
      entity: 'Skill',
      entityId: id,
      action: 'DELETE',
      oldValue: { skillName: skill.skillName, skillCode: skill.skillCode },
    });
  }

  async restore(id: string, actorId?: string): Promise<Skill> {
    const skill = await this.skillRepository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!skill) throw new NotFoundException(`Skill with ID ${id} not found`);
    if (!skill.deletedAt) {
      throw new ConflictException('Skill is not deleted');
    }

    await this.skillRepository.restore(id);

    await this.auditLogService.record({
      userId: actorId,
      module: 'SKILLS',
      entity: 'Skill',
      entityId: id,
      action: 'RESTORE',
      newValue: { skillName: skill.skillName, skillCode: skill.skillCode },
    });

    return this.findOne(id);
  }

  async setStatus(
    id: string,
    isActive: boolean,
    actorId?: string,
  ): Promise<Skill> {
    const skill = await this.findOne(id);
    const oldIsActive = skill.isActive;
    skill.isActive = isActive;
    const saved = await this.skillRepository.save(skill);

    await this.auditLogService.record({
      userId: actorId,
      module: 'SKILLS',
      entity: 'Skill',
      entityId: id,
      action: isActive ? 'ACTIVATE' : 'DEACTIVATE',
      oldValue: { isActive: oldIsActive },
      newValue: { isActive },
    });

    return saved;
  }

  async bulkSetStatus(
    dto: BulkSkillActionDto,
    actorId?: string,
  ): Promise<{ requested: number; affected: number }> {
    const isActive = dto.action === 'activate';

    const affected = await this.skillRepository.manager.transaction(
      async (manager) => {
        const result = await manager.update(
          Skill,
          { id: In(dto.ids) },
          { isActive },
        );
        return result.affected ?? 0;
      },
    );

    await this.auditLogService.record({
      userId: actorId,
      module: 'SKILLS',
      entity: 'Skill',
      action: isActive ? 'BULK_ACTIVATE' : 'BULK_DEACTIVATE',
      newValue: { ids: dto.ids },
    });

    return { requested: dto.ids.length, affected };
  }

  async bulkDelete(
    dto: BulkDeleteDto,
    actorId?: string,
  ): Promise<{ requested: number; affected: number }> {
    const skills = await this.skillRepository.find({
      where: { id: In(dto.ids) },
    });
    await this.skillRepository.softRemove(skills);

    await this.auditLogService.record({
      userId: actorId,
      module: 'SKILLS',
      entity: 'Skill',
      action: 'BULK_DELETE',
      newValue: { ids: dto.ids },
    });

    return { requested: dto.ids.length, affected: skills.length };
  }

  async exportRows(
    query: SkillListQueryDto,
    format: string,
    actorId?: string,
  ): Promise<Skill[]> {
    const rows = await this.buildFindQuery(query).take(50000).getMany();

    await this.auditLogService.record({
      userId: actorId,
      module: 'SKILLS',
      entity: 'Skill',
      action: 'EXPORT',
      newValue: {
        format,
        count: rows.length,
        filters: {
          search: query.search,
          categoryId: query.categoryId,
          status: query.status,
          includeDeleted: query.includeDeleted,
        },
      },
    });

    return rows;
  }

  private buildFindQuery(query: SkillListQueryDto): SelectQueryBuilder<Skill> {
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'DESC';

    const queryBuilder = this.skillRepository
      .createQueryBuilder('skill')
      .leftJoinAndSelect('skill.category', 'category');

    if (query.includeDeleted) {
      queryBuilder.withDeleted();
    }
    if (query.search) {
      queryBuilder.andWhere(
        '(skill.skillName ILIKE :search OR skill.skillCode ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }
    if (query.categoryId) {
      queryBuilder.andWhere('skill.categoryId = :categoryId', {
        categoryId: query.categoryId,
      });
    }
    if (query.status) {
      queryBuilder.andWhere('skill.isActive = :isActive', {
        isActive: query.status === 'active',
      });
    }

    queryBuilder.orderBy(`skill.${sortBy}`, sortOrder as 'ASC' | 'DESC');

    return queryBuilder;
  }
}
