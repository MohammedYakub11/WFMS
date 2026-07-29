export interface MonthlyCountDto {
  month: string;
  count: number;
}

export class TrendsDto {
  employeeGrowth: MonthlyCountDto[];
  skillSubmissions: MonthlyCountDto[];
}
