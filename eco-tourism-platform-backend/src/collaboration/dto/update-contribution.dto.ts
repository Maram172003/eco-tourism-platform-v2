import { IsObject, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateContributionDto {
  @ApiPropertyOptional({
    description: "Données de contribution du guide (wizard 8 étapes)",
  })
  @IsObject()
  @IsOptional()
  contribution?: Record<string, any>;
}
