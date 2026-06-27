import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReservationDto {
  @IsUUID()
  offer_id!: string;

  // Séance choisie (pour scheduled/recurring)
  @IsOptional()
  @IsUUID()
  session_id?: string;

  // Date souhaitée (pour on_request)
  @IsOptional()
  @IsDateString()
  reservation_date?: string;

  @IsEnum(['solo', 'group'])
  reservation_type!: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  participant_count!: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  invited_user_ids?: string[];
}

export class RespondToInvitationDto {
  @IsEnum(['accepted', 'declined'])
  status!: string;
}

export class ConfirmReservationDto {
  @IsEnum(['confirmed', 'rejected'])
  status!: string;

  @IsOptional()
  @IsString()
  cancellation_reason?: string;
}
