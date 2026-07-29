import { IsIn } from 'class-validator';

export class DownloadReportQueryDto {
  @IsIn(['csv', 'xlsx', 'pdf'])
  format: 'csv' | 'xlsx' | 'pdf';
}
