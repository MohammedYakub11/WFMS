import { ApprovalBreakdownItemDto } from './dashboard-analytics.dto';

export interface TopReviewerDto {
  employeeId: string;
  name: string;
  count: number;
}

export class ApprovalsAnalyticsDto {
  statusBreakdown: ApprovalBreakdownItemDto[];
  avgReviewHours: number;
  topReviewers: TopReviewerDto[];
}
