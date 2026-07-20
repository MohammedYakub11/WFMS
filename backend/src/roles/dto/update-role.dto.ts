import { PartialType, OmitType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateRoleDto } from './create-role.dto';

// Permission changes go through the dedicated PUT /roles/:id/permissions endpoint, not this one.
export class UpdateRoleDto extends PartialType(
  OmitType(CreateRoleDto, ['permissionCodes'] as const),
) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
