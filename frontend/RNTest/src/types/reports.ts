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

export interface ReportFilters {
  dateFrom?: string;
  dateTo?: string;
  department?: string;
  designation?: string;
  employeeId?: string;
  skillId?: string;
  skillCategoryId?: string;
  approvalStatus?: string;
  certificationStatus?: string;
  location?: string;
}

export interface ReportColumnDef {
  header: string;
  key: string;
  width?: number;
}

export interface ReportPreviewResult {
  columns: ReportColumnDef[];
  rows: Array<Record<string, unknown>>;
  total: number;
}

export interface GeneratedReportResult {
  id: string;
  rowCount: number | null;
  generatedAt: string;
}

export interface ReportHistoryEntry {
  id: string;
  reportType: ReportType;
  format: ReportFormat;
  filters: ReportFilters;
  status: 'completed' | 'failed';
  rowCount: number | null;
  downloadCount: number;
  lastDownloadedAt: string | null;
  generatedAt: string;
  generator?: { id: string; first_name: string; last_name: string } | null;
}

export interface PaginatedReportHistory {
  items: ReportHistoryEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReportTypeOption {
  type: ReportType;
  label: string;
  icon: string;
  description: string;
}

export const REPORT_TYPE_OPTIONS: ReportTypeOption[] = [
  { type: 'employees', label: 'Employees', icon: '👥', description: 'Employee directory data' },
  { type: 'skills', label: 'Skills', icon: '⚡', description: 'Skill catalog data' },
  { type: 'departments', label: 'Departments', icon: '🏢', description: 'Workforce by department' },
  { type: 'designations', label: 'Designations', icon: '🎖️', description: 'Workforce by designation' },
  { type: 'locations', label: 'Locations', icon: '📍', description: 'Workforce by location' },
  { type: 'workforce_analytics', label: 'Workforce Analytics', icon: '📊', description: 'Cross-dimension workforce breakdown' },
  { type: 'audit_logs', label: 'Audit Logs', icon: '📜', description: 'System activity trail' },
  { type: 'skill_approvals', label: 'Skill Approvals', icon: '✅', description: 'Skill approval workflow status' },
  { type: 'certifications', label: 'Certifications', icon: '🎓', description: 'Employee certifications' },
];
