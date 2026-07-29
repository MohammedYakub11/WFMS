export interface TopSkill {
  name: string;
  count: number;
}

export interface TrendInfo {
  percentage: number;
  positive: boolean;
}

export interface MySkillsSummary {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  changesRequested: number;
  completionPercentage: number;
}

export interface DashboardSummary {
  totalEmployees: number;
  totalSkills: number;
  departments: number;
  openRoles: number;
  topSkills: TopSkill[];
  profileCompletion: number;
  notificationCount: number;
  employeeTrend: TrendInfo;
  skillTrend: TrendInfo;
  mySkills: MySkillsSummary;
}

export interface CategoryBreakdownItem {
  categoryName: string;
  count: number;
}

export interface ApprovalBreakdownItem {
  status: string;
  count: number;
}

export interface ProficiencyBreakdownItem {
  rating: number;
  count: number;
}

export interface DashboardActivityItem {
  type: 'skill_status_change' | 'new_employee';
  title: string;
  subtitle?: string;
  timestamp: string;
  status?: string;
}

export interface DashboardAnalytics {
  skillsByCategory: CategoryBreakdownItem[];
  approvalStatusBreakdown: ApprovalBreakdownItem[];
  proficiencyDistribution: ProficiencyBreakdownItem[];
  recentActivity: DashboardActivityItem[];
}

export interface DepartmentKpi {
  department: string;
  headcount: number;
  avgExperience: number;
  approvedSkillCount: number;
  avgProficiency: number;
}

export interface SkillGapItem {
  categoryName: string;
  belowProficiencyPct: number;
  certificationGapCount: number;
}

export interface IssuingOrganizationCount {
  name: string;
  count: number;
}

export interface CertificationAnalytics {
  certifiedCount: number;
  notCertifiedCount: number;
  topIssuingOrganizations: IssuingOrganizationCount[];
  expiringSoonCount: number;
}

export interface TopReviewer {
  employeeId: string;
  name: string;
  count: number;
}

export interface ApprovalsAnalytics {
  statusBreakdown: ApprovalBreakdownItem[];
  avgReviewHours: number;
  topReviewers: TopReviewer[];
}

export interface DepartmentDesignationCount {
  department: string;
  designation: string;
  count: number;
}

export interface LocationCount {
  location: string;
  count: number;
}

export interface WorkforceDistribution {
  byDepartmentDesignation: DepartmentDesignationCount[];
  byLocation: LocationCount[];
}

export interface MonthlyCount {
  month: string;
  count: number;
}

export interface Trends {
  employeeGrowth: MonthlyCount[];
  skillSubmissions: MonthlyCount[];
}
