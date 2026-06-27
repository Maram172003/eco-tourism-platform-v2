import { IsString, IsNotEmpty } from 'class-validator';

export class RejectDto {
  @IsString()
  @IsNotEmpty()
  reason!: string;
}
