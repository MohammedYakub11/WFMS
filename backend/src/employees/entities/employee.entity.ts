import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate, OneToOne, OneToMany, Index } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ProfileMetadata } from './profile-metadata.entity';
import { EmployeeSkill } from '../../employee-skills/entities/employee-skill.entity';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_employee_code')
  @Column({ unique: true })
  employee_code: string;

  @Index('idx_employee_first_name')
  @Column()
  first_name: string;

  @Index('idx_employee_last_name')
  @Column()
  last_name: string;

  @Index('idx_employee_email')
  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ select: false }) // Do not expose password by default
  password?: string; // Optional for users authenticated through other means later, but required for local login

  @Index('idx_employee_designation')
  @Column({ nullable: true })
  designation: string;

  @Index('idx_employee_department')
  @Column({ nullable: true })
  department: string;

  @Column({ type: 'int', default: 0 })
  experience: number;

  @Index('idx_employee_location')
  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  profile_image: string;

  @Column({ default: 'active' })
  status: string;

  @OneToOne(() => ProfileMetadata, metadata => metadata.employee, { cascade: true })
  profile_metadata: ProfileMetadata;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => EmployeeSkill, (employeeSkill) => employeeSkill.employee)
  employeeSkills: EmployeeSkill[];

  // Hash password before inserting or updating if it has been changed
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt();
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(password, this.password);
  }
}
