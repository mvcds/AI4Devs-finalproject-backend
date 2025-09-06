import { Injectable, Logger } from '@nestjs/common'
import { evaluate, isNumber } from 'mathjs'
import { TransactionReferenceResolverService } from './transaction-reference-resolver.service'

@Injectable()
export class MathEvaluatorService {
  private readonly logger = new Logger(MathEvaluatorService.name)

  constructor(
    private readonly transactionReferenceResolver: TransactionReferenceResolverService
  ) {}

  async evaluate(expression: string, userId?: string): Promise<number> {
    try {
      const cleanExpression = (expression ?? '').toString().replace(/\s/g, '')

      const isMathematicalExpression = /^[\d+\-*/().,a-zA-Z\s$]+$/.test(cleanExpression)
      
      if (!isMathematicalExpression) {
        throw new Error(`Unsafe characters in expression: ${expression}`)
      }
      
      // Resolve transaction references if userId is provided
      let expressionToEvaluate = cleanExpression
      if (userId && cleanExpression.includes('$')) {
        expressionToEvaluate = await this.transactionReferenceResolver.resolveReferences(cleanExpression, userId)
      }
      
      const result = evaluate(expressionToEvaluate)
      
      if (!isNumber(result)) {
        throw new Error(`Expression result is not a number: ${expression}`)
      }
      
      return result
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Cannot evaluate expression "${expression}": ${error.message}`)
      }
      throw new Error(`Cannot evaluate expression: ${expression}`)
    }
  }
}
