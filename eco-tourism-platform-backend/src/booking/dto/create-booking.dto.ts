import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Participant individuel dans la réservation
 */
export class ParticipantDto {
  @IsString()
  @IsNotEmpty()
  full_name!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  age?: number;

  @IsOptional()
  @IsString()
  document_type?: string;

  @IsOptional()
  @IsString()
  document_number?: string;

  @IsOptional()
  @IsBoolean()
  is_group_leader?: boolean;
}

/**
 * Création d'une réservation
 */
export class CreateBookingDto {
  @IsUUID()
  @IsNotEmpty()
  offer_id!: string;

  @IsOptional()
  @IsUUID()
  offer_item_id?: string;

  @IsOptional()
  @IsUUID()
  session_id?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  total_price?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  nights?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  special_requests?: string;

  @IsOptional()
  @IsString()
  confirmation_mode?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParticipantDto)
  participants?: ParticipantDto[];
}
