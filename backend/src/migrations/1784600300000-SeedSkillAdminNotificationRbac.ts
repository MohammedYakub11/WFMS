import { MigrationInterface, QueryRunner } from 'typeorm';

type IdRow = { id: string };

export class SeedSkillAdminNotificationRbac1784600300000 implements MigrationInterface {
  name = 'SeedSkillAdminNotificationRbac1784600300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "permissions" ("code", "name", "category") VALUES ($1, $2, $3) ON CONFLICT ("code") DO NOTHING`,
      ['NOTIFICATION_SEND', 'Send Notifications', 'Notifications'],
    );

    const [role] = (await queryRunner.query(
      `SELECT "id" FROM "roles" WHERE "name" = $1`,
      ['Administrator'],
    )) as IdRow[];

    if (role) {
      const [permission] = (await queryRunner.query(
        `SELECT "id" FROM "permissions" WHERE "code" = $1`,
        ['NOTIFICATION_SEND'],
      )) as IdRow[];

      if (permission) {
        await queryRunner.query(
          `INSERT INTO "role_permissions" ("role_id", "permission_id") VALUES ($1, $2) ON CONFLICT ("role_id", "permission_id") DO NOTHING`,
          [role.id, permission.id],
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const [role] = (await queryRunner.query(
      `SELECT "id" FROM "roles" WHERE "name" = $1`,
      ['Administrator'],
    )) as IdRow[];
    const [permission] = (await queryRunner.query(
      `SELECT "id" FROM "permissions" WHERE "code" = $1`,
      ['NOTIFICATION_SEND'],
    )) as IdRow[];

    if (role && permission) {
      await queryRunner.query(
        `DELETE FROM "role_permissions" WHERE "role_id" = $1 AND "permission_id" = $2`,
        [role.id, permission.id],
      );
    }

    await queryRunner.query(`DELETE FROM "permissions" WHERE "code" = $1`, [
      'NOTIFICATION_SEND',
    ]);
  }
}
