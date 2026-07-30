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

// `icon` values are Octicons glyph names (see components/AppIcon.tsx) — the
// app's single icon family, not raw emoji.
export const REPORT_TYPE_OPTIONS: ReportTypeOption[] = [
  { type: 'employees', label: 'Employees', icon: 'people', description: 'Employee directory data' },
  { type: 'skills', label: 'Skills', icon: 'star', description: 'Skill catalog data' },
  { type: 'departments', label: 'Departments', icon: 'organization', description: 'Workforce by department' },
  { type: 'designations', label: 'Designations', icon: 'briefcase', description: 'Workforce by designation' },
  { type: 'locations', label: 'Locations', icon: 'location', description: 'Workforce by location' },
  { type: 'workforce_analytics', label: 'Workforce Analytics', icon: 'graph', description: 'Cross-dimension workforce breakdown' },
  { type: 'audit_logs', label: 'Audit Logs', icon: 'history', description: 'System activity trail' },
  { type: 'skill_approvals', label: 'Skill Approvals', icon: 'check-circle', description: 'Skill approval workflow status' },
  { type: 'certifications', label: 'Certifications', icon: 'verified', description: 'Employee certifications' },
];
