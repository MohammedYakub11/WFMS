import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSkillAdminFields1784600000000 implements MigrationInterface {
  name = 'AddSkillAdminFields1784600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "skills" ADD "skill_code" character varying(50)`,
    );
    await queryRunner.query(
      `ALTER TABLE "skills" ADD "required_certification" character varying(255)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_skills_skill_code_active" ON "skills" ("skill_code") WHERE "deleted_at" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."idx_skills_skill_code_active"`,
    );
    await queryRunner.query(
      `ALTER TABLE "skills" DROP COLUMN "required_certification"`,
    );
    await queryRunner.query(`ALTER TABLE "skills" DROP COLUMN "skill_code"`);
  }
}
