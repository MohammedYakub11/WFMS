import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Employee } from './employee.entity';

@Entity('profile_metadata')
export class ProfileMetadata {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ type: 'uuid' })
  employee_id: string;

  @Column({ type: 'text', nullable: true })
  about_me: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  emergency_contact: string;

  @Column({ nullable: true })
  linkedin_url: string;

  @Column({ nullable: true })
  github_url: string;

  @Column({ nullable: true })
  twitter_url: string;

  @Column({ nullable: true })
  portfolio_url: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
