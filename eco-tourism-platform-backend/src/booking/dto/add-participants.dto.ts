import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AddParticipantItemDto {
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

export class AddParticipantsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddParticipantItemDto)
  participants!: AddParticipantItemDto[];
}
