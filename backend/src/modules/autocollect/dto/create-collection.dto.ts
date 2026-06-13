// create-collection.dto.ts
import { IsString, IsEnum, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MemberDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsNumber()
  amount: number;
}

export class CreateCollectionDto {
  @IsString()
  name: string;

  @IsEnum(['SINGLE', 'MONTHLY', 'TRIMESTRIAL', 'FREE'])
  type: string;

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

  @IsString()
  frequency: string; // e.g. "7_DAYS_BEFORE,3_DAYS_BEFORE,D_DAY"

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MemberDto)
  members: MemberDto[];
}
