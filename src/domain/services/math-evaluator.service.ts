import { Injectable, Logger } from '@nestjs/common'
import { evaluate, isNumber } from 'mathjs'

@Injectable()
export class MathEvaluatorService {
  private readonly logger = new Logger(MathEvaluatorService.name)

  evaluate(expression: string): number {
    try {
      const cleanExpression = (expression ?? '').toString().replace(/\s/g, '')

      const isMathematicalExpression = /^[\d+\-*/().,a-zA-Z\s]+$/.test(cleanExpression)
      
      if (!isMathematicalExpression) {
        throw new Error(`Unsafe characters in expression: ${expression}`)
      }
      
      const result = evaluate(cleanExpression)
      
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
