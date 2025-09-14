import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString, IsEnum } from 'class-validator'
import { CategoryFlow } from '../../domain/entities/category.entity'

export class UpdateCategoryDto {
  @ApiProperty({
    description: 'Name of the category',
    example: 'Groceries',
    required: false
  })
  @IsOptional()
  @IsString()
  name?: string

  @ApiProperty({
    description: 'Flow type of the category',
    enum: CategoryFlow,
    example: CategoryFlow.EXPENSE,
    required: false
  })
  @IsOptional()
  @IsEnum(CategoryFlow)
  flow?: CategoryFlow

  @ApiProperty({
    description: 'Color code for the category',
    example: '#EF4444',
    required: false
  })
  @IsOptional()
  @IsString()
  color?: string

  @ApiProperty({
    description: 'Description of the category',
    example: 'Food and household items',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string

}
