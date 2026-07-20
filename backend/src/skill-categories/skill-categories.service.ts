import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, SelectQueryBuilder } from 'typeorm';
import { SkillCategory } from './entities/skill-category.entity';
import { CreateSkillCategoryDto } from './dto/create-skill-category.dto';
import { UpdateSkillCategoryDto } from './dto/update-skill-category.dto';
import { SkillCategoryListQueryDto } from './dto/skill-category-list-query.dto';
import { BulkSkillActionDto } from '../skills/dto/bulk-skill-action.dto';
import { BulkDeleteDto } from '../skills/dto/bulk-delete.dto';
import { AuditLogService } from '../audit-logs/audit-log.service';

@Injectable()
export class SkillCategoriesService {
  constructor(
    @InjectRepository(SkillCategory)
    private readonly categoryRepository: Repository<SkillCategory>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(
    createDto: CreateSkillCategoryDto,
    actorId?: string,
  ): Promise<SkillCategory> {
    const category = this.categoryRepository.create(createDto);
    const saved = await this.categoryRepository.save(category);

    await this.auditLogService.record({
      userId: actorId,
      module: 'SKILL_CATEGORIES',
      entity: 'SkillCategory',
      entityId: saved.id,
      action: 'CREATE',
      newValue: { categoryName: saved.categoryName },
    });

    return saved;
  }

  async findAll(query: SkillCategoryListQueryDto): Promise<{
    items: SkillCategory[];
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

  async findOne(id: string): Promise<SkillCategory> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`SkillCategory with ID ${id} not found`);
    }
    return category;
  }

  async update(
    id: string,
    updateDto: UpdateSkillCategoryDto,
    actorId?: string,
  ): Promise<SkillCategory> {
    const category = await this.findOne(id);

    const oldValue = {
      categoryName: category.categoryName,
      description: category.description,
      isActive: category.isActive,
    };

    Object.assign(category, updateDto);
    const saved = await this.categoryRepository.save(category);

    await this.auditLogService.record({
      userId: actorId,
      module: 'SKILL_CATEGORIES',
      entity: 'SkillCategory',
      entityId: id,
      action: 'UPDATE',
      oldValue,
      newValue: {
        categoryName: saved.categoryName,
        description: saved.description,
        isActive: saved.isActive,
      },
    });

    return saved;
  }

  async remove(id: string, actorId?: string): Promise<void> {
    const category = await this.findOne(id);
    await this.categoryRepository.softRemove(category);

    await this.auditLogService.record({
      userId: actorId,
      module: 'SKILL_CATEGORIES',
      entity: 'SkillCategory',
      entityId: id,
      action: 'DELETE',
      oldValue: { categoryName: category.categoryName },
    });
  }

  async restore(id: string, actorId?: string): Promise<SkillCategory> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!category) {
      throw new NotFoundException(`SkillCategory with ID ${id} not found`);
    }
    if (!category.deletedAt) {
      throw new ConflictException('SkillCategory is not deleted');
    }

    await this.categoryRepository.restore(id);

    await this.auditLogService.record({
      userId: actorId,
      module: 'SKILL_CATEGORIES',
      entity: 'SkillCategory',
      entityId: id,
      action: 'RESTORE',
      newValue: { categoryName: category.categoryName },
    });

    return this.findOne(id);
  }

  async setStatus(
    id: string,
    isActive: boolean,
    actorId?: string,
  ): Promise<SkillCategory> {
    const category = await this.findOne(id);
    const oldIsActive = category.isActive;
    category.isActive = isActive;
    const saved = await this.categoryRepository.save(category);

    await this.auditLogService.record({
      userId: actorId,
      module: 'SKILL_CATEGORIES',
      entity: 'SkillCategory',
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

    const affected = await this.categoryRepository.manager.transaction(
      async (manager) => {
        const result = await manager.update(
          SkillCategory,
          { id: In(dto.ids) },
          { isActive },
        );
        return result.affected ?? 0;
      },
    );

    await this.auditLogService.record({
      userId: actorId,
      module: 'SKILL_CATEGORIES',
      entity: 'SkillCategory',
      action: isActive ? 'BULK_ACTIVATE' : 'BULK_DEACTIVATE',
      newValue: { ids: dto.ids },
    });

    return { requested: dto.ids.length, affected };
  }

  async bulkDelete(
    dto: BulkDeleteDto,
    actorId?: string,
  ): Promise<{ requested: number; affected: number }> {
    const categories = await this.categoryRepository.find({
      where: { id: In(dto.ids) },
    });
    await this.categoryRepository.softRemove(categories);

    await this.auditLogService.record({
      userId: actorId,
      module: 'SKILL_CATEGORIES',
      entity: 'SkillCategory',
      action: 'BULK_DELETE',
      newValue: { ids: dto.ids },
    });

    return { requested: dto.ids.length, affected: categories.length };
  }

  async exportRows(
    query: SkillCategoryListQueryDto,
    format: string,
    actorId?: string,
  ): Promise<SkillCategory[]> {
    const rows = await this.buildFindQuery(query).take(50000).getMany();

    await this.auditLogService.record({
      userId: actorId,
      module: 'SKILL_CATEGORIES',
      entity: 'SkillCategory',
      action: 'EXPORT',
      newValue: {
        format,
        count: rows.length,
        filters: {
          search: query.search,
          status: query.status,
          includeDeleted: query.includeDeleted,
        },
      },
    });

    return rows;
  }

  private buildFindQuery(
    query: SkillCategoryListQueryDto,
  ): SelectQueryBuilder<SkillCategory> {
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'DESC';

    const queryBuilder = this.categoryRepository.createQueryBuilder('category');

    if (query.includeDeleted) {
      queryBuilder.withDeleted();
    }
    if (query.search) {
      queryBuilder.andWhere('category.categoryName ILIKE :search', {
        search: `%${query.search}%`,
      });
    }
    if (query.status) {
      queryBuilder.andWhere('category.isActive = :isActive', {
        isActive: query.status === 'active',
      });
    }

    queryBuilder.orderBy(`category.${sortBy}`, sortOrder as 'ASC' | 'DESC');

    return queryBuilder;
  }
}
