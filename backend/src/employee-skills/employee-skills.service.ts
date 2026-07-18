import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeSkill } from './entities/employee-skill.entity';
import { CreateEmployeeSkillDto } from './dto/create-employee-skill.dto';
import { UpdateEmployeeSkillDto } from './dto/update-employee-skill.dto';

@Injectable()
export class EmployeeSkillsService {
  constructor(
    @InjectRepository(EmployeeSkill)
    private readonly employeeSkillRepository: Repository<EmployeeSkill>,
  ) {}

  async create(createDto: CreateEmployeeSkillDto): Promise<EmployeeSkill> {
    const employeeSkill = this.employeeSkillRepository.create(createDto);
    // Explicitly set pending when creating as per Phase 3.6 states
    employeeSkill.approvalStatus = 'pending';
    employeeSkill.submittedAt = new Date();
    return this.employeeSkillRepository.save(employeeSkill);
  }

  async findAll(page: number = 1, limit: number = 10, employeeId?: string, skillId?: string) {
    const query = this.employeeSkillRepository.createQueryBuilder('employeeSkill')
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

  async findPending(page: number = 1, limit: number = 10) {
    const query = this.employeeSkillRepository.createQueryBuilder('employeeSkill')
      .leftJoinAndSelect('employeeSkill.skill', 'skill')
      .leftJoinAndSelect('skill.category', 'category')
      .leftJoinAndSelect('employeeSkill.employee', 'employee')
      .where('employeeSkill.approvalStatus = :status', { status: 'pending' })
      .orderBy('employeeSkill.submittedAt', 'ASC');

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

  async update(id: string, updateDto: UpdateEmployeeSkillDto): Promise<EmployeeSkill> {
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
  async approve(id: string, reviewerId: string, comments?: string): Promise<EmployeeSkill> {
    const skill = await this.findOne(id);
    if (skill.approvalStatus === 'approved') {
      throw new BadRequestException('Skill is already approved.');
    }
    skill.previousStatus = skill.approvalStatus;
    skill.approvalStatus = 'approved';
    skill.reviewedBy = reviewerId;
    skill.reviewedAt = new Date();
    if (comments) skill.reviewComments = comments;
    return this.employeeSkillRepository.save(skill);
  }

  async reject(id: string, reviewerId: string, comments?: string): Promise<EmployeeSkill> {
    const skill = await this.findOne(id);
    if (skill.approvalStatus === 'rejected') {
      throw new BadRequestException('Skill is already rejected.');
    }
    skill.previousStatus = skill.approvalStatus;
    skill.approvalStatus = 'rejected';
    skill.reviewedBy = reviewerId;
    skill.reviewedAt = new Date();
    if (comments) skill.reviewComments = comments;
    return this.employeeSkillRepository.save(skill);
  }

  async requestChanges(id: string, reviewerId: string, comments: string): Promise<EmployeeSkill> {
    const skill = await this.findOne(id);
    skill.previousStatus = skill.approvalStatus;
    skill.approvalStatus = 'changes_requested';
    skill.reviewedBy = reviewerId;
    skill.reviewedAt = new Date();
    if (comments) skill.reviewComments = comments;
    return this.employeeSkillRepository.save(skill);
  }
}
