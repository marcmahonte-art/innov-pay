import { IsNotEmpty, IsNumber, IsString, IsOptional, IsBoolean, IsDateString, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePayLinkDto {
  @ApiProperty({ example: 'Paiement Formation Digital', description: 'Titre du lien de paiement' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Inscription à la formation marketing digital - Janvier 2026', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 25000, description: 'Montant en FCFA' })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ example: 'XAF', description: 'Devise (XAF par défaut)', required: false })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ example: false, description: 'true = lien multi-usage (accepte plusieurs paiements)', required: false })
  @IsBoolean()
  @IsOptional()
  isReusable?: boolean;

  @ApiProperty({ example: '2026-12-31T23:59:59Z', description: 'Date d\'expiration du lien', required: false })
  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @ApiProperty({ example: 100, description: 'Nombre maximum de paiements (pour liens réutilisables)', required: false })
  @IsInt()
  @IsOptional()
  maxPayments?: number;
}
