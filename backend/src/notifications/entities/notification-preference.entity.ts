import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';

@Entity('notification_preferences')
export class NotificationPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'employee_id', type: 'uuid', unique: true })
  employeeId: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ name: 'on_skill_approval', type: 'boolean', default: true })
  onSkillApproval: boolean;

  @Column({ name: 'on_skill_rejection', type: 'boolean', default: true })
  onSkillRejection: boolean;

  @Column({ name: 'on_role_change', type: 'boolean', default: true })
  onRoleChange: boolean;

  @Column({ name: 'on_employee_update', type: 'boolean', default: true })
  onEmployeeUpdate: boolean;

  @Column({ name: 'on_broadcast', type: 'boolean', default: true })
  onBroadcast: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
