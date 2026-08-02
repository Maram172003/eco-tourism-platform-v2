import { IsOptional, IsString, IsArray, IsInt, IsUUID } from 'class-validator';

export class CreateOrganizationDto {
  @IsUUID() provider_id!: string;
  @IsString() name!: string;
  @IsOptional() @IsString() logo?: string;
  @IsOptional() @IsString() provider_type?: string;
  @IsOptional() @IsString() bio?: string;
  @IsOptional() @IsString() history?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() whatsapp?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() website?: string;
  @IsOptional() @IsString() facebook?: string;
  @IsOptional() @IsString() instagram?: string;
  @IsOptional() @IsString() tiktok?: string;
  @IsOptional() @IsString() region?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() zone?: string;
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsArray() photos?: string[];
  @IsOptional() @IsArray() videos?: string[];
  @IsOptional() @IsArray() eco_labels?: string[];
  @IsOptional() @IsString() opening_hours?: string;
}

export class UpdateOrganizationDto extends CreateOrganizationDto {}
