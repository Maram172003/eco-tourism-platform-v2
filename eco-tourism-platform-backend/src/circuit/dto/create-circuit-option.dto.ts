import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class CreateCircuitOptionDto {
  @IsOptional()
  @IsString()
  @Matches(UUID_REGEX, { message: 'offer_item_id must be a UUID' })
  offer_item_id?: string;

  @IsOptional()
  @IsString()
  option_group?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsString()
  @IsNotEmpty()
  option_type!: string;

  @IsOptional()
  @IsBoolean()
  is_required?: boolean;

  @IsOptional()
  @IsBoolean()
  is_included?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  extra_price?: number;

  @IsOptional()
  @IsString()
  selection_mode?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  min_quantity?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  max_quantity?: number;
}
