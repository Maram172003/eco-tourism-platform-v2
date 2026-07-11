import {
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreatePhotoDto {
  @IsString()
  url!: string;

  @IsIn(['publication', 'offer', 'circuit', 'profile'])
  entity_type!: string;

  @IsUUID()
  entity_id!: string;

  @IsOptional()
  @IsBoolean()
  is_hero?: boolean;
}

export class UpdatePhotoDto {
  @IsOptional()
  @IsBoolean()
  is_hero?: boolean;
}
