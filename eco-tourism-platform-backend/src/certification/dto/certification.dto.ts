import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';

const EXPIRING_CATEGORIES = ['iso', 'eco_label', 'safety', 'first_aid'];

export class CreateCertificationDto {
  @ApiProperty({ example: 'Guide certifié Éco-Voyage' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'formation' })
  @IsOptional()
  @IsString()
  @IsIn(['formation', 'iso', 'quality', 'eco_label', 'safety', 'first_aid', 'other'])
  category?: string;

  @ApiPropertyOptional({ example: 'Formation de 40h en écotourisme' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/certif.jpg' })
  @IsOptional()
  @IsString()
  proof_url?: string;

  @ApiPropertyOptional({ example: 'https://storage.example.com/cert-file.pdf' })
  @IsOptional()
  @IsString()
  file_url?: string;

  @ApiPropertyOptional({ example: 'Institut Tunisien du Tourisme' })
  @IsOptional()
  @IsString()
  issued_by?: string;

  @ApiProperty({ example: '2025-06-15' })
  @IsDateString()
  issued_at!: string;

  @ApiPropertyOptional({ example: '2027-06-15' })
  @ValidateIf((o) => EXPIRING_CATEGORIES.includes(o.category))
  @IsDateString()
  expires_at?: string;
}

export class UpdateCertificationStatusDto {
  @ApiProperty({ example: 'approved' })
  @IsString()
  @IsNotEmpty()
  @IsIn(['approved', 'rejected'])
  status!: string;

  @ApiPropertyOptional({ example: 'Document non lisible' })
  @IsOptional()
  @IsString()
  rejection_reason?: string;
}
