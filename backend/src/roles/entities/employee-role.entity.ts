import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Role } from './role.entity';
import { Employee } from '../../employees/entities/employee.entity';

// One active role per employee, enforced via a partial unique index created in the migration
// (CREATE UNIQUE INDEX ... WHERE deleted_at IS NULL) — not expressible via TypeORM decorators.
// Reassignment = soft-delete the current active row + insert a new one, in one transaction.
@Entity('employee_roles')
export class EmployeeRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'employee_id', type: 'uuid' })
  employeeId: string;

  @Index('idx_employee_roles_role_id')
  @Column({ name: 'role_id', type: 'uuid' })
  roleId: string;

  @Column({ name: 'assigned_by', type: 'uuid', nullable: true })
  assignedBy: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @ManyToOne(() => Employee, (employee) => employee.employeeRoles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @ManyToOne(() => Role, (role) => role.employeeRoles, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => Employee, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assigned_by' })
  assignedByEmployee: Employee | null;
}
