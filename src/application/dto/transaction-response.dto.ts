import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Transform } from 'class-transformer'

export class TransactionResponseDto {
  @ApiProperty({
    description: 'Transaction ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Expose()
  id: string

  @ApiProperty({
    description: 'Transaction description',
    example: 'Salary payment',
  })
  @Expose()
  description: string

  @ApiProperty({
    description: 'Transaction amount',
    example: 1500.00,
  })
  @Expose()
  amount: number



  @ApiProperty({
    description: 'Transaction date',
    example: '2024-01-15',
  })
  @Expose()
  @Transform(({ value }) => value.toISOString().split('T')[0])
  date: Date

  @ApiPropertyOptional({
    description: 'Category ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @Expose()
  categoryId?: string

  @ApiPropertyOptional({
    description: 'Category name',
    example: 'Salary',
  })
  @Expose()
  categoryName?: string

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Monthly salary payment',
  })
  @Expose()
  notes?: string

  @ApiProperty({
    description: 'User ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Expose()
  userId: string

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:00:00.000Z',
  })
  @Expose()
  @Transform(({ value }) => value.toISOString())
  createdAt: Date

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T10:00:00.000Z',
  })
  @Expose()
  @Transform(({ value }) => value.toISOString())
  updatedAt: Date
}
