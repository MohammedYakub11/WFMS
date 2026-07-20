import {
  IsNotEmpty,
  IsUUID,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsBoolean,
  IsString,
  IsDateString,
  ValidateIf,
} from 'class-validator';

export class CreateEmployeeSkillDto {
  @IsUUID()
  @IsNotEmpty()
  employeeId: string;

  @IsUUID()
  @IsNotEmpty()
  skillId: string;

  @IsInt()
  @Min(0)
  @Max(5)
  @IsNotEmpty()
  proficiencyRating: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  yearsOfExperience?: number;

  @IsDateString()
  @IsOptional()
  lastUsedDate?: string;

  @IsBoolean()
  @IsOptional()
  isCertified?: boolean;

  @ValidateIf((o: CreateEmployeeSkillDto) => o.isCertified === true)
  @IsString()
  @IsNotEmpty()
  certificationName?: string;

  @ValidateIf((o: CreateEmployeeSkillDto) => o.isCertified === true)
  @IsString()
  @IsNotEmpty()
  issuingOrganization?: string;

  @ValidateIf((o: CreateEmployeeSkillDto) => o.isCertified === true)
  @IsDateString()
  @IsNotEmpty()
  issueDate?: string;

  @ValidateIf((o: CreateEmployeeSkillDto) => o.isCertified === true)
  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @IsString()
  @IsOptional()
  remarks?: string;
}
