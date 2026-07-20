import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationPreferencesDto {
  @IsOptional()
  @IsBoolean()
  onSkillApproval?: boolean;

  @IsOptional()
  @IsBoolean()
  onSkillRejection?: boolean;

  @IsOptional()
  @IsBoolean()
  onRoleChange?: boolean;

  @IsOptional()
  @IsBoolean()
  onEmployeeUpdate?: boolean;

  @IsOptional()
  @IsBoolean()
  onBroadcast?: boolean;
}
