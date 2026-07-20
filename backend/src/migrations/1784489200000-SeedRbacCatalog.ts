import { MigrationInterface, QueryRunner } from 'typeorm';

interface PermissionSeed {
  code: string;
  name: string;
  category: string;
}

type IdRow = { id: string };

const PERMISSIONS: PermissionSeed[] = [
  { code: 'LOGIN', name: 'Login', category: 'Authentication' },
  { code: 'LOGOUT', name: 'Logout', category: 'Authentication' },
  {
    code: 'RESET_PASSWORD',
    name: 'Reset Password',
    category: 'Authentication',
  },

  {
    code: 'EMPLOYEE_VIEW',
    name: 'View Employee Directory',
    category: 'Employee Management',
  },
  {
    code: 'EMPLOYEE_CREATE',
    name: 'Create Employee',
    category: 'Employee Management',
  },
  {
    code: 'EMPLOYEE_UPDATE',
    name: 'Update Employee',
    category: 'Employee Management',
  },
  {
    code: 'EMPLOYEE_DELETE',
    name: 'Delete Employee',
    category: 'Employee Management',
  },

  { code: 'SKILL_VIEW', name: 'View Skills', category: 'Skill Management' },
  { code: 'SKILL_CREATE', name: 'Create Skill', category: 'Skill Management' },
  { code: 'SKILL_UPDATE', name: 'Update Skill', category: 'Skill Management' },
  { code: 'SKILL_DELETE', name: 'Delete Skill', category: 'Skill Management' },

  {
    code: 'CATEGORY_VIEW',
    name: 'View Skill Categories',
    category: 'Skill Category Management',
  },
  {
    code: 'CATEGORY_CREATE',
    name: 'Create Skill Category',
    category: 'Skill Category Management',
  },
  {
    code: 'CATEGORY_UPDATE',
    name: 'Update Skill Category',
    category: 'Skill Category Management',
  },
  {
    code: 'CATEGORY_DELETE',
    name: 'Delete Skill Category',
    category: 'Skill Category Management',
  },

  {
    code: 'EMPLOYEE_SKILL_VIEW',
    name: 'View Employee Skills',
    category: 'Employee Skill Management',
  },
  {
    code: 'EMPLOYEE_SKILL_UPDATE',
    name: 'Update Employee Skills',
    category: 'Employee Skill Management',
  },
  {
    code: 'EMPLOYEE_SKILL_DELETE',
    name: 'Delete Employee Skills',
    category: 'Employee Skill Management',
  },

  {
    code: 'SEARCH_EMPLOYEES',
    name: 'Search Employees',
    category: 'Search & Analytics',
  },
  {
    code: 'VIEW_DASHBOARD',
    name: 'View Dashboard',
    category: 'Search & Analytics',
  },
  {
    code: 'VIEW_ANALYTICS',
    name: 'View Analytics',
    category: 'Search & Analytics',
  },
  {
    code: 'EXPORT_REPORTS',
    name: 'Export Reports',
    category: 'Search & Analytics',
  },

  { code: 'USER_MANAGEMENT', name: 'Manage Users', category: 'Administration' },
  { code: 'ROLE_MANAGEMENT', name: 'Manage Roles', category: 'Administration' },
  {
    code: 'PERMISSION_MANAGEMENT',
    name: 'Manage Permissions',
    category: 'Administration',
  },
  {
    code: 'SYSTEM_CONFIGURATION',
    name: 'System Configuration',
    category: 'Administration',
  },
  {
    code: 'VIEW_AUDIT_LOGS',
    name: 'View Audit Logs',
    category: 'Administration',
  },
];

const EMPLOYEE_PERMS = [
  'LOGIN',
  'LOGOUT',
  'RESET_PASSWORD',
  'SKILL_VIEW',
  'CATEGORY_VIEW',
  'EMPLOYEE_SKILL_VIEW',
  'EMPLOYEE_SKILL_UPDATE',
  'EMPLOYEE_SKILL_DELETE',
];

