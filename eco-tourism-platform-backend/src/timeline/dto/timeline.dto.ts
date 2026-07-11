import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTimelineEntryDto {
  @IsInt()
  step_order!: number;

  @IsOptional()
  @IsString()
  emoji?: string;

  @IsString()
  time_label!: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  duration_minutes?: number;

  @IsOptional()
  @IsNumber()
  distance_km?: number;

  @IsOptional()
  @IsString()
  transport_mode?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}

export class UpdateTimelineEntryDto {
  @IsOptional()
  @IsInt()
  step_order?: number;

  @IsOptional()
  @IsString()
  emoji?: string;

  @IsOptional()
  @IsString()
  time_label?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  duration_minutes?: number;

  @IsOptional()
  @IsNumber()
  distance_km?: number;

  @IsOptional()
  @IsString()
  transport_mode?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}

export class BulkSaveTimelineDto {
  @IsArray()
  entries!: CreateTimelineEntryDto[];
}
