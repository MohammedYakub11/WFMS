import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateEmployeeDto } from './create-employee.dto';

// Password changes are explicitly out of this generic update path — would need a
// dedicated change-password/reset flow. roleId assignment goes through POST /roles/assignments
// (RolesService.assignRole) rather than this endpoint, to keep audit trail semantics
// (ROLE_ASSIGNED vs UPDATE) distinct.
export class UpdateEmployeeDto extends OmitType(
  PartialType(CreateEmployeeDto),
  ['password', 'roleId'] as const,
) {}
