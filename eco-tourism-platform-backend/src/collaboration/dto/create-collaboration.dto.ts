import { IsString, IsOptional, IsIn, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCollaborationDto {
  @ApiPropertyOptional({
    description: 'ID du guide invité (legacy — utilisez invited_user_id)',
  })
  @IsString()
  @IsOptional()
  guide_id?: string;

  @ApiPropertyOptional({
    description: "ID de l'utilisateur invité (guide OU provider)",
  })
  @IsString()
  @IsOptional()
  invited_user_id?: string;

  @ApiPropertyOptional({
    description: "Type de l'invité",
    enum: ['guide', 'provider'],
  })
  @IsString()
  @IsOptional()
  @IsIn(['guide', 'provider'])
  invited_user_type?: string;

  @ApiPropertyOptional({ description: "Nom de l'invité (déni) " })
  @IsString()
  @IsOptional()
  invited_user_name?: string;

  @ApiProperty({ description: "ID de l'offre concernée" })
  @IsString()
  offer_id!: string;

  @ApiProperty({
    description: 'Type de prestation demandée',
    enum: [
      'randonnee',
      'visite_culturelle',
      'guide_tour',
      'transport',
      'accompagnement',
      'photographie',
      'gastronomie',
      'bien_etre',
      'autre',
    ],
  })
  @IsString()
  @IsIn([
    'randonnee',
    'visite_culturelle',
    'guide_tour',
    'transport',
    'accompagnement',
    'photographie',
    'gastronomie',
    'bien_etre',
    'autre',
  ])
  section!: string;

  @ApiPropertyOptional({ description: 'Message personnalisé au collaborateur' })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiPropertyOptional({
    description:
      'Prix du guide récupéré automatiquement depuis sa prestation (offering) par zone — pré-rempli et modifiable par le provider',
  })
  @IsNumber()
  @IsOptional()
  guide_price?: number;
}
