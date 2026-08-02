import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGuideOfferingDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price!: number;

  @IsOptional()
  @IsString()
  pricing_unit?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  min_travelers?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  max_travelers?: number;

  @IsOptional()
  @IsString()
  service_zone_type?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  lat?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  lng?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  radius_km?: number;

  @IsOptional()
  @IsString()
  zone_governorate?: string;

  @IsOptional()
  @IsString()
  zone_municipality?: string;

  @IsOptional()
  @IsBoolean()
  displacement_allowed?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  displacement_max_km?: number;

  @IsOptional()
  @IsString()
  displacement_type?: string;
}

export class UpdateGuideOfferingDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price?: number;

  @IsOptional()
  @IsString()
  pricing_unit?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  min_travelers?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  max_travelers?: number;

  @IsOptional()
  @IsString()
  service_zone_type?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  lat?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  lng?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  radius_km?: number;

  @IsOptional()
  @IsString()
  zone_governorate?: string;

  @IsOptional()
  @IsString()
  zone_municipality?: string;

  @IsOptional()
  @IsBoolean()
  displacement_allowed?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  displacement_max_km?: number;

  @IsOptional()
  @IsString()
  displacement_type?: string;
}

export class GenerateSessionsDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  days_ahead?: number;
}

export class CreateGuideOfferingSessionDto {
  @Type(() => Date)
  date!: Date;

  @IsString()
  start_time!: string;

  @IsString()
  end_time!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  total_capacity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price_override?: number;
}

export class CreateGuideOfferingBlockDto {
  @Type(() => Date)
  start_date!: Date;

  @Type(() => Date)
  end_date!: Date;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class CreateGuideOfferingPriceDto {
  @IsString()
  @IsNotEmpty()
  label!: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  min_quantity?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  max_quantity?: number;

  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}

export class CreateGuideOfferingAvailabilityRuleDto {
  @IsString()
  @IsNotEmpty()
  availability_type!: string;

  @IsOptional()
  @Type(() => Date)
  start_date?: Date;

  @IsOptional()
  @Type(() => Date)
  end_date?: Date;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  weekdays?: number[];

  @IsOptional()
  @IsString()
  start_time?: string;

  @IsOptional()
  @IsString()
  end_time?: string;

  @IsOptional()
  @IsString()
  recurrence_rule?: string;
}
