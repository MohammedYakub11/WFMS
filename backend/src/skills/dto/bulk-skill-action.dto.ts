import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsUUID,
} from 'class-validator';

export class BulkSkillActionDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(500)
  @IsUUID('4', { each: true })
  ids: string[];

  @IsIn(['activate', 'deactivate'])
  action: 'activate' | 'deactivate';
}
