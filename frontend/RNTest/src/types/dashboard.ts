export interface TopSkill {
  name: string;
  count: number;
}

export interface TrendInfo {
  percentage: number;
  positive: boolean;
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
