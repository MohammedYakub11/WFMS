import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

// Single-row table: exactly one OrganizationSettings record is seeded by migration
// and only ever updated, never created/deleted through the API. Consolidates
// password policy, session policy, application preferences and working-days config
// since all are singleton, operational (non-branding) org configuration.
@Entity('organization_settings')
export class OrganizationSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Password policy
  @Column({ name: 'password_min_length', type: 'int', default: 8 })
  passwordMinLength: number;

  @Column({
    name: 'password_require_uppercase',
    type: 'boolean',
    default: true,
  })
  passwordRequireUppercase: boolean;

  @Column({ name: 'password_require_number', type: 'boolean', default: true })
  passwordRequireNumber: boolean;

  @Column({ name: 'password_require_special', type: 'boolean', default: true })
  passwordRequireSpecial: boolean;

  @Column({ name: 'password_expiry_days', type: 'int', default: 90 })
  passwordExpiryDays: number;

  @Column({ name: 'password_history_count', type: 'int', default: 5 })
  passwordHistoryCount: number;

  @Column({ name: 'max_login_attempts', type: 'int', default: 5 })
  maxLoginAttempts: number;

  @Column({ name: 'lockout_duration_minutes', type: 'int', default: 30 })
  lockoutDurationMinutes: number;

  // Session settings
  @Column({ name: 'session_timeout_minutes', type: 'int', default: 60 })
  sessionTimeoutMinutes: number;

  @Column({ name: 'idle_timeout_minutes', type: 'int', default: 15 })
  idleTimeoutMinutes: number;

  @Column({ name: 'max_concurrent_sessions', type: 'int', default: 3 })
  maxConcurrentSessions: number;

  // Application preferences
  @Column({ type: 'varchar', length: 20, default: 'light' })
  theme: string;

  @Column({ type: 'varchar', length: 10, default: 'en' })
  language: string;

  @Column({
    name: 'date_format',
    type: 'varchar',
    length: 20,
    default: 'DD/MM/YYYY',
  })
  dateFormat: string;

  @Column({ name: 'time_format', type: 'varchar', length: 10, default: '24h' })
  timeFormat: string;

  @Column({
    name: 'number_format',
    type: 'varchar',
    length: 20,
    default: '1,234.56',
  })
  numberFormat: string;

  // Working days / weekend config, drives Holiday Calendar's "weekend" concept
  @Column({
    name: 'working_days',
    type: 'jsonb',
    default: () => `'["MON","TUE","WED","THU","FRI"]'`,
  })
  workingDays: string[];

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
