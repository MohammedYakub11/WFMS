import { IsOptional, IsString, MaxLength, IsUrl } from 'class-validator';

export class UpdateProfileMetadataDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  about_me?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  emergency_contact?: string;

  @IsOptional()
  @IsUrl()
  linkedin_url?: string;

  @IsOptional()
  @IsUrl()
  github_url?: string;

  @IsOptional()
  @IsUrl()
  twitter_url?: string;

  @IsOptional()
  @IsUrl()
  portfolio_url?: string;
}
