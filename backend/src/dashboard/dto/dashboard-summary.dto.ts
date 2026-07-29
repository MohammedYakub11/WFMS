export interface TopSkillDto {
  name: string;
  count: number;
}

export interface TrendInfoDto {
  percentage: number;
  positive: boolean;
}

export interface MySkillsSummaryDto {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  changesRequested: number;
  completionPercentage: number;
}

export class DashboardSummaryDto {
  totalEmployees: number;
  totalSkills: number;
  departments: number;
  openRoles: number;
  topSkills: TopSkillDto[];
  profileCompletion: number;
  notificationCount: number;
  employeeTrend: TrendInfoDto;
  skillTrend: TrendInfoDto;
  mySkills: MySkillsSummaryDto;
}
