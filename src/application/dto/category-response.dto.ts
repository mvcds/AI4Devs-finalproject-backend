import { ApiProperty } from '@nestjs/swagger'
import { CategoryFlow } from '../../domain/entities/category.entity'

export class CategoryResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the category',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string

  @ApiProperty({
    description: 'Name of the category',
    example: 'Groceries',
  })
  name: string

  @ApiProperty({
    description: 'Flow type of the category',
    enum: CategoryFlow,
    example: CategoryFlow.EXPENSE,
  })
  flow: CategoryFlow

  @ApiProperty({
    description: 'Color code for the category',
    example: '#EF4444',
    nullable: true,
  })
  color?: string

  @ApiProperty({
    description: 'Description of the category',
    example: 'Food and household items',
    nullable: true,
  })
  description?: string

  @ApiProperty({
    description: 'Parent category ID for hierarchical categories',
    example: '123e4567-e89b-12d3-a456-426614174000',
    nullable: true,
  })
  parentId?: string

  @ApiProperty({
    description: 'Date when the category was created',
    example: '2024-01-15T10:00:00Z',
  })
  createdAt: Date

  @ApiProperty({
    description: 'Date when the category was last updated',
    example: '2024-01-15T10:00:00Z',
  })
  updatedAt: Date
}
