import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class ReportFiltersDto {
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  designation?: string;

  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @IsOptional()
  @IsUUID()
  skillId?: string;

  @IsOptional()
  @IsUUID()
  skillCategoryId?: string;

  @IsOptional()
  @IsIn(['pending', 'approved', 'rejected', 'changes_requested'])
  approvalStatus?: string;

  @IsOptional()
  @IsIn(['certified', 'not_certified'])
  certificationStatus?: string;

  @IsOptional()
  @IsString()
  location?: string;
}
