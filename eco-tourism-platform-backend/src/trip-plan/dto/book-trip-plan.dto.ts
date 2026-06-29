import {
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ParticipantDto } from '../../booking/dto/create-booking.dto';

export class BookTripPlanDto {
  @ApiPropertyOptional({ description: 'Participants pour toutes les réservations' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParticipantDto)
  participants?: ParticipantDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  special_requests?: string;
}
