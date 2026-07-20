import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkillCategoriesService } from './skill-categories.service';
import { SkillCategoriesController } from './skill-categories.controller';
import { SkillCategory } from './entities/skill-category.entity';
import { AuditLogModule } from '../audit-logs/audit-log.module';

@Module({
  imports: [TypeOrmModule.forFeature([SkillCategory]), AuditLogModule],
  controllers: [SkillCategoriesController],
  providers: [SkillCategoriesService],
  exports: [SkillCategoriesService],
})
export class SkillCategoriesModule {}
