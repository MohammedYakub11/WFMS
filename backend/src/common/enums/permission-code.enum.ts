// Fixed, seeded permission catalog per the PRD's Permission Categories section.
// Permissions are never user-created — only role-to-permission assignment is dynamic.
export enum PermissionCode {
  // Authentication
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  RESET_PASSWORD = 'RESET_PASSWORD',

  // Employee Management
  EMPLOYEE_VIEW = 'EMPLOYEE_VIEW',
  EMPLOYEE_CREATE = 'EMPLOYEE_CREATE',
  EMPLOYEE_UPDATE = 'EMPLOYEE_UPDATE',
  EMPLOYEE_DELETE = 'EMPLOYEE_DELETE',

  // Skill Management
  SKILL_VIEW = 'SKILL_VIEW',
  SKILL_CREATE = 'SKILL_CREATE',
  SKILL_UPDATE = 'SKILL_UPDATE',
  SKILL_DELETE = 'SKILL_DELETE',

  // Skill Category Management
  CATEGORY_VIEW = 'CATEGORY_VIEW',
  CATEGORY_CREATE = 'CATEGORY_CREATE',
  CATEGORY_UPDATE = 'CATEGORY_UPDATE',
  CATEGORY_DELETE = 'CATEGORY_DELETE',

  // Employee Skill Management
  EMPLOYEE_SKILL_VIEW = 'EMPLOYEE_SKILL_VIEW',
  EMPLOYEE_SKILL_UPDATE = 'EMPLOYEE_SKILL_UPDATE',
  EMPLOYEE_SKILL_DELETE = 'EMPLOYEE_SKILL_DELETE',

  // Search & Analytics
  SEARCH_EMPLOYEES = 'SEARCH_EMPLOYEES',
  VIEW_DASHBOARD = 'VIEW_DASHBOARD',
  VIEW_ANALYTICS = 'VIEW_ANALYTICS',
  EXPORT_REPORTS = 'EXPORT_REPORTS',

  // Administration
  USER_MANAGEMENT = 'USER_MANAGEMENT',
  ROLE_MANAGEMENT = 'ROLE_MANAGEMENT',
  PERMISSION_MANAGEMENT = 'PERMISSION_MANAGEMENT',
  SYSTEM_CONFIGURATION = 'SYSTEM_CONFIGURATION',
  VIEW_AUDIT_LOGS = 'VIEW_AUDIT_LOGS',

  // Notifications
  NOTIFICATION_SEND = 'NOTIFICATION_SEND',
}

export const PERMISSION_CATALOG: Array<{
  code: PermissionCode;
  name: string;
  category: string;
}> = [
  { code: PermissionCode.LOGIN, name: 'Login', category: 'Authentication' },
  { code: PermissionCode.LOGOUT, name: 'Logout', category: 'Authentication' },
  {
    code: PermissionCode.RESET_PASSWORD,
    name: 'Reset Password',
    category: 'Authentication',
  },

  {
    code: PermissionCode.EMPLOYEE_VIEW,
    name: 'View Employee Directory',
    category: 'Employee Management',
  },
  {
    code: PermissionCode.EMPLOYEE_CREATE,
    name: 'Create Employee',
    category: 'Employee Management',
  },
  {
    code: PermissionCode.EMPLOYEE_UPDATE,
    name: 'Update Employee',
    category: 'Employee Management',
  },
  {
    code: PermissionCode.EMPLOYEE_DELETE,
    name: 'Delete Employee',
    category: 'Employee Management',
  },

  {
    code: PermissionCode.SKILL_VIEW,
    name: 'View Skills',
    category: 'Skill Management',
  },
  {
    code: PermissionCode.SKILL_CREATE,
    name: 'Create Skill',
    category: 'Skill Management',
  },
  {
    code: PermissionCode.SKILL_UPDATE,
    name: 'Update Skill',
    category: 'Skill Management',
  },
  {
    code: PermissionCode.SKILL_DELETE,
    name: 'Delete Skill',
    category: 'Skill Management',
  },

  {
    code: PermissionCode.CATEGORY_VIEW,
    name: 'View Skill Categories',
    category: 'Skill Category Management',
  },
  {
    code: PermissionCode.CATEGORY_CREATE,
    name: 'Create Skill Category',
    category: 'Skill Category Management',
  },
  {
    code: PermissionCode.CATEGORY_UPDATE,
    name: 'Update Skill Category',
    category: 'Skill Category Management',
  },
  {
    code: PermissionCode.CATEGORY_DELETE,
    name: 'Delete Skill Category',
    category: 'Skill Category Management',
  },

  {
    code: PermissionCode.EMPLOYEE_SKILL_VIEW,
    name: 'View Employee Skills',
    category: 'Employee Skill Management',
  },
  {
    code: PermissionCode.EMPLOYEE_SKILL_UPDATE,
    name: 'Update Employee Skills',
    category: 'Employee Skill Management',
  },
  {
    code: PermissionCode.EMPLOYEE_SKILL_DELETE,
    name: 'Delete Employee Skills',
    category: 'Employee Skill Management',
  },

  {
    code: PermissionCode.SEARCH_EMPLOYEES,
    name: 'Search Employees',
    category: 'Search & Analytics',
  },
  {
    code: PermissionCode.VIEW_DASHBOARD,
    name: 'View Dashboard',
    category: 'Search & Analytics',
  },
  {
    code: PermissionCode.VIEW_ANALYTICS,
    name: 'View Analytics',
    category: 'Search & Analytics',
  },
  {
    code: PermissionCode.EXPORT_REPORTS,
    name: 'Export Reports',
    category: 'Search & Analytics',
  },

  {
    code: PermissionCode.USER_MANAGEMENT,
    name: 'Manage Users',
    category: 'Administration',
  },
  {
    code: PermissionCode.ROLE_MANAGEMENT,
    name: 'Manage Roles',
    category: 'Administration',
  },
  {
    code: PermissionCode.PERMISSION_MANAGEMENT,
    name: 'Manage Permissions',
    category: 'Administration',
  },
  {
    code: PermissionCode.SYSTEM_CONFIGURATION,
    name: 'System Configuration',
    category: 'Administration',
  },
  {
    code: PermissionCode.VIEW_AUDIT_LOGS,
    name: 'View Audit Logs',
    category: 'Administration',
  },

  {
    code: PermissionCode.NOTIFICATION_SEND,
    name: 'Send Notifications',
    category: 'Notifications',
  },
];
