export type DashboardActivityType = 'skill_status_change' | 'new_employee';

export class DashboardActivityItemDto {
  type: DashboardActivityType;
  title: string;
  subtitle?: string;
  timestamp: string;
  status?: string;
}
