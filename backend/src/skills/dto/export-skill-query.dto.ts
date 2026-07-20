import { OmitType } from '@nestjs/mapped-types';
import { IsIn } from 'class-validator';
import { SkillListQueryDto } from './skill-list-query.dto';

// Same filters as SkillListQueryDto minus pagination, plus the required export format.
// Kept as its own DTO (rather than a separate @Query('format') param alongside
// SkillListQueryDto) so the global ValidationPipe's whitelist/forbidNonWhitelisted
// settings don't reject the `format` query param when validating the filter object.
export class ExportSkillQueryDto extends OmitType(SkillListQueryDto, [
  'page',
  'limit',
] as const) {
  @IsIn(['csv', 'xlsx'])
  format: 'csv' | 'xlsx';
}
