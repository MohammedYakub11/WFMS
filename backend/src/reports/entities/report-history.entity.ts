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
import { Employee } from '../../employees/entities/employee.entity';

export type ReportType =
  | 'employees'
  | 'skills'
  | 'departments'
  | 'designations'
  | 'locations'
  | 'workforce_analytics'
  | 'audit_logs'
  | 'skill_approvals'
  | 'certifications';

export type ReportFormat = 'csv' | 'xlsx' | 'pdf';

// Only metadata is persisted — the file itself is regenerated on-demand at
// download time from reportType + filters, matching the audit-logs export
// precedent of query-time generation. No blob storage is required.
@Entity('report_history')
export class ReportHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_report_history_type')
  @Column({ name: 'report_type', type: 'varchar', length: 50 })
  reportType: ReportType;

  @Column({ name: 'format', type: 'varchar', length: 10 })
  format: ReportFormat;

  @Column({ name: 'filters', type: 'jsonb', default: {} })
  filters: Record<string, unknown>;

  @Index('idx_report_history_generated_by')
  @Column({ name: 'generated_by', type: 'uuid', nullable: true })
  generatedBy: string | null;

  @ManyToOne(() => Employee, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'generated_by' })
  generator: Employee | null;

  @Column({ name: 'status', type: 'varchar', length: 20, default: 'completed' })
  status: 'completed' | 'failed';

  @Column({ name: 'row_count', type: 'int', nullable: true })
  rowCount: number | null;

  @Column({ name: 'download_count', type: 'int', default: 0 })
  downloadCount: number;

  @Column({ name: 'last_downloaded_at', type: 'timestamptz', nullable: true })
  lastDownloadedAt: Date | null;

  @CreateDateColumn({ name: 'generated_at' })
  generatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