const MANAGER_PERMS = [
  'LOGIN',
  'LOGOUT',
  'RESET_PASSWORD',
  'EMPLOYEE_VIEW',
  'SKILL_VIEW',
  'SKILL_CREATE',
  'SKILL_UPDATE',
  'SKILL_DELETE',
  'CATEGORY_VIEW',
  'EMPLOYEE_SKILL_VIEW',
  'EMPLOYEE_SKILL_UPDATE',
  'EMPLOYEE_SKILL_DELETE',
  'SEARCH_EMPLOYEES',
  'VIEW_DASHBOARD',
  'VIEW_ANALYTICS',
  'EXPORT_REPORTS',
];

const ADMIN_PERMS = PERMISSIONS.map((p) => p.code);

const ROLE_PERMISSIONS: Record<string, string[]> = {
  Employee: EMPLOYEE_PERMS,
  'Workforce Manager': MANAGER_PERMS,
  'Resource Manager': MANAGER_PERMS,
  Administrator: ADMIN_PERMS,
};

export class SeedRbacCatalog1784489200000 implements MigrationInterface {
  name = 'SeedRbacCatalog1784489200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Permissions
    for (const p of PERMISSIONS) {
      await queryRunner.query(
        `INSERT INTO "permissions" ("code", "name", "category") VALUES ($1, $2, $3) ON CONFLICT ("code") DO NOTHING`,
        [p.code, p.name, p.category],
      );
    }

    // Roles
    const roleNames = [
      'Employee',
      'Workforce Manager',
      'Resource Manager',
      'Administrator',
    ];
    for (const name of roleNames) {
      await queryRunner.query(
        `INSERT INTO "roles" ("name", "description", "is_system") VALUES ($1, $2, true) ON CONFLICT ("name") DO NOTHING`,
        [name, `System-seeded ${name} role`],
      );
    }

    // Role -> Permission mappings
    for (const [roleName, codes] of Object.entries(ROLE_PERMISSIONS)) {
      const [role] = (await queryRunner.query(
        `SELECT "id" FROM "roles" WHERE "name" = $1`,
        [roleName],
      )) as IdRow[];
      if (!role) continue;

      for (const code of codes) {
        const [permission] = (await queryRunner.query(
          `SELECT "id" FROM "permissions" WHERE "code" = $1`,
          [code],
        )) as IdRow[];
        if (!permission) continue;

        await queryRunner.query(
          `INSERT INTO "role_permissions" ("role_id", "permission_id") VALUES ($1, $2) ON CONFLICT ("role_id", "permission_id") DO NOTHING`,
          [role.id, permission.id],
        );
      }
    }

    // Assign the existing seeded admin employee to the Administrator role, if not already assigned.
    const [adminEmployee] = (await queryRunner.query(
      `SELECT "id" FROM "employees" WHERE "email" = $1`,
      ['admin@wfms.com'],
    )) as IdRow[];
    if (adminEmployee) {
      const [adminRole] = (await queryRunner.query(
        `SELECT "id" FROM "roles" WHERE "name" = $1`,
        ['Administrator'],
      )) as IdRow[];
      const [existingAssignment] = (await queryRunner.query(
        `SELECT "id" FROM "employee_roles" WHERE "employee_id" = $1 AND "deleted_at" IS NULL`,
        [adminEmployee.id],
      )) as IdRow[];
      if (adminRole && !existingAssignment) {
        await queryRunner.query(
          `INSERT INTO "employee_roles" ("employee_id", "role_id") VALUES ($1, $2)`,
          [adminEmployee.id, adminRole.id],
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const [adminEmployee] = (await queryRunner.query(
      `SELECT "id" FROM "employees" WHERE "email" = $1`,
      ['admin@wfms.com'],
    )) as IdRow[];
    if (adminEmployee) {
      await queryRunner.query(
        `DELETE FROM "employee_roles" WHERE "employee_id" = $1`,
        [adminEmployee.id],
      );
    }
    await queryRunner.query(`DELETE FROM "role_permissions"`);
    await queryRunner.query(
      `DELETE FROM "roles" WHERE "name" IN ('Employee', 'Workforce Manager', 'Resource Manager', 'Administrator')`,
    );
    await queryRunner.query(
      `DELETE FROM "permissions" WHERE "code" IN (${PERMISSIONS.map((_, i) => `$${i + 1}`).join(', ')})`,
      PERMISSIONS.map((p) => p.code),
    );
  }
}
