import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CircuitOptionSelectionDto {
  @IsUUID()
  @IsNotEmpty()
  circuit_option_id!: string;

  @IsOptional()
  @IsUUID()
  offer_item_session_id?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  unit_price?: number;
}

export class ReserveCircuitDto {
  @IsOptional()
  @IsUUID()
  circuit_id?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  participants_count?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  base_total?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CircuitOptionSelectionDto)
  options?: CircuitOptionSelectionDto[];
}
