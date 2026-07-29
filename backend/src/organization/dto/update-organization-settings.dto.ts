import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateOrganizationSettingsDto {
  @IsInt()
  @Min(4)
  @IsOptional()
  passwordMinLength?: number;

  @IsBoolean()
  @IsOptional()
  passwordRequireUppercase?: boolean;

  @IsBoolean()
  @IsOptional()
  passwordRequireNumber?: boolean;

  @IsBoolean()
  @IsOptional()
  passwordRequireSpecial?: boolean;

  @IsInt()
  @Min(0)
  @IsOptional()
  passwordExpiryDays?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  passwordHistoryCount?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  maxLoginAttempts?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  lockoutDurationMinutes?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  sessionTimeoutMinutes?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  idleTimeoutMinutes?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  maxConcurrentSessions?: number;

  @IsIn(['light', 'dark', 'system'])
  @IsOptional()
  theme?: string;

  @IsString()
  @IsOptional()
  language?: string;

  @IsString()
  @IsOptional()
  dateFormat?: string;

  @IsString()
  @IsOptional()
  timeFormat?: string;

  @IsString()
  @IsOptional()
  numberFormat?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  workingDays?: string[];
}
