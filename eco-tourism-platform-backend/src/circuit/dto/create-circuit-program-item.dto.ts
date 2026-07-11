import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Min,
} from 'class-validator';

export class CreateCircuitProgramItemDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, {
    message: 'start_time doit être au format HH:MM ou HH:MM:SS',
  })
  start_time?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, {
    message: 'end_time doit être au format HH:MM ou HH:MM:SS',
  })
  end_time?: string;

  @IsOptional()
  @IsBoolean()
  is_included?: boolean;

  @IsOptional()
  @IsBoolean()
  is_required?: boolean;

  @IsOptional()
  @IsUUID()
  linked_offer_item_id?: string;

  @IsOptional()
  @IsUUID()
  linked_location_id?: string;

  @IsOptional()
  @IsString()
  emoji?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  duration_minutes?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  distance_km?: number;

  @IsOptional()
  @IsString()
  transport_mode?: string;

  @IsOptional()
  @IsUUID()
  guide_id?: string;

  @IsOptional()
  @IsString()
  guide_name?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subtypes?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];

  @IsOptional()
  @IsObject()
  unit_details?: Record<string, any>;

  @IsOptional()
  @IsObject()
  fields?: Record<string, any>;

  @IsOptional()
  @IsObject()
  external_reference?: {
    provider_name?: string;
    phone?: string;
    address?: string;
    url?: string;
    estimated_price?: number;
    currency?: string;
    notes?: string;
    type?: 'hebergement' | 'restaurant' | 'activite' | 'transport';
  };

  @IsOptional()
  @IsBoolean()
  is_external_reference?: boolean;

  @IsOptional()
  @IsString()
  external_provider_name?: string;
}
