import { ApiProperty } from '@nestjs/swagger'

export class TransactionSummaryDto {
  @ApiProperty({
    description: 'Total income amount',
    example: 1000,
    type: 'number'
  })
  totalIncome: number

  @ApiProperty({
    description: 'Total expenses amount',
    example: 100,
    type: 'number'
  })
  totalExpenses: number

  @ApiProperty({
    description: 'Net amount (income - expenses)',
    example: 900,
    type: 'number'
  })
  netAmount: number

  @ApiProperty({
    description: 'Total number of transactions',
    example: 2,
    type: 'number'
  })
  count: number
}
