import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsInt, IsArray } from 'class-validator';

export class CompleteOwnerProfileDto {
  @ApiProperty({ example: 'Ahmed Benali' })
  @IsString()
  @IsNotEmpty()
  full_name!: string;

  @ApiProperty({
    example: "Chef d'entreprise touristique basé à Djerba, passionné d'écotourisme.",
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ example: 'TN' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ example: 'fr' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({ example: 'https://example.com/photo.jpg' })
  @IsOptional()
  @IsString()
  photo?: string;

  @ApiProperty({ example: 'https://example.com/cover.jpg' })
  @IsOptional()
  @IsString()
  cover_photo?: string;

  @ApiProperty({ example: 'Dar Djerba Eco-Lodge' })
  @IsOptional()
  @IsString()
  organization?: string;

  @ApiProperty({ example: 'Directeur' })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiProperty({ example: '+216 75 123 456' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: '+216 75 123 456' })
  @IsOptional()
  @IsString()
  whatsapp?: string;

  @ApiProperty({ example: 'https://nardardjerba.tn' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({ example: 'https://fb.com/nardardjerba.tn' })
  @IsOptional()
  @IsString()
  facebook?: string;

  @ApiProperty({ example: 'https://instagram.com/nardardjerba.tn' })
  @IsOptional()
  @IsString()
  instagram?: string;

  @ApiProperty({ example: '@nardardjerba' })
  @IsOptional()
  @IsString()
  tiktok?: string;

  @ApiProperty({ example: 'Djerba' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'Djerba' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiProperty({ example: 4 })
  @IsOptional()
  @IsInt()
  years_experience?: number;

  @ApiProperty({ example: 'Houmt Souk, Djerba' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 33.875 })
  @IsOptional()
  lat?: number;

  @ApiProperty({ example: 10.858 })
  @IsOptional()
  lng?: number;

  @ApiProperty({ example: ['Guide certifié Éco-Voyage', 'Green Key'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];
}
