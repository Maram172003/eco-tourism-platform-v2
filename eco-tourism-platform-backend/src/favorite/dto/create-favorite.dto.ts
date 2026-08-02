import { IsIn, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateFavoriteDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['offer', 'circuit', 'venue', 'guide'])
  target_type!: string;

  @IsUUID()
  @IsNotEmpty()
  target_id!: string;
}
