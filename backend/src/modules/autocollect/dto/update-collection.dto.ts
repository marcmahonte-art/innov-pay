// update-collection.dto.ts
import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';

export class UpdateCollectionDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(['SINGLE', 'MONTHLY', 'TRIMESTRIAL', 'FREE'])
  type?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  endDate?: string; // ISO string

  @IsOptional()
  @IsString()
  reminderMsg?: string;

  @IsOptional()
  @IsString()
  frequency?: string;
}
