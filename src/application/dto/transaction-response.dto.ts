import { ApiProperty } from '@nestjs/swagger'
import { Expose, Transform } from 'class-transformer'
import { FrequencyEnum } from '../../domain/value-objects/frequency.value-object'
import { Expression } from '../../domain/value-objects/expression.value-object'

export class TransactionResponseDto {
  @ApiProperty({
    description: 'Transaction ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @Expose()
  id: string

  @ApiProperty({
    description: 'Transaction description',
    example: 'Monthly Salary'
  })
  @Expose()
  description: string

  @ApiProperty({
    description: 'Transaction expression',
    example: '35'
  })
  @Expose()
  expression: Expression

  @ApiProperty({
    description: 'Evaluated transaction amount',
    example: 35
  })
  @Expose()
  amount: number


  @ApiProperty({
    description: 'Category ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @Expose()
  categoryId: string

  @ApiProperty({
    description: 'Category name',
    example: 'Salary'
  })
  @Expose()
  categoryName?: string

  @ApiProperty({
    description: 'Transaction notes',
    example: 'January 2024 salary',
    required: false
  })
  @Expose()
  notes?: string

  @ApiProperty({
    description: 'Transaction frequency',
    enum: FrequencyEnum,
    example: FrequencyEnum.MONTH
  })
  @Expose()
  frequency: FrequencyEnum

  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @Expose()
  userId: string

  @ApiProperty({
    description: 'Creation date',
    example: '2024-01-15T10:00:00Z'
  })
  @Expose()
  createdAt: Date

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-15T10:00:00Z'
  })
  @Expose()
  updatedAt: Date

  @ApiProperty({
    description: 'Monthly equivalent amount for recurring transactions',
    example: 35
  })
  @Expose()
  monthlyEquivalent?: number
}
