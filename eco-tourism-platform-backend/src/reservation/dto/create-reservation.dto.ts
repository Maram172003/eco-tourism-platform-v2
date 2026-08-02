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
export class CreateGuideReservationDto {
  @IsUUID()
  @IsNotEmpty()
  guide_offering_id!: string;

  @IsUUID()
  @IsNotEmpty()
  guide_offering_session_id!: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  special_requests?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParticipantDto)
  participants?: ParticipantDto[];
}

export class CreateReservationDto {
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
  @Min(1)
  nights?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  special_requests?: string;

  @IsOptional()
  @IsIn(['automatic', 'manual'])
  confirmation_mode?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParticipantDto)
  participants?: ParticipantDto[];
}
