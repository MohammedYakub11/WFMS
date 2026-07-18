import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  OneToMany,
  Index,
} from 'typeorm';
import { SkillCategory } from '../../skill-categories/entities/skill-category.entity';
import { EmployeeSkill } from '../../employee-skills/entities/employee-skill.entity';

@Entity('skills')
@Unique(['categoryId', 'skillName'])
export class Skill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId: string;

  @Index('idx_skill_name')
  @Column({ name: 'skill_name', type: 'varchar', length: 100 })
  skillName: string;

  @Column({ type: 'varchar', nullable: true, length: 500 })
  description: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @ManyToOne(() => SkillCategory, (category) => category.skills, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'category_id' })
  category: SkillCategory;

  @OneToMany(() => EmployeeSkill, (employeeSkill) => employeeSkill.skill)
  employeeSkills: EmployeeSkill[];
}
