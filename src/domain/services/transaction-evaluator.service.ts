import { Injectable, Logger } from '@nestjs/common'
import { TransactionTypeEnum } from '../value-objects/transaction-type.value-object'
import { Frequency } from '../value-objects/frequency.value-object'
import { MathEvaluatorService } from './math-evaluator.service'
import { Transaction } from '../entities/transaction.entity'

export interface TransactionEvaluationResult {
  amount: number
  type: TransactionTypeEnum,
  normalizedAmount: number
}

@Injectable()
export class TransactionEvaluatorService {
  private readonly logger = new Logger(TransactionEvaluatorService.name)

  constructor(private readonly mathEvaluatorService: MathEvaluatorService) {}

  evaluate(transaction: Transaction): TransactionEvaluationResult {
    try {
      const raw = this.mathEvaluatorService.evaluate(transaction.expression.toString())
      const amount = Number.isFinite(raw) ? raw : 0
      
      const type = amount > 0 ? TransactionTypeEnum.INCOME : TransactionTypeEnum.EXPENSE

      const frequency = new Frequency(transaction.frequency)

      return {
        amount,
        type,
        normalizedAmount: frequency.calculatenormalizedAmount(amount)
      }
    } catch (error) {
      this.logger.error(`Failed to evaluate transaction: ${error.message}`)
      throw new Error(`Cannot evaluate transaction expression: ${error.message}`)
    }
  }
}
