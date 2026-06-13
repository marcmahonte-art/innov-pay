import { IsNotEmpty, IsString, IsNumber, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PayoutItemDto {
  @ApiProperty({ example: '+23566000000', description: 'Numéro de téléphone du bénéficiaire' })
  @IsString()
  @IsNotEmpty()
  recipientPhone: string;

  @ApiProperty({ example: 'Moussa Ibrahim', description: 'Nom du bénéficiaire', required: false })
  @IsString()
  @IsOptional()
  recipientName?: string;

  @ApiProperty({ example: 15000, description: 'Montant à envoyer en FCFA' })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ example: 'airtel', description: 'Opérateur du bénéficiaire: airtel, moov, konoom' })
  @IsString()
  @IsNotEmpty()
  provider: string;
}

export class CreateBulkPayoutDto {
  @ApiProperty({ example: 'XAF', description: 'Devise', required: false })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({
    type: [PayoutItemDto],
    description: 'Liste des bénéficiaires',
    example: [
      { recipientPhone: '+23566000001', recipientName: 'Ali', amount: 10000, provider: 'airtel' },
      { recipientPhone: '+23566000002', recipientName: 'Fatima', amount: 15000, provider: 'konoom' },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PayoutItemDto)
  items: PayoutItemDto[];
}
