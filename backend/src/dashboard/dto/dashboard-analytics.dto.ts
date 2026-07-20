import { DashboardActivityItemDto } from './dashboard-activity.dto';

export interface CategoryBreakdownItemDto {
  categoryName: string;
  count: number;
}

export interface ApprovalBreakdownItemDto {
  status: string;
  count: number;
}

export interface ProficiencyBreakdownItemDto {
  rating: number;
  count: number;
}

export class DashboardAnalyticsDto {
  skillsByCategory: CategoryBreakdownItemDto[];
  approvalStatusBreakdown: ApprovalBreakdownItemDto[];
  proficiencyDistribution: ProficiencyBreakdownItemDto[];
  recentActivity: DashboardActivityItemDto[];
}
