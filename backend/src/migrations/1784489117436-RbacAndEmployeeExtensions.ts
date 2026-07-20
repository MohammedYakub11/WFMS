import { MigrationInterface, QueryRunner } from 'typeorm';

export class RbacAndEmployeeExtensions1784489117436 implements MigrationInterface {
  name = 'RbacAndEmployeeExtensions1784489117436';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying(100) NOT NULL, "name" character varying(150) NOT NULL, "category" character varying(50) NOT NULL, "description" character varying(500), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_8dad765629e83229da6feda1c1d" UNIQUE ("code"), CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_permission_category" ON "permissions" ("category") `,
    );
    await queryRunner.query(
      `CREATE TABLE "role_permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "role_id" uuid NOT NULL, "permission_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_25d24010f53bb80b78e412c9656" UNIQUE ("role_id", "permission_id"), CONSTRAINT "PK_84059017c90bfcb701b8fa42297" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "description" character varying(500), "is_system" boolean NOT NULL DEFAULT false, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "employee_roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "employee_id" uuid NOT NULL, "role_id" uuid NOT NULL, "assigned_by" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_71ecf0ea3041c35322b4a1b86b3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_employee_roles_role_id" ON "employee_roles" ("role_id") `,
    );
    // Enforces one active (non-revoked) role per employee — not expressible via TypeORM decorators.
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_employee_roles_active_employee" ON "employee_roles" ("employee_id") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid, "module" character varying(100) NOT NULL, "entity" character varying(100) NOT NULL, "entity_id" uuid, "action" character varying(50) NOT NULL, "old_value" jsonb, "new_value" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_audit_logs_user_id" ON "audit_logs" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_audit_logs_module" ON "audit_logs" ("module") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_audit_logs_created_at" ON "audit_logs" ("created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_audit_logs_entity_entity_id" ON "audit_logs" ("entity", "entity_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" ADD "deleted_at" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" ADD "reporting_manager_id" uuid`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_employee_reporting_manager" ON "employees" ("reporting_manager_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_178199805b901ccd220ab7740ec" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_17022daf3f885f7d35423e9971e" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_roles" ADD CONSTRAINT "FK_04aafdf0252f05451916c4810ec" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_roles" ADD CONSTRAINT "FK_13f42debabcdc155b21632097cf" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_roles" ADD CONSTRAINT "FK_47ccc42a5c4b846f186ac520bea" FOREIGN KEY ("assigned_by") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" ADD CONSTRAINT "FK_d9905573bc2ac40a295320325cf" FOREIGN KEY ("reporting_manager_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "audit_logs" ADD CONSTRAINT "FK_bd2726fd31b35443f2245b93ba0" FOREIGN KEY ("user_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_bd2726fd31b35443f2245b93ba0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" DROP CONSTRAINT "FK_d9905573bc2ac40a295320325cf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_roles" DROP CONSTRAINT "FK_47ccc42a5c4b846f186ac520bea"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_roles" DROP CONSTRAINT "FK_13f42debabcdc155b21632097cf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_roles" DROP CONSTRAINT "FK_04aafdf0252f05451916c4810ec"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_17022daf3f885f7d35423e9971e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_178199805b901ccd220ab7740ec"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_employee_reporting_manager"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" DROP COLUMN "reporting_manager_id"`,
    );
    await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "deleted_at"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_audit_logs_entity_entity_id"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_audit_logs_created_at"`);
    await queryRunner.query(`DROP INDEX "public"."idx_audit_logs_module"`);
    await queryRunner.query(`DROP INDEX "public"."idx_audit_logs_user_id"`);
    await queryRunner.query(`DROP TABLE "audit_logs"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_employee_roles_active_employee"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_employee_roles_role_id"`);
    await queryRunner.query(`DROP TABLE "employee_roles"`);
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP TABLE "role_permissions"`);
    await queryRunner.query(`DROP INDEX "public"."idx_permission_category"`);
    await queryRunner.query(`DROP TABLE "permissions"`);
  }
}
