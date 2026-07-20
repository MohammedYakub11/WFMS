import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1784464471663 implements MigrationInterface {
  name = 'InitialSchema1784464471663';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "profile_metadata" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "employee_id" uuid NOT NULL, "about_me" text, "address" character varying, "emergency_contact" character varying, "linkedin_url" character varying, "github_url" character varying, "twitter_url" character varying, "portfolio_url" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_28459fbdb70510427e7d5e65a7" UNIQUE ("employee_id"), CONSTRAINT "PK_b76e33935f0a1fe05e98bad3be7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "skill_categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "category_name" character varying(255) NOT NULL, "description" character varying(500), "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_903d92d9350b5c66c69e25c8b77" UNIQUE ("category_name"), CONSTRAINT "PK_efce364bf7be7b92b7d7f948663" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "skills" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "category_id" uuid NOT NULL, "skill_name" character varying(100) NOT NULL, "description" character varying(500), "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_1676e90569c202416957bee654f" UNIQUE ("category_id", "skill_name"), CONSTRAINT "PK_0d3212120f4ecedf90864d7e298" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_skill_name" ON "skills" ("skill_name") `,
    );
    await queryRunner.query(
      `CREATE TABLE "employee_skills" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "employee_id" uuid NOT NULL, "skill_id" uuid NOT NULL, "proficiency_rating" integer NOT NULL DEFAULT '0', "years_of_experience" integer, "is_certified" boolean NOT NULL DEFAULT false, "certification_name" character varying(255), "issuing_organization" character varying(255), "issue_date" date, "expiry_date" date, "last_used_date" date, "approval_status" character varying(50) NOT NULL DEFAULT 'pending', "remarks" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "reviewed_by" uuid, "reviewed_at" TIMESTAMP, "review_comments" text, "previous_status" character varying(50), "submitted_at" TIMESTAMP, "resubmitted_at" TIMESTAMP, "deleted_at" TIMESTAMP, CONSTRAINT "UQ_4b0defbd09068a51440a7679ed3" UNIQUE ("employee_id", "skill_id"), CONSTRAINT "PK_e74b1e2cad6e8aba5368ff116a8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_emp_skill_proficiency" ON "employee_skills" ("proficiency_rating") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_emp_skill_experience" ON "employee_skills" ("years_of_experience") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_emp_skill_certified" ON "employee_skills" ("is_certified") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_emp_skill_approval" ON "employee_skills" ("approval_status") `,
    );
    await queryRunner.query(
      `CREATE TABLE "employees" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "employee_code" character varying NOT NULL, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "email" character varying NOT NULL, "phone" character varying, "password" character varying NOT NULL, "designation" character varying, "department" character varying, "experience" integer NOT NULL DEFAULT '0', "location" character varying, "profile_image" character varying, "status" character varying NOT NULL DEFAULT 'active', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_56162b5f24af743a154680684f5" UNIQUE ("employee_code"), CONSTRAINT "UQ_765bc1ac8967533a04c74a9f6af" UNIQUE ("email"), CONSTRAINT "PK_b9535a98350d5b26e7eb0c26af4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_employee_code" ON "employees" ("employee_code") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_employee_first_name" ON "employees" ("first_name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_employee_last_name" ON "employees" ("last_name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_employee_email" ON "employees" ("email") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_employee_designation" ON "employees" ("designation") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_employee_department" ON "employees" ("department") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_employee_location" ON "employees" ("location") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notifications_type_enum" AS ENUM('INFO', 'SKILL_APPROVAL', 'SYSTEM', 'REMINDER')`,
    );
    await queryRunner.query(
      `CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "employee_id" uuid NOT NULL, "title" character varying NOT NULL, "message" text NOT NULL, "type" "public"."notifications_type_enum" NOT NULL DEFAULT 'INFO', "is_read" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_metadata" ADD CONSTRAINT "FK_28459fbdb70510427e7d5e65a74" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "skills" ADD CONSTRAINT "FK_47dd0ade7ed449a7aca9b9e6752" FOREIGN KEY ("category_id") REFERENCES "skill_categories"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_skills" ADD CONSTRAINT "FK_ec91e85c3d675deabbbf6ac9c1a" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_skills" ADD CONSTRAINT "FK_d27f44563392b7a95805bcc5f0e" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "FK_d59afae1b9c6b8d9a17548e014f" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "FK_d59afae1b9c6b8d9a17548e014f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_skills" DROP CONSTRAINT "FK_d27f44563392b7a95805bcc5f0e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_skills" DROP CONSTRAINT "FK_ec91e85c3d675deabbbf6ac9c1a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "skills" DROP CONSTRAINT "FK_47dd0ade7ed449a7aca9b9e6752"`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_metadata" DROP CONSTRAINT "FK_28459fbdb70510427e7d5e65a74"`,
    );
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
    await queryRunner.query(`DROP INDEX "public"."idx_employee_location"`);
    await queryRunner.query(`DROP INDEX "public"."idx_employee_department"`);
    await queryRunner.query(`DROP INDEX "public"."idx_employee_designation"`);
    await queryRunner.query(`DROP INDEX "public"."idx_employee_email"`);
    await queryRunner.query(`DROP INDEX "public"."idx_employee_last_name"`);
    await queryRunner.query(`DROP INDEX "public"."idx_employee_first_name"`);
    await queryRunner.query(`DROP INDEX "public"."idx_employee_code"`);
    await queryRunner.query(`DROP TABLE "employees"`);
    await queryRunner.query(`DROP INDEX "public"."idx_emp_skill_approval"`);
    await queryRunner.query(`DROP INDEX "public"."idx_emp_skill_certified"`);
    await queryRunner.query(`DROP INDEX "public"."idx_emp_skill_experience"`);
    await queryRunner.query(`DROP INDEX "public"."idx_emp_skill_proficiency"`);
    await queryRunner.query(`DROP TABLE "employee_skills"`);
    await queryRunner.query(`DROP INDEX "public"."idx_skill_name"`);
    await queryRunner.query(`DROP TABLE "skills"`);
    await queryRunner.query(`DROP TABLE "skill_categories"`);
    await queryRunner.query(`DROP TABLE "profile_metadata"`);
  }
}
