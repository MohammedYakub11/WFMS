import { Type } from 'class-transformer';
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class ReportHistoryQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  reportType?: string;

  @IsOptional()
  @IsIn(['csv', 'xlsx', 'pdf'])
  format?: string;

  @IsOptional()
  @IsUUID()
  generatedBy?: string;
}
