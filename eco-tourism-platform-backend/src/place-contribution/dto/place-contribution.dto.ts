import { IsEnum, IsOptional, IsString, IsArray, IsUUID, MinLength } from 'class-validator';

export enum ContributionType {
  DESCRIPTION = 'description',
  IMAGES = 'images',
}

export class CreateContributionDto {
  @IsEnum(ContributionType)
  type: ContributionType;

  @IsOptional()
  @IsString()
  @MinLength(20, { message: 'La description doit faire au moins 20 caractères.' })
  content?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
