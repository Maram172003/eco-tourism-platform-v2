import { IsArray, IsInt, IsObject, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ActivityCertificationDto {
  @IsString() name!: string;
  @IsOptional() @IsString() document_url?: string;
}

export class CreateProviderActivityDto {
  @IsString() organization_id!: string;
  @IsString() level!: 'primary' | 'secondary';
  @IsString() category!: string;

  @IsOptional() @IsArray() subtypes?: string[];
  @IsOptional() @IsInt() @Min(0) @Type(() => Number) years_experience?: number;

  // Champs dynamiques par sous-type (MongoDB)
  @IsOptional() @IsObject() fields?: Record<string, Record<string, any>>;

  // Photos par sous-type (MongoDB)
  @IsOptional() @IsObject() photos?: Record<string, string[]>;

  // Certifications liées à cette activité (MongoDB)
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ActivityCertificationDto)
  certifications?: ActivityCertificationDto[];
}

export class UpdateProviderActivityDto {
  @IsOptional() @IsArray() subtypes?: string[];
  @IsOptional() @IsInt() @Min(0) @Type(() => Number) years_experience?: number;
  @IsOptional() @IsObject() fields?: Record<string, Record<string, any>>;
  @IsOptional() @IsObject() photos?: Record<string, string[]>;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ActivityCertificationDto)
  certifications?: ActivityCertificationDto[];
}

export class CreateBulkActivitiesDto {
  @IsString() organization_id!: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => CreateProviderActivityDto)
  activities!: CreateProviderActivityDto[];
}
