import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'E-Shop Chad', description: 'Business name of the merchant' })
  @IsString()
  @IsNotEmpty()
  businessName: string;

  @ApiProperty({ example: 'admin@eshop.td', description: 'Business email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+23566000000', description: 'Contact phone number' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'N\'Djamena, Tchad', description: 'Physical address of the business', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: 'Ali Mahamat', description: 'Full name of the primary administrator' })
  @IsString()
  @IsNotEmpty()
  adminName: string;

  @ApiProperty({ example: 'SecurePassword123!', description: 'Strong password for authentication' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;
}
