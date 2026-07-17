import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCircuitDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Date)
  start_date?: Date;

  @IsOptional()
  @Type(() => Date)
  end_date?: Date;

  @IsOptional()
  @IsInt()
  @Min(1)
  duration_days?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  duration_nights?: number;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  base_price?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  max_participants?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  booking_deadline_days?: number;

  @IsOptional()
  @IsIn(['automatic', 'manual'])
  confirmation_mode?: string;

  @IsOptional()
  @IsIn(['easy', 'moderate', 'hard', 'expert'])
  difficulty_level?: string;

  @IsOptional()
  @IsString()
  inclusions?: string;

  @IsOptional()
  @IsString()
  exclusions?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  lat?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  lng?: number;

  @IsOptional()
  @IsString()
  cover_image?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsUUID()
  project_id?: string;

  @IsOptional()
  @IsString()
  waypoints?: string;

  @IsOptional()
  @IsObject()
  availability?: {
    mode?: string;
    specific_dates?: string[];
    weekdays?: number[];
    avail_start?: string;
    avail_end?: string;
    saisons?: string[];
    heure_debut?: string;
    heure_fin?: string;
    delai_reponse?: string;
  };

  @IsOptional()
  @IsObject()
  hebergement?: {
    inclus: boolean;
    type?: 'same' | 'per_day';
  };
}
