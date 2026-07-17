import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOfferDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price?: number;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsString()
  offer_type?: string;

  @IsOptional()
  @IsUUID()
  category_id?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString()
  inclusions?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  longitude?: number;

  @IsOptional()
  @IsString()
  meeting_point?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  meeting_lat?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  meeting_lng?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  min_group_size?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  max_group_size?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  min_age?: number;

  @IsOptional()
  @IsIn(['flexible', 'moderate', 'strict', 'non_refundable'])
  cancellation_policy?: string;

  @IsOptional()
  @IsIn(['automatic', 'manual'])
  confirmation_mode?: string;

  @IsOptional()
  @IsUUID()
  venue_id?: string;

  @IsOptional()
  @IsIn(['fixed', 'mobile', 'online'])
  location_type?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  deposit_percentage?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  production_delay_days?: number;

  @IsOptional()
  @IsIn(['instant_stock', 'scheduled', 'recurring', 'on_request', 'mixed'])
  fulfillment_mode?: string;

  @IsOptional()
  @IsIn(['per_person', 'per_group', 'per_night', 'per_unit', 'on_request'])
  price_type?: string;
}

export class OfferSustainabilityDto {
  @IsInt()
  @Min(0)
  @Max(100)
  score!: number;
}

export class UpdateOfferDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price?: number;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsString()
  offer_type?: string;

  @IsOptional()
  @IsUUID()
  category_id?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString()
  inclusions?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  longitude?: number;

  @IsOptional()
  @IsString()
  meeting_point?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  meeting_lat?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  meeting_lng?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  min_group_size?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  max_group_size?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  min_age?: number;

  @IsOptional()
  @IsIn(['flexible', 'moderate', 'strict', 'non_refundable'])
  cancellation_policy?: string;

  @IsOptional()
  @IsIn(['automatic', 'manual'])
  confirmation_mode?: string;

  @IsOptional()
  @IsIn(['draft', 'pending', 'approved', 'rejected', 'archived', 'inactive'])
  status?: string;

  @IsOptional()
  @IsIn(['fixed', 'mobile', 'online'])
  location_type?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  deposit_percentage?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  production_delay_days?: number;

  @IsOptional()
  @IsIn(['instant_stock', 'scheduled', 'recurring', 'on_request', 'mixed'])
  fulfillment_mode?: string;

  @IsOptional()
  @IsIn(['per_person', 'per_group', 'per_night', 'per_unit', 'on_request'])
  price_type?: string;
}

// ─── OfferItem DTOs ──────────────────────────────────────

export class CreateOfferItemDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  item_type?: string;

  @IsOptional()
  details_json?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  requires_confirmation?: boolean;

  @IsOptional()
  @IsIn(['automatic', 'manual'])
  confirmation_mode?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  booking_deadline_days?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  cancellation_deadline_days?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  production_delay_days?: number;
}

export class UpdateOfferItemDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  item_type?: string;

  @IsOptional()
  details_json?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  requires_confirmation?: boolean;

  @IsOptional()
  @IsIn(['automatic', 'manual'])
  confirmation_mode?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  booking_deadline_days?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  cancellation_deadline_days?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  production_delay_days?: number;

  @IsOptional()
  @IsIn(['draft', 'pending', 'approved', 'rejected', 'archived', 'inactive'])
  status?: string;
}

export class CreateOfferItemPriceDto {
  @IsString()
  @IsNotEmpty()
  label!: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price!: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsIn(['per_person', 'per_night', 'per_hour', 'per_half_day', 'per_day'])
  pricing_unit?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  min_quantity?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  max_quantity?: number;

  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}

export class CreateAvailabilityRuleDto {
  @IsIn(['weekly', 'daily', 'date_range', 'weekend_only', 'custom'])
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

export class UpdateOfferItemPriceDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsIn(['per_person', 'per_night', 'per_hour', 'per_half_day', 'per_day'])
  pricing_unit?: string;

  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}

export class UpdateOfferItemSessionDto {
  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  start_time?: string;

  @IsOptional()
  @IsString()
  end_time?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  total_capacity?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  remaining_capacity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price_override?: number;

  @IsOptional()
  @IsIn(['available', 'cancelled', 'full', 'completed'])
  status?: string;
}

export class CreateOfferItemSessionDto {
  @IsString()
  @IsNotEmpty()
  date!: string;

  @IsString()
  @IsNotEmpty()
  start_time!: string;

  @IsString()
  @IsNotEmpty()
  end_time!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  total_capacity?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  remaining_capacity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price_override?: number;
}
