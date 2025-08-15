import { IsString, IsNumber, IsDateString, IsOptional, IsUUID, Min, MaxLength, IsEnum, IsNotEmpty } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { FrequencyEnum } from '../../domain/value-objects/frequency.value-object'

export class CreateTransactionDto {
  @ApiProperty({
    description: 'Transaction description',
    example: 'Salary payment',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  description: string

  @ApiProperty({
    description: 'Transaction amount (positive for income, negative for expense)',
    example: 1500.00,
    minimum: -999999999.99,
    maximum: 999999999.99,
  })
  @IsNumber()
  @Min(-999999999.99)
  amount: number



  @ApiProperty({
    description: 'Transaction date',
    example: '2024-01-15',
  })
  @IsDateString()
  date: string

  @ApiProperty({
    description: 'Category ID for the transaction',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string

  @ApiPropertyOptional({
    description: 'Additional notes for the transaction',
    example: 'Monthly salary payment',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string

  @ApiProperty({
    description: 'Transaction frequency (all transactions are recurring)',
    example: 'month',
    enum: FrequencyEnum,
  })
  @IsEnum(FrequencyEnum)
  @IsNotEmpty()
  frequency: FrequencyEnum


}
