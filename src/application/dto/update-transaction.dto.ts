import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength, IsUUID, IsEnum } from 'class-validator'
import { FrequencyEnum } from '../../domain/value-objects/frequency.value-object'

export class UpdateTransactionDto {
  @ApiProperty({
    description: 'Transaction description',
    example: 'Monthly Salary',
    maxLength: 255,
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string
  
  @ApiProperty({
    description: 'Transaction expression (e.g., "35", "-12", "@uuid_transaction * 0.12")',
    example: '35',
    maxLength: 1000,
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  expression?: string

  @ApiProperty({
    description: 'Category ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string

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
    example: FrequencyEnum.MONTH,
    required: false
  })
  @IsOptional()
  @IsEnum(FrequencyEnum)
  frequency?: FrequencyEnum
}
