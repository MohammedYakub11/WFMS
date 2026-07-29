import { Type } from 'class-transformer';
import { IsIn, ValidateNested } from 'class-validator';
import { ReportFiltersDto } from './report-filters.dto';
import type {
  ReportType,
  ReportFormat,
} from '../entities/report-history.entity';

const REPORT_TYPES: ReportType[] = [
  'employees',
  'skills',
  'departments',
  'designations',
  'locations',
  'workforce_analytics',
  'audit_logs',
  'skill_approvals',
  'certifications',
];

export class GenerateReportDto {
  @IsIn(REPORT_TYPES)
  reportType: ReportType;

  @IsIn(['csv', 'xlsx', 'pdf'])
  format: ReportFormat;

  @ValidateNested()
  @Type(() => ReportFiltersDto)
  filters: ReportFiltersDto;
}

export class PreviewReportDto {
  @IsIn(REPORT_TYPES)
  reportType: ReportType;

  @ValidateNested()
  @Type(() => ReportFiltersDto)
  filters: ReportFiltersDto;
}
