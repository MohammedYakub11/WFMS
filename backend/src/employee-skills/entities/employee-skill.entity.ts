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
  Index,
} from 'typeorm';
import { Skill } from '../../skills/entities/skill.entity';
import { Employee } from '../../employees/entities/employee.entity';

@Entity('employee_skills')
@Unique(['employeeId', 'skillId'])
export class EmployeeSkill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'employee_id', type: 'uuid' })
  employeeId: string;

  @Column({ name: 'skill_id', type: 'uuid' })
  skillId: string;

  @Index('idx_emp_skill_proficiency')
  @Column({ name: 'proficiency_rating', type: 'int', default: 0 })
  proficiencyRating: number;

  @Index('idx_emp_skill_experience')
  @Column({ name: 'years_of_experience', type: 'int', nullable: true })
  yearsOfExperience: number;

  @Index('idx_emp_skill_certified')
  @Column({ name: 'is_certified', type: 'boolean', default: false })
  isCertified: boolean;

  @Column({
    name: 'certification_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  certificationName: string;

  @Column({
    name: 'issuing_organization',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  issuingOrganization: string;

  @Column({ name: 'issue_date', type: 'date', nullable: true })
  issueDate: Date;

  @Column({ name: 'expiry_date', type: 'date', nullable: true })
  expiryDate: Date;

  @Column({ name: 'last_used_date', type: 'date', nullable: true })
  lastUsedDate: Date;

  @Index('idx_emp_skill_approval')
  @Column({
    name: 'approval_status',
    type: 'varchar',
    length: 50,
    default: 'pending',
  })
  approvalStatus: string;

  @Column({ name: 'remarks', type: 'text', nullable: true })
  remarks: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' }) // Represents last_updated as per PRD
  updatedAt: Date;

  @Column({ name: 'reviewed_by', type: 'uuid', nullable: true })
  reviewedBy: string;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @Column({ name: 'review_comments', type: 'text', nullable: true })
  reviewComments: string;

  @Column({
    name: 'previous_status',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  previousStatus: string;

  @Column({ name: 'submitted_at', type: 'timestamp', nullable: true })
  submittedAt: Date;

  @Column({ name: 'resubmitted_at', type: 'timestamp', nullable: true })
  resubmittedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @ManyToOne(() => Employee, (employee) => employee.employeeSkills, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @ManyToOne(() => Skill, (skill) => skill.employeeSkills, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'skill_id' })
  skill: Skill;
}
