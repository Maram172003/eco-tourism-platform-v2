import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class CircuitOptionSelectionDto {
  @IsString()
  @IsNotEmpty()
  @Matches(UUID_REGEX, { message: 'circuit_option_id must be a UUID' })
  circuit_option_id!: string;

  @IsOptional()
  @IsString()
  @Matches(UUID_REGEX, { message: 'offer_item_session_id must be a UUID' })
  offer_item_session_id?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;
}

export class ReserveCircuitDto {
  @IsOptional()
  @IsString()
  @Matches(UUID_REGEX, { message: 'circuit_id must be a UUID' })
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
