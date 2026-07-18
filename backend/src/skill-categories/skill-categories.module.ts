import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkillCategoriesService } from './skill-categories.service';
import { SkillCategoriesController } from './skill-categories.controller';
import { SkillCategory } from './entities/skill-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SkillCategory])],
  controllers: [SkillCategoriesController],
  providers: [SkillCategoriesService],
  exports: [SkillCategoriesService],
})
export class SkillCategoriesModule {}
