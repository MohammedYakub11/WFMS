import { MigrationInterface, QueryRunner } from 'typeorm';

export class NotificationSchemaExtensions1784600100000 implements MigrationInterface {
  name = 'NotificationSchemaExtensions1784600100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD "read_at" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD "link" character varying(512)`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD "is_broadcast" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD "deleted_at" TIMESTAMP`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notifications_priority_enum" AS ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT')`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD "priority" "public"."notifications_priority_enum" NOT NULL DEFAULT 'NORMAL'`,
    );
    await queryRunner.query(
      `CREATE TABLE "notification_preferences" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "employee_id" uuid NOT NULL, "on_skill_approval" boolean NOT NULL DEFAULT true, "on_skill_rejection" boolean NOT NULL DEFAULT true, "on_role_change" boolean NOT NULL DEFAULT true, "on_employee_update" boolean NOT NULL DEFAULT true, "on_broadcast" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_notification_preferences_employee_id" UNIQUE ("employee_id"), CONSTRAINT "PK_notification_preferences_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_preferences" ADD CONSTRAINT "FK_notification_preferences_employee_id" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    // Speeds up the "unread notifications for employee" lookup that backs the inbox
    // list and unread-count endpoints; partial on deleted_at IS NULL to skip soft-deleted rows.
    await queryRunner.query(
      `CREATE INDEX "idx_notifications_employee_read" ON "notifications" ("employee_id", "is_read") WHERE "deleted_at" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."idx_notifications_employee_read"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_preferences" DROP CONSTRAINT "FK_notification_preferences_employee_id"`,
    );
    await queryRunner.query(`DROP TABLE "notification_preferences"`);
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP COLUMN "priority"`,
    );
    await queryRunner.query(`DROP TYPE "public"."notifications_priority_enum"`);
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP COLUMN "deleted_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP COLUMN "is_broadcast"`,
    );
    await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "link"`);
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP COLUMN "read_at"`,
    );
  }
}
