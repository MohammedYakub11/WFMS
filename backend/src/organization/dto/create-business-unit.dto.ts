import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBusinessUnitDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
