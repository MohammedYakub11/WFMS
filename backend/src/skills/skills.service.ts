import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from './entities/skill.entity';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,
  ) {}

  async create(createDto: CreateSkillDto): Promise<Skill> {
    const skill = this.skillRepository.create(createDto);
    return this.skillRepository.save(skill);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    categoryId?: string,
    search?: string,
  ): Promise<{ data: Skill[]; total: number }> {
    const query = this.skillRepository.createQueryBuilder('skill').leftJoinAndSelect('skill.category', 'category');

    if (categoryId) {
      query.andWhere('skill.categoryId = :categoryId', { categoryId });
    }

    if (search) {
      query.andWhere('skill.skillName ILIKE :search', { search: `%${search}%` });
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findOne(id: string): Promise<Skill> {
    const skill = await this.skillRepository.findOne({ where: { id }, relations: ['category'] });
    if (!skill) {
      throw new NotFoundException(`Skill with ID ${id} not found`);
    }
    return skill;
  }

  async update(id: string, updateDto: UpdateSkillDto): Promise<Skill> {
    const skill = await this.findOne(id);
    Object.assign(skill, updateDto);
    return this.skillRepository.save(skill);
  }

  async remove(id: string): Promise<void> {
    const skill = await this.findOne(id);
    await this.skillRepository.softRemove(skill);
  }
}
