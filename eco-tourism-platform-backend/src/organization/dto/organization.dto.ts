import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class OrgCertificationDto {
  @IsString() name!: string;
  @IsOptional() @IsString() document_url?: string;
}

export class CreateOrganizationDto {
  // ── Identité ── (obligatoire)
  @IsString() name!: string;
  @IsString() provider_type!: string;

  @IsOptional() @IsString() logo?: string;
  @IsOptional() @IsString() bio?: string;
  @IsOptional() @IsString() history?: string;

  // ── Contact ──
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() whatsapp?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() website?: string;
  @IsOptional() @IsString() facebook?: string;
  @IsOptional() @IsString() instagram?: string;
  @IsOptional() @IsString() tiktok?: string;

  // ── Localisation ──
  @IsString() region!: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() zone?: string;
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsNumber() @Type(() => Number) lat?: number;
  @IsOptional() @IsNumber() @Type(() => Number) lng?: number;

  // ── Médias ──
  @IsOptional() @IsArray() photos?: string[];
  @IsOptional() @IsArray() videos?: string[];

  // ── Labels & Certifications ──
  @IsOptional() @IsArray() eco_labels?: string[];
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => OrgCertificationDto)
  certifications?: OrgCertificationDto[];

  @IsOptional() @IsString() opening_hours?: string;
}

export class UpdateOrganizationDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() provider_type?: string;
  @IsOptional() @IsString() logo?: string;
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
  @IsOptional() @IsNumber() @Type(() => Number) lat?: number;
  @IsOptional() @IsNumber() @Type(() => Number) lng?: number;
  @IsOptional() @IsArray() photos?: string[];
  @IsOptional() @IsArray() videos?: string[];
  @IsOptional() @IsArray() eco_labels?: string[];
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => OrgCertificationDto)
  certifications?: OrgCertificationDto[];
  @IsOptional() @IsString() opening_hours?: string;
}
