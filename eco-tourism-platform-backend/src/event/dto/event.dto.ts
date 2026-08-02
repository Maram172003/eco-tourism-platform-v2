import { IsArray, IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateEventDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsIn([
    'festival',
    'concert',
    'market',
    'competition',
    'exhibition',
    'workshop',
    'other',
  ])
  event_type!: string;

  @IsString()
  start_date!: string;

  @IsOptional()
  @IsString()
  end_date?: string;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsString()
  external_url?: string;
}

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn([
    'festival',
    'concert',
    'market',
    'competition',
    'exhibition',
    'workshop',
    'other',
  ])
  event_type?: string;

  @IsOptional()
  @IsString()
  start_date?: string;

  @IsOptional()
  @IsString()
  end_date?: string;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsString()
  external_url?: string;

  @IsOptional()
  @IsIn(['published', 'cancelled'])
  status?: string;
}
