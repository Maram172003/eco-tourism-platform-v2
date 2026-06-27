import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProjectDto {
  @ApiProperty({ example: 'Éco-Lodge Sahara' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  project_type?: string[];

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsString()
  region?: string;

  @IsOptional() @IsString()
  address?: string;

  @IsOptional() @IsNumber() @Type(() => Number)
  lat?: number;

  @IsOptional() @IsNumber() @Type(() => Number)
  lng?: number;

  @IsOptional() @IsString()
  photo?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  photos?: string[];

  @IsOptional() @IsString()
  opening_hours?: string;

  @IsOptional() @IsString()
  facebook?: string;

  @IsOptional() @IsString()
  instagram?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  services?: string[];

  @IsOptional() @IsArray() @IsString({ each: true })
  eco_labels?: string[];

  @IsOptional() @IsString()
  website?: string;

  @IsOptional() @IsString()
  phone?: string;
}

export class ProjectSustainabilityDto {
  @IsInt()
  @Min(0)
  @Max(100)
  score!: number;
}

export class UpdateProjectDto {
  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  project_type?: string[];

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsString()
  region?: string;

  @IsOptional() @IsString()
  address?: string;

  @IsOptional() @IsNumber() @Type(() => Number)
  lat?: number;

  @IsOptional() @IsNumber() @Type(() => Number)
  lng?: number;

  @IsOptional() @IsString()
  photo?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  photos?: string[];

  @IsOptional() @IsString()
  opening_hours?: string;

  @IsOptional() @IsString()
  facebook?: string;

  @IsOptional() @IsString()
  instagram?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  services?: string[];

  @IsOptional() @IsArray() @IsString({ each: true })
  eco_labels?: string[];

  @IsOptional() @IsString()
  website?: string;

  @IsOptional() @IsString()
  phone?: string;
}
