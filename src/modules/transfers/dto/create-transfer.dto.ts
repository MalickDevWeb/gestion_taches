import { IsNotEmpty, IsString, IsNumber, IsObject, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class RecipientDto {
  @ApiProperty({
    description: 'Recipient phone number',
    example: '+1234567890'
  })
  @IsNotEmpty()
  @IsString()
  phone!: string;

  @ApiProperty({
    description: 'Recipient full name',
    example: 'John Doe'
  })
  @IsNotEmpty()
  @IsString()
  name!: string;
}

export class CreateTransferDto {
  @ApiProperty({
    description: 'Transfer amount',
    example: 1000,
    minimum: 0.01
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'XOF'
  })
  @IsNotEmpty()
  @IsString()
  currency!: string;

  @ApiProperty({
    description: 'Transfer channel',
    example: 'mobile'
  })
  @IsNotEmpty()
  @IsString()
  channel!: string;

  @ApiProperty({
    description: 'Recipient information',
    type: RecipientDto
  })
  @IsNotEmpty()
  @IsObject()
  recipient!: RecipientDto;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { source: 'web' }
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Transfer reference',
    example: 'TXN-12345'
  })
  @IsOptional()
  @IsString()
  reference?: string;
}
