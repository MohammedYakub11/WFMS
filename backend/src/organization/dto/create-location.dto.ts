import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateLocationDto {
  @IsString()
  @IsNotEmpty()
  locationCode: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsIn(['office', 'branch', 'remote'])
  @IsOptional()
  type?: 'office' | 'branch' | 'remote';

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
