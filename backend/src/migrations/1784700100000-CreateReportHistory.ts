import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReportHistory1784700100000 implements MigrationInterface {
  name = 'CreateReportHistory1784700100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "report_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "report_type" character varying(50) NOT NULL, "format" character varying(10) NOT NULL, "filters" jsonb NOT NULL DEFAULT '{}', "generated_by" uuid, "status" character varying(20) NOT NULL DEFAULT 'completed', "row_count" integer, "download_count" integer NOT NULL DEFAULT 0, "last_downloaded_at" TIMESTAMP WITH TIME ZONE, "generated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_report_history" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_report_history_type" ON "report_history" ("report_type")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_report_history_generated_by" ON "report_history" ("generated_by")`,
    );
    await queryRunner.query(
      `ALTER TABLE "report_history" ADD CONSTRAINT "FK_report_history_generated_by" FOREIGN KEY ("generated_by") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "report_history" DROP CONSTRAINT "FK_report_history_generated_by"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_report_history_generated_by"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_report_history_type"`);
    await queryRunner.query(`DROP TABLE "report_history"`);
  }
}
