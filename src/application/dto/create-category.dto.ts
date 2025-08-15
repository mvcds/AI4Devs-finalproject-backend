import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsEnum, IsOptional, IsUUID } from 'class-validator'
import { CategoryFlow } from '../../domain/entities/category.entity'

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Name of the category',
    example: 'Groceries',
  })
  @IsString()
  name: string

  @ApiProperty({
    description: 'Flow type of the category',
    enum: CategoryFlow,
    example: CategoryFlow.EXPENSE,
  })
  @IsEnum(CategoryFlow)
  flow: CategoryFlow

  @ApiProperty({
    description: 'Color code for the category',
    example: '#EF4444',
    required: false,
  })
  @IsOptional()
  @IsString()
  color?: string

  @ApiProperty({
    description: 'Description of the category',
    example: 'Food and household items',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({
    description: 'Parent category ID for hierarchical categories',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  parentId?: string
}
