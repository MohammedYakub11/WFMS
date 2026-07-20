import { OmitType } from '@nestjs/mapped-types';
import { IsIn } from 'class-validator';
import { SkillCategoryListQueryDto } from './skill-category-list-query.dto';

// Same filters as SkillCategoryListQueryDto minus pagination, plus the required
// export format. Kept as its own DTO for the same whitelist/forbidNonWhitelisted
// reason documented on ExportSkillQueryDto in the skills module.
export class ExportSkillCategoryQueryDto extends OmitType(
  SkillCategoryListQueryDto,
  ['page', 'limit'] as const,
) {
  @IsIn(['csv', 'xlsx'])
  format: 'csv' | 'xlsx';
}
