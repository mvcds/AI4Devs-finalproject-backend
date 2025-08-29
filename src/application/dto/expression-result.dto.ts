import { ApiProperty } from '@nestjs/swagger'

export class ExpressionResult {
  @ApiProperty({
    description: 'Evaluated amount from the expression',
    example: 1000,
    type: 'number'
  })
  amount: number

  @ApiProperty({
    description: 'Type of transaction based on amount',
    enum: ['income', 'expense'],
    example: 'income'
  })
  type: 'income' | 'expense'

  @ApiProperty({
    description: 'Amount normalized to monthly frequency',
    example: 1000,
    type: 'number'
  })
  normalizedAmount: number

  @ApiProperty({
    description: 'Whether the expression was valid and could be evaluated',
    example: true,
    type: 'boolean'
  })
  isValid: boolean
}

