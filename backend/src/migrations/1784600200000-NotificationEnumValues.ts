import { MigrationInterface, QueryRunner } from 'typeorm';

// NOTE: ALTER TYPE ... ADD VALUE cannot run inside a transaction block in PostgreSQL
// (prior to Postgres 12 this was an unconditional restriction; even on modern Postgres,
// a value added by ALTER TYPE ... ADD VALUE cannot be used in the same transaction it
// was created in). TypeORM's migration:run wraps all pending migrations in a single
// transaction by default, so running this migration together with others in the default
// `migration:run` flow will fail with:
//   "ALTER TYPE ... ADD VALUE cannot run inside a transaction block"
// To apply this migration safely in production, run it on its own with transactions
// disabled, e.g.:
//   npx typeorm-ts-node-commonjs migration:run -d data-source.ts -t false
// or, using this repo's ts-node/tsconfig-paths registration:
//   node -r ts-node/register -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:run -d data-source.ts -t false
// The `-t false` (--transaction=false) flag tells the TypeORM CLI to run each migration
// outside of a transaction, which is required for ALTER TYPE ... ADD VALUE to succeed.
export class NotificationEnumValues1784600200000 implements MigrationInterface {
  name = 'NotificationEnumValues1784600200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "notifications_type_enum" ADD VALUE IF NOT EXISTS 'SKILL_REJECTION'`,
    );
    await queryRunner.query(
      `ALTER TYPE "notifications_type_enum" ADD VALUE IF NOT EXISTS 'EMPLOYEE_UPDATE'`,
    );
    await queryRunner.query(
      `ALTER TYPE "notifications_type_enum" ADD VALUE IF NOT EXISTS 'ROLE_ASSIGNED'`,
    );
    await queryRunner.query(
      `ALTER TYPE "notifications_type_enum" ADD VALUE IF NOT EXISTS 'ROLE_REVOKED'`,
    );
    await queryRunner.query(
      `ALTER TYPE "notifications_type_enum" ADD VALUE IF NOT EXISTS 'SYSTEM_ANNOUNCEMENT'`,
    );
    await queryRunner.query(
      `ALTER TYPE "notifications_type_enum" ADD VALUE IF NOT EXISTS 'SECURITY_ALERT'`,
    );
  }

  public async down(): Promise<void> {
    // Postgres cannot drop individual enum values without recreating the type;
    // intentionally a no-op.
  }
}
