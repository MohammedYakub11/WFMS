import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrganizationSchema1784700000000 implements MigrationInterface {
  name = 'CreateOrganizationSchema1784700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "business_units" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "description" character varying(500), "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_business_units_name" UNIQUE ("name"), CONSTRAINT "PK_business_units" PRIMARY KEY ("id"))`,
    );

    await queryRunner.query(
      `CREATE TABLE "departments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "department_code" character varying(50) NOT NULL, "name" character varying(255) NOT NULL, "description" character varying(500), "business_unit_id" uuid, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_departments_code" UNIQUE ("department_code"), CONSTRAINT "PK_departments" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_department_code" ON "departments" ("department_code")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_department_business_unit" ON "departments" ("business_unit_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "departments" ADD CONSTRAINT "FK_departments_business_unit" FOREIGN KEY ("business_unit_id") REFERENCES "business_units"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `CREATE TABLE "designations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "designation_code" character varying(50) NOT NULL, "name" character varying(255) NOT NULL, "level" integer NOT NULL DEFAULT 0, "description" character varying(500), "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_designations_code" UNIQUE ("designation_code"), CONSTRAINT "PK_designations" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_designation_code" ON "designations" ("designation_code")`,
    );

    await queryRunner.query(
      `CREATE TABLE "locations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "location_code" character varying(50) NOT NULL, "name" character varying(255) NOT NULL, "type" character varying(20) NOT NULL DEFAULT 'office', "address" character varying(500), "city" character varying(100), "country" character varying(100), "timezone" character varying(100), "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_locations_code" UNIQUE ("location_code"), CONSTRAINT "PK_locations" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_location_code" ON "locations" ("location_code")`,
    );

    await queryRunner.query(
      `CREATE TABLE "holidays" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "date" date NOT NULL, "is_recurring" boolean NOT NULL DEFAULT false, "location_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_holidays" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_holiday_date" ON "holidays" ("date")`,
    );
    await queryRunner.query(
      `ALTER TABLE "holidays" ADD CONSTRAINT "FK_holidays_location" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `CREATE TABLE "organization_profile" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "company_name" character varying(255) NOT NULL, "logo_url" character varying(500), "address" character varying(500), "phone" character varying(50), "email" character varying(255), "website" character varying(255), "timezone" character varying(100) NOT NULL DEFAULT 'UTC', "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_organization_profile" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `INSERT INTO "organization_profile" ("company_name", "timezone") VALUES ('My Organization', 'UTC')`,
    );

    await queryRunner.query(
      `CREATE TABLE "organization_settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "password_min_length" integer NOT NULL DEFAULT 8, "password_require_uppercase" boolean NOT NULL DEFAULT true, "password_require_number" boolean NOT NULL DEFAULT true, "password_require_special" boolean NOT NULL DEFAULT true, "password_expiry_days" integer NOT NULL DEFAULT 90, "password_history_count" integer NOT NULL DEFAULT 5, "max_login_attempts" integer NOT NULL DEFAULT 5, "lockout_duration_minutes" integer NOT NULL DEFAULT 30, "session_timeout_minutes" integer NOT NULL DEFAULT 60, "idle_timeout_minutes" integer NOT NULL DEFAULT 15, "max_concurrent_sessions" integer NOT NULL DEFAULT 3, "theme" character varying(20) NOT NULL DEFAULT 'light', "language" character varying(10) NOT NULL DEFAULT 'en', "date_format" character varying(20) NOT NULL DEFAULT 'DD/MM/YYYY', "time_format" character varying(10) NOT NULL DEFAULT '24h', "number_format" character varying(20) NOT NULL DEFAULT '1,234.56', "working_days" jsonb NOT NULL DEFAULT '["MON","TUE","WED","THU","FRI"]', "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_organization_settings" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `INSERT INTO "organization_settings" DEFAULT VALUES`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "organization_settings"`);
    await queryRunner.query(`DROP TABLE "organization_profile"`);
    await queryRunner.query(
      `ALTER TABLE "holidays" DROP CONSTRAINT "FK_holidays_location"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_holiday_date"`);
    await queryRunner.query(`DROP TABLE "holidays"`);
    await queryRunner.query(`DROP INDEX "public"."idx_location_code"`);
    await queryRunner.query(`DROP TABLE "locations"`);
    await queryRunner.query(`DROP INDEX "public"."idx_designation_code"`);
    await queryRunner.query(`DROP TABLE "designations"`);
    await queryRunner.query(
      `ALTER TABLE "departments" DROP CONSTRAINT "FK_departments_business_unit"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_department_business_unit"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_department_code"`);
    await queryRunner.query(`DROP TABLE "departments"`);
    await queryRunner.query(`DROP TABLE "business_units"`);
  }
}
