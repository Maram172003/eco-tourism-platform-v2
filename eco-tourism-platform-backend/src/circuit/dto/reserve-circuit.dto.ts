import {
  IsArray,
  IsInt,
  IsNotEmpty,
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
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CircuitOptionSelectionDto)
  options?: CircuitOptionSelectionDto[];
}
