import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCartDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  start_date?: string;

  @IsOptional()
  @IsString()
  end_date?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  participant_count?: number;
}

export class UpdateCartDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  start_date?: string;

  @IsOptional()
  @IsString()
  end_date?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  participant_count?: number;
}

export class AddCartItemDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  offer_item_id?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  circuit_id?: string;

  @IsOptional()
  @IsString()
  session_id?: string;

  @IsOptional()
  @IsString()
  selected_date?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity?: number;

  @IsOptional()
  selected_options?: Record<string, any>;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateCartItemDto {
  @IsOptional()
  @IsString()
  session_id?: string;

  @IsOptional()
  @IsString()
  selected_date?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity?: number;

  @IsOptional()
  selected_options?: Record<string, any>;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ConvertCartToTripPlanDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
