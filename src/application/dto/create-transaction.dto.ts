import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsOptional, IsUUID, IsNotEmpty, IsEnum, MaxLength, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { FrequencyEnum } from '../../domain/value-objects/frequency.value-object'
import { Expression } from '../../domain/value-objects/expression.value-object'

export class CreateTransactionDto {
  @ApiProperty({
    description: 'Transaction description',
    example: 'Monthly Salary',
    maxLength: 255
  })
  @IsString()
  @IsNotEmpty()
  description: string
  
  @ApiProperty({
    description: 'Transaction expression (e.g., "35", "-12", "@uuid_transaction * 0.12")',
    example: '100',
    maxLength: 1000
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  expression: string

  @ApiProperty({
    description: 'Category ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string

  @ApiProperty({
    description: 'Transaction notes',
    example: 'January 2024 salary',
    required: false,
    maxLength: 1000
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string

  @ApiProperty({
    description: 'Transaction frequency',
    enum: FrequencyEnum,
    example: FrequencyEnum.MONTH
  })
  @IsEnum(FrequencyEnum)
  @IsNotEmpty()
  frequency: FrequencyEnum
}
