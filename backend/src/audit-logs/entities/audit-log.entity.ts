import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'RESTORE'
  | 'ACTIVATE'
  | 'DEACTIVATE'
  | 'ROLE_ASSIGNED'
  | 'ROLE_REVOKED'
  | 'PERMISSIONS_UPDATED'
  | 'BULK_ACTIVATE'
  | 'BULK_DEACTIVATE'
  | 'BULK_DELETE'
  | 'EXPORT'
  | 'NOTIFICATION_SENT'
  | 'LOGIN'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'PASSWORD_RESET'
  | 'SKILL_APPROVED'
  | 'SKILL_REJECTED'
  | 'CHANGES_REQUESTED';

// Immutable, write-once audit trail (PRD's exact documented schema).
// No updatedAt/deletedAt — rows are never modified or removed.
@Entity('audit_logs')
@Index('idx_audit_logs_entity_entity_id', ['entity', 'entityId'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_audit_logs_user_id')
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @Index('idx_audit_logs_module')
  @Column({ type: 'varchar', length: 100 })
  module: string;

  @Column({ type: 'varchar', length: 100 })
  entity: string;

  @Column({ name: 'entity_id', type: 'uuid', nullable: true })
  entityId: string | null;

  @Column({ type: 'varchar', length: 50 })
  action: AuditAction;

  @Column({ name: 'old_value', type: 'jsonb', nullable: true })
  oldValue: Record<string, unknown> | null;

  @Column({ name: 'new_value', type: 'jsonb', nullable: true })
  newValue: Record<string, unknown> | null;

  @Index('idx_audit_logs_created_at')
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Employee, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: Employee | null;
}
