import { IsNotEmpty, IsEnum, IsOptional, IsString } from 'class-validator';
import { PaymentMethod } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class PaySessionDto {
  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.KONOOM_MONEY, description: 'Méthode de paiement choisie' })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ example: '+23560000000', description: 'Numéro de téléphone pour Mobile Money' })
  @IsOptional()
  @IsString()
  customerPhone?: string;
}
