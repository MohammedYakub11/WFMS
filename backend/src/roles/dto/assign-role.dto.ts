import { IsUUID } from 'class-validator';

export class AssignRoleDto {
  @IsUUID()
  employeeId: string;

  @IsUUID()
  roleId: string;
}
