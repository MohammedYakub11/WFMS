import { MigrationInterface, QueryRunner } from 'typeorm';

type IdRow = { id: string };

const NEW_PERMISSIONS: Array<{ code: string; name: string; category: string }> =
  [
    {
      code: 'REPORT_VIEW',
      name: 'View Reports',
      category: 'Search & Analytics',
    },
    {
      code: 'ORGANIZATION_MANAGEMENT',
      name: 'Manage Organization Settings',
      category: 'Administration',
    },
  ];

// Administrator gets both (role already receives every permission code via the
// application-level ROLE_PERMISSION_MATRIX, this migration mirrors that for the
// seeded DB rows). Workforce Manager / Resource Manager get REPORT_VIEW only.
const REPORT_VIEW_ROLES = [
  'Administrator',
  'Workforce Manager',
  'Resource Manager',
];
const ORG_MANAGEMENT_ROLES = ['Administrator'];

export class SeedReportsOrgRbac1784700200000 implements MigrationInterface {
  name = 'SeedReportsOrgRbac1784700200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const permission of NEW_PERMISSIONS) {
      await queryRunner.query(
        `INSERT INTO "permissions" ("code", "name", "category") VALUES ($1, $2, $3) ON CONFLICT ("code") DO NOTHING`,
        [permission.code, permission.name, permission.category],
      );
    }

    await this.assignToRoles(queryRunner, 'REPORT_VIEW', REPORT_VIEW_ROLES);
    await this.assignToRoles(
      queryRunner,
      'ORGANIZATION_MANAGEMENT',
      ORG_MANAGEMENT_ROLES,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const permission of NEW_PERMISSIONS) {
      const [row] = (await queryRunner.query(
        `SELECT "id" FROM "permissions" WHERE "code" = $1`,
        [permission.code],
      )) as IdRow[];
      if (row) {
        await queryRunner.query(
          `DELETE FROM "role_permissions" WHERE "permission_id" = $1`,
          [row.id],
        );
      }
      await queryRunner.query(`DELETE FROM "permissions" WHERE "code" = $1`, [
        permission.code,
      ]);
    }
  }

  private async assignToRoles(
    queryRunner: QueryRunner,
    permissionCode: string,
    roleNames: string[],
  ): Promise<void> {
    const [permission] = (await queryRunner.query(
      `SELECT "id" FROM "permissions" WHERE "code" = $1`,
      [permissionCode],
    )) as IdRow[];
    if (!permission) return;

    for (const roleName of roleNames) {
      const [role] = (await queryRunner.query(
        `SELECT "id" FROM "roles" WHERE "name" = $1`,
        [roleName],
      )) as IdRow[];
      if (!role) continue;

      await queryRunner.query(
        `INSERT INTO "role_permissions" ("role_id", "permission_id") VALUES ($1, $2) ON CONFLICT ("role_id", "permission_id") DO NOTHING`,
        [role.id, permission.id],
      );
    }
  }
}
