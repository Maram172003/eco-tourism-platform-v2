import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCircuitOptionDto {
  @IsOptional()
  @IsUUID()
  offer_item_id?: string;

  @IsOptional()
  @IsString()
  option_group?: string;

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
