import { ApiProperty } from '@nestjs/swagger'
import { CategoryFlow } from '../../domain/entities/category.entity'

export class CategoryPercentageDto {
  @ApiProperty({
    description: 'Category ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  categoryId: string

  @ApiProperty({
    description: 'Category name',
    example: 'Salary'
  })
  categoryName: string

  @ApiProperty({
    description: 'Category color',
    example: '#10B981'
  })
  categoryColor: string

  @ApiProperty({
    description: 'Category flow type',
    enum: CategoryFlow,
    example: CategoryFlow.INCOME
  })
  flow: CategoryFlow

  @ApiProperty({
    description: 'Percentage of total budget (0-100)',
    example: 35.7,
    type: 'number'
  })
  percentage: number

  @ApiProperty({
    description: 'Normalized monthly amount',
    example: 3000,
    type: 'number'
  })
  amount: number
}

export class FlowPercentageDto {
  @ApiProperty({
    description: 'Flow type',
    enum: CategoryFlow,
    example: CategoryFlow.INCOME
  })
  flow: CategoryFlow

  @ApiProperty({
    description: 'Percentage of total budget (0-100)',
    example: 58.8,
    type: 'number'
  })
  percentage: number

  @ApiProperty({
    description: 'Total normalized monthly amount for this flow',
    example: 5000,
    type: 'number'
  })
  amount: number
}

export class BudgetPercentagesDto {
  @ApiProperty({
    description: 'Category percentages',
    type: [CategoryPercentageDto]
  })
  categoryPercentages: CategoryPercentageDto[]

  @ApiProperty({
    description: 'Flow percentages',
    type: [FlowPercentageDto]
  })
  flowPercentages: FlowPercentageDto[]

  @ApiProperty({
    description: 'Total normalized monthly amount',
    example: 8500,
    type: 'number'
  })
  totalAmount: number
}
