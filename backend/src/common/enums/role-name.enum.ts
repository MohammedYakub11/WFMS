// The 4 canonical roles per the PRD's User Roles / Permission Matrix section.
export enum RoleName {
  EMPLOYEE = 'Employee',
  WORKFORCE_MANAGER = 'Workforce Manager',
  RESOURCE_MANAGER = 'Resource Manager',
  ADMINISTRATOR = 'Administrator',
}

// Permission Matrix, verbatim from the PRD, keyed by role name.
// Used only by the migration/seeder to populate role_permissions — not read at request time.
import { PermissionCode } from './permission-code.enum';

export const ROLE_PERMISSION_MATRIX: Record<RoleName, PermissionCode[]> = {
  [RoleName.EMPLOYEE]: [
    PermissionCode.LOGIN,
    PermissionCode.LOGOUT,
    PermissionCode.RESET_PASSWORD,
    PermissionCode.SKILL_VIEW,
    PermissionCode.CATEGORY_VIEW,
    PermissionCode.EMPLOYEE_SKILL_VIEW,
    PermissionCode.EMPLOYEE_SKILL_UPDATE,
    PermissionCode.EMPLOYEE_SKILL_DELETE,
    PermissionCode.VIEW_DASHBOARD,
  ],
  [RoleName.WORKFORCE_MANAGER]: [
    PermissionCode.LOGIN,
    PermissionCode.LOGOUT,
    PermissionCode.RESET_PASSWORD,
    PermissionCode.EMPLOYEE_VIEW,
    PermissionCode.SKILL_VIEW,
    PermissionCode.SKILL_CREATE,
    PermissionCode.SKILL_UPDATE,
    PermissionCode.SKILL_DELETE,
    PermissionCode.CATEGORY_VIEW,
    PermissionCode.EMPLOYEE_SKILL_VIEW,
    PermissionCode.EMPLOYEE_SKILL_UPDATE,
    PermissionCode.EMPLOYEE_SKILL_DELETE,
    PermissionCode.SEARCH_EMPLOYEES,
    PermissionCode.VIEW_DASHBOARD,
    PermissionCode.VIEW_ANALYTICS,
    PermissionCode.EXPORT_REPORTS,
    PermissionCode.REPORT_VIEW,
  ],
  [RoleName.RESOURCE_MANAGER]: [
    PermissionCode.LOGIN,
    PermissionCode.LOGOUT,
    PermissionCode.RESET_PASSWORD,
    PermissionCode.EMPLOYEE_VIEW,
    PermissionCode.SKILL_VIEW,
    PermissionCode.SKILL_CREATE,
    PermissionCode.SKILL_UPDATE,
    PermissionCode.SKILL_DELETE,
    PermissionCode.CATEGORY_VIEW,
    PermissionCode.EMPLOYEE_SKILL_VIEW,
    PermissionCode.EMPLOYEE_SKILL_UPDATE,
    PermissionCode.EMPLOYEE_SKILL_DELETE,
    PermissionCode.SEARCH_EMPLOYEES,
    PermissionCode.VIEW_DASHBOARD,
    PermissionCode.VIEW_ANALYTICS,
    PermissionCode.EXPORT_REPORTS,
    PermissionCode.REPORT_VIEW,
  ],
  [RoleName.ADMINISTRATOR]: Object.values(PermissionCode),
};
