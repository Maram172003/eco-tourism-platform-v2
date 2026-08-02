import { IsUUID, IsString, IsOptional, IsArray, IsInt } from 'class-validator';

export class CreateProviderActivityDto {
  @IsUUID() provider_id!: string;
  @IsUUID() organization_id!: string;
  @IsString() level!: string;
  @IsString() category!: string;
  @IsOptional() @IsArray() subtypes?: string[];
  @IsOptional() @IsInt() years_experience?: number;
}

export class UpdateProviderActivityDto extends CreateProviderActivityDto {}
