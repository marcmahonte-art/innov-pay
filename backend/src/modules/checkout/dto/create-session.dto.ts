import { IsNotEmpty, IsNumber, IsString, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSessionDto {
  @ApiProperty({ example: 5000, description: 'Montant de la transaction' })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'XAF', description: 'Devise' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ example: 'order_ref_123', description: 'Référence unique du marchand' })
  @IsNotEmpty()
  @IsString()
  merchantReference: string;

  @ApiProperty({ example: 'client@example.com', description: 'Email du client' })
  @IsNotEmpty()
  @IsEmail()
  customerEmail: string;

  @ApiProperty({ example: '+23560000000', description: 'Téléphone du client (facultatif)' })
  @IsOptional()
  @IsString()
  customerPhone?: string;

  @ApiProperty({ example: 'https://example.com/success', description: 'URL de redirection après succès' })
  @IsOptional()
  @IsString()
  successUrl?: string;

  @ApiProperty({ example: 'https://example.com/cancel', description: 'URL de redirection après annulation' })
  @IsOptional()
  @IsString()
  cancelUrl?: string;

  @ApiProperty({ example: { orderId: '123' }, description: 'Métadonnées optionnelles' })
  @IsOptional()
  metadata?: any;
}
