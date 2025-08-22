import { ApiProperty, PartialType } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'
import { CreateTransactionDto } from './create-transaction.dto'

export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {
  @ApiProperty({
    description: 'Transaction expression (e.g., "35", "-12", "@uuid_transaction * 0.12")',
    example: '35',
    maxLength: 1000,
    required: false
  })
  @IsOptional()
  expression?: string
}
