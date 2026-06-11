import { IsEmail, IsNotEmpty, IsNumber, IsString, IsEnum, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';

export class CreatePaymentDto {
  @ApiProperty({ example: 5000, description: 'Amount to charge in FCFA (XAF)' })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ example: 'XAF', description: 'Currency code. Must be XAF for CEMAC region' })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({ example: 'AIRTEL_MONEY', enum: PaymentMethod, description: 'Payment channel/provider' })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ example: 'customer@gmail.com', description: 'Customer email address' })
  @IsEmail()
  customerEmail: string;

  @ApiProperty({ example: '+23566000000', description: 'Customer phone number (required for mobile money)', required: false })
  @IsString()
  @IsOptional()
  customerPhone?: string;

  @ApiProperty({ example: 'order_ref_9841', description: 'Unique invoice/order ID from merchant platform' })
  @IsString()
  @IsNotEmpty()
  merchantReference: string;

  @ApiProperty({ example: { orderId: 104, itemId: 'laptop' }, description: 'Arbitrary key-value metadata', required: false })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
