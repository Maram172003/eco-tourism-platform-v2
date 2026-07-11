import { IsOptional, IsString, IsArray, IsInt, IsEmail, IsNumber, IsBoolean } from 'class-validator';

export class CreateProviderDto {
  @IsOptional() @IsString() full_name?: string;
  @IsOptional() @IsString() photo?: string;
  @IsOptional() @IsString() position?: string;
  @IsOptional() @IsString() personal_bio?: string;
  @IsOptional() @IsArray() languages_spoken?: string[];
  @IsOptional() @IsInt() years_experience?: number;
  @IsOptional() @IsString() provider_type?: string;
  @IsOptional() @IsString() organization?: string;
  @IsOptional() @IsString() bio?: string;
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsString() language?: string;
  @IsOptional() @IsString() cover_photo?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() whatsapp?: string;
  @IsOptional() @IsString() website?: string;
  @IsOptional() @IsString() facebook?: string;
  @IsOptional() @IsString() instagram?: string;
  @IsOptional() @IsString() tiktok?: string;
  @IsOptional() @IsNumber() lat?: number;
  @IsOptional() @IsNumber() lng?: number;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() region?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsArray() activity_types?: string[];
  @IsOptional() @IsArray() secondary_activity_types?: string[];
  @IsOptional() @IsArray() specialties?: string[];
  @IsOptional() @IsArray() services?: string[];
  @IsOptional() @IsArray() photos?: string[];
  @IsOptional() @IsArray() videos?: string[];
  @IsOptional() @IsArray() eco_labels?: string[];
  @IsOptional() @IsString() history?: string;
  @IsOptional() @IsString() opening_hours?: string;
}

export class UpdateProviderDto extends CreateProviderDto {}
