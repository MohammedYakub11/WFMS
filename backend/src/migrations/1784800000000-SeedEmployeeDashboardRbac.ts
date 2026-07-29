import { MigrationInterface, QueryRunner } from 'typeorm';

type IdRow = { id: string };

// The Employee role was seeded without VIEW_DASHBOARD, so employees got a 403
// from PermissionsGuard on GET /dashboard/summary and saw a blank dashboard.
// Grants only VIEW_DASHBOARD (not VIEW_ANALYTICS, which stays manager/admin-only
// per the PRD permission matrix).
export class SeedEmployeeDashboardRbac1784800000000
  implements MigrationInterface
{
  name = 'SeedEmployeeDashboardRbac1784800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.setEmployeeViewDashboard(queryRunner, true);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await this.setEmployeeViewDashboard(queryRunner, false);
  }

  private async setEmployeeViewDashboard(
    queryRunner: QueryRunner,
    grant: boolean,
  ): Promise<void> {
    const [role] = (await queryRunner.query(
      `SELECT "id" FROM "roles" WHERE "name" = $1`,
      ['Employee'],
    )) as IdRow[];
    if (!role) return;

    const [permission] = (await queryRunner.query(
      `SELECT "id" FROM "permissions" WHERE "code" = $1`,
      ['VIEW_DASHBOARD'],
    )) as IdRow[];
    if (!permission) return;

    if (grant) {
      await queryRunner.query(
        `INSERT INTO "role_permissions" ("role_id", "permission_id") VALUES ($1, $2) ON CONFLICT ("role_id", "permission_id") DO NOTHING`,
        [role.id, permission.id],
      );
    } else {
      await queryRunner.query(
        `DELETE FROM "role_permissions" WHERE "role_id" = $1 AND "permission_id" = $2`,
        [role.id, permission.id],
      );
    }
  }
}
