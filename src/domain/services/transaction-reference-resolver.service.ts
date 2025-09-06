import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { evaluate, isNumber } from 'mathjs'
import { Transaction } from '../entities/transaction.entity'

@Injectable()
export class TransactionReferenceResolverService {
  private readonly logger = new Logger(TransactionReferenceResolverService.name)

  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>
  ) {}

  /**
   * Resolves transaction references in an expression by replacing $transactionId with the actual amount
   * @param expression The expression containing transaction references
   * @param userId The user ID to ensure transactions belong to the user
   * @returns The expression with transaction references resolved to their amounts
   */
  async resolveReferences(expression: string, userId: string): Promise<string> {
    return this.resolveReferencesWithTracking(expression, userId, new Set())
  }

  /**
   * Internal method that tracks resolved transaction IDs to detect circular references
   * @param expression The expression containing transaction references
   * @param userId The user ID to ensure transactions belong to the user
   * @param resolvedIds Set of transaction IDs currently being resolved
   * @returns The expression with transaction references resolved to their amounts
   */
  private async resolveReferencesWithTracking(
    expression: string, 
    userId: string, 
    resolvedIds: Set<string>
  ): Promise<string> {
    const transactionReferenceRegex = /\$([a-zA-Z0-9-]+)/g
    const matches = Array.from(expression.matchAll(transactionReferenceRegex))
    
    if (matches.length === 0) {
      return expression
    }

    const transactionIds = matches.map(match => match[1])
    
    // Check for circular references before fetching from database
    for (const transactionId of transactionIds) {
      if (resolvedIds.has(transactionId)) {
        const cyclePath = Array.from(resolvedIds).join(' -> ') + ' -> ' + transactionId
        throw new Error(`Circular reference detected: ${cyclePath}`)
      }
    }

    const transactions = await this.transactionRepository.find({
      where: transactionIds.map(id => ({ id, userId })),
      select: ['id', 'expression']
    })

    const transactionMap = new Map(
      transactions.map(tx => [tx.id, tx])
    )

    let resolvedExpression = expression

    for (const match of matches) {
      const fullMatch = match[0] // e.g., "$65c2fad6-922d-4a98-b445-b22df83aca14"
      const transactionId = match[1] // e.g., "65c2fad6-922d-4a98-b445-b22df83aca14"
      
      const transaction = transactionMap.get(transactionId)
      
      if (!transaction) {
        this.logger.warn(`Transaction reference not found: ${transactionId}`)
        throw new Error(`Transaction reference not found: ${transactionId}`)
      }

      // Add current transaction ID to tracking set
      resolvedIds.add(transactionId)
      
      try {
        // Recursively resolve references in the referenced transaction
        const resolvedAmount = await this.resolveReferencesWithTracking(
          transaction.expression.toString(), 
          userId, 
          resolvedIds
        )
        
        // Evaluate the resolved expression to get the numeric value
        const numericValue = this.evaluateSimpleExpression(resolvedAmount)
        
        // Replace all occurrences of the reference with the numeric value
        resolvedExpression = resolvedExpression.replace(
          new RegExp(fullMatch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), 
          numericValue.toString()
        )
      } finally {
        // Remove transaction ID from tracking set after resolution
        resolvedIds.delete(transactionId)
      }
    }

    return resolvedExpression
  }

  /**
   * Evaluates a simple mathematical expression (no transaction references)
   * @param expression The expression to evaluate
   * @returns The numeric result
   */
  private evaluateSimpleExpression(expression: string): number {
    try {
      // Basic evaluation for simple expressions
      const cleanExpression = expression.replace(/\s/g, '')
      
      // Validate that it's a safe mathematical expression
      if (!/^[\d+\-*/().,]+$/.test(cleanExpression)) {
        throw new Error(`Invalid expression: ${expression}`)
      }
      
      // Use mathjs for safe evaluation
      const result = evaluate(cleanExpression)
      
      if (!isNumber(result)) {
        throw new Error(`Expression result is not a valid number: ${expression}`)
      }
      
      return result
    } catch (error) {
      this.logger.error(`Failed to evaluate simple expression: ${expression}`, error)
      throw new Error(`Cannot evaluate expression: ${expression}`)
    }
  }
}
