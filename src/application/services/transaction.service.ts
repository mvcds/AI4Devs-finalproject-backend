import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Transaction } from '../../domain/entities/transaction.entity'
import { Category } from '../../domain/entities/category.entity'
import { CreateTransactionDto } from '../dto/create-transaction.dto'
import { UpdateTransactionDto } from '../dto/update-transaction.dto'
import { TransactionResponseDto } from '../dto/transaction-response.dto'
import { MockUserService } from '../../domain/services/mock-user.service'
import { TransactionEvaluatorService } from '../../domain/services/transaction-evaluator.service'
import { TransactionSummaryDto } from '../dto/transaction-summary.dto'
import { BudgetPercentagesDto, CategoryPercentageDto, FlowPercentageDto } from '../dto/budget-percentages.dto'
import { CategoryFlow } from '../../domain/entities/category.entity'


@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly mockUserService: MockUserService,
    private readonly transactionEvaluatorService: TransactionEvaluatorService,
  ) {}

  async create(createTransactionDto: CreateTransactionDto): Promise<TransactionResponseDto> {
    const userId = this.mockUserService.getCurrentUserId()

    // Validate category if provided
    if (createTransactionDto.categoryId) {
      await this.validateCategory(createTransactionDto.categoryId)
    }

    // Validate expression doesn't reference itself (for new transactions, this will be empty)
    await this.validateExpressionSelfReference(createTransactionDto.expression, null)

    const transaction = new Transaction(
      createTransactionDto.description,
      createTransactionDto.expression,
      userId,
      createTransactionDto.categoryId,
      createTransactionDto.notes,
      createTransactionDto.frequency,
    )

    const savedTransaction = await this.transactionRepository.save(transaction)
    // Reload with category relation to get categoryName
    const transactionWithCategory = await this.transactionRepository.findOne({
      where: { id: savedTransaction.id },
      relations: ['category'],
    })
    return await this.mapToResponseDto(transactionWithCategory!)
  }

  //TODO: we shouldn't have pagination for transactions
  //in a different moment, we need to limit how many transactions a user can have, possibly remove the ones that were created last
  async findAll(
    page: number = 1,
    limit: number = 10,
    categoryId?: string,
    frequency?: string,
  ): Promise<{ transactions: TransactionResponseDto[]; total: number; page: number; limit: number }> {
    const userId = this.mockUserService.getCurrentUserId()
    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.category', 'category')
      .where('transaction.userId = :userId', { userId })

    // Apply filters
    if (categoryId) {
      queryBuilder.andWhere('transaction.categoryId = :categoryId', { categoryId })
    }

    if (frequency) {
      queryBuilder.andWhere('transaction.frequency = :frequency', { frequency })
    }

    // Apply pagination
    const offset = (page - 1) * limit
    queryBuilder
      .orderBy('transaction.createdAt', 'DESC')
      .skip(offset)
      .take(limit)

    const [transactions, total] = await queryBuilder.getManyAndCount()

    return {
      transactions: await Promise.all(transactions.map(transaction => this.mapToResponseDto(transaction))),
      total,
      page,
      limit,
    }
  }

  async findOne(id: string): Promise<TransactionResponseDto> {
    const userId = this.mockUserService.getCurrentUserId()
    const transaction = await this.transactionRepository.findOne({
      where: { id, userId },
      relations: ['category'],
    })

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`)
    }

    return await this.mapToResponseDto(transaction)
  }

  async update(id: string, updateTransactionDto: UpdateTransactionDto): Promise<TransactionResponseDto> {
    const userId = this.mockUserService.getCurrentUserId()
    const transaction = await this.transactionRepository.findOne({
      where: { id, userId },
      relations: ['category'],
    })

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`)
    }

    // Validate category if provided
    if (updateTransactionDto.categoryId) {
      await this.validateCategory(updateTransactionDto.categoryId)
    }

    // Validate expression doesn't reference itself if expression is being updated
    if (updateTransactionDto.expression !== undefined) {
      await this.validateExpressionSelfReference(updateTransactionDto.expression, id)
    }

    // Use update method to ensure all fields are properly updated
    const updateData: any = {}
    if (updateTransactionDto.description !== undefined) {
      updateData.description = updateTransactionDto.description
    }
    if (updateTransactionDto.expression !== undefined) {
      updateData.expression = updateTransactionDto.expression
    }
    if (updateTransactionDto.categoryId !== undefined) {
      updateData.categoryId = updateTransactionDto.categoryId
    }
    if (updateTransactionDto.notes !== undefined) {
      updateData.notes = updateTransactionDto.notes
    }
    if (updateTransactionDto.frequency !== undefined) {
      updateData.frequency = updateTransactionDto.frequency
    }
    
    await this.transactionRepository.update(id, updateData)
    
    const updatedTransaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ['category'],
    })
    
    if (!updatedTransaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found after update`)
    }
    
    return await this.mapToResponseDto(updatedTransaction)
  }

  async remove(id: string): Promise<void> {
    const userId = this.mockUserService.getCurrentUserId()
    const transaction = await this.transactionRepository.findOne({
      where: { id, userId },
    })

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`)
    }

    await this.transactionRepository.remove(transaction)
  }

  async getSummary(): Promise<TransactionSummaryDto> {
    const userId = this.mockUserService.getCurrentUserId()
    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.userId = :userId', { userId })

    // Get all transactions for this user to calculate frequency-normalized amounts
    const transactions = await queryBuilder.getMany()
    
    let totalIncome = 0
    let totalExpenses = 0
    
    // Calculate frequency-normalized amounts using the transaction evaluator service
    for (const transaction of transactions) {
      const evaluation = await this.transactionEvaluatorService.evaluate(transaction)
      
      if (evaluation.type === 'income') {
        totalIncome += evaluation.normalizedAmount
      } else {
        // For expenses, add the absolute value since expenses are negative
        totalExpenses += Math.abs(evaluation.normalizedAmount)
      }
    }

    const netAmount = totalIncome - totalExpenses

    return {
      totalIncome: Math.round(totalIncome * 100) / 100, // Round to 2 decimal places
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      netAmount: Math.round(netAmount * 100) / 100,
      count: transactions.length,
    }
  }

  async getBudgetPercentages(): Promise<BudgetPercentagesDto> {
    const userId = this.mockUserService.getCurrentUserId()
    
    // Get all transactions with their categories
    const transactions = await this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.category', 'category')
      .where('transaction.userId = :userId', { userId })
      .getMany()

    if (transactions.length === 0) {
      return {
        categoryPercentages: [],
        flowPercentages: [],
        totalAmount: 0
      }
    }

    // Calculate normalized amounts and group by category
    const categoryAmounts = new Map<string, { name: string, color: string, flow: CategoryFlow, amount: number }>()
    const flowAmounts = new Map<CategoryFlow, number>()
    let totalAmount = 0

    for (const transaction of transactions) {
      const evaluation = await this.transactionEvaluatorService.evaluate(transaction)
      const normalizedAmount = Math.abs(evaluation.normalizedAmount)
      
      if (normalizedAmount > 0) {
        const category = transaction.category
        const categoryId = category.id
        
        // Update category amounts
        if (categoryAmounts.has(categoryId)) {
          categoryAmounts.get(categoryId)!.amount += normalizedAmount
        } else {
          categoryAmounts.set(categoryId, {
            name: category.name,
            color: category.color || '#6B7280',
            flow: category.flow,
            amount: normalizedAmount
          })
        }
        
        // Update flow amounts
        if (flowAmounts.has(category.flow)) {
          flowAmounts.set(category.flow, flowAmounts.get(category.flow)! + normalizedAmount)
        } else {
          flowAmounts.set(category.flow, normalizedAmount)
        }
        
        totalAmount += normalizedAmount
      }
    }

    // Calculate percentages
    const categoryPercentages: CategoryPercentageDto[] = Array.from(categoryAmounts.entries()).map(([categoryId, data]) => ({
      categoryId,
      categoryName: data.name,
      categoryColor: data.color,
      flow: data.flow,
      percentage: totalAmount > 0 ? Math.round((data.amount / totalAmount) * 100 * 10) / 10 : 0,
      amount: Math.round(data.amount * 100) / 100
    }))

    const flowPercentages: FlowPercentageDto[] = Array.from(flowAmounts.entries()).map(([flow, amount]) => ({
      flow,
      percentage: totalAmount > 0 ? Math.round((amount / totalAmount) * 100 * 10) / 10 : 0,
      amount: Math.round(amount * 100) / 100
    }))

    // Sort categories by amount (descending)
    categoryPercentages.sort((a, b) => b.amount - a.amount)
    
    // Sort flows by amount (descending)
    flowPercentages.sort((a, b) => b.amount - a.amount)

    return {
      categoryPercentages,
      flowPercentages,
      totalAmount: Math.round(totalAmount * 100) / 100
    }
  }



  private async validateCategory(categoryId: string): Promise<void> {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    })

    if (!category) {
      throw new BadRequestException(`Category with ID ${categoryId} not found`)
    }
  }

  private async validateExpressionSelfReference(expression: string, transactionId: string | null): Promise<void> {
    if (!expression || !transactionId) {
      return // No validation needed for new transactions or if no expression
    }

    // Check if expression contains a reference to itself
    const transactionReferenceRegex = /\$([a-zA-Z0-9-]+)/g
    const matches = Array.from(expression.matchAll(transactionReferenceRegex))
    
    for (const match of matches) {
      const referencedTransactionId = match[1]
      if (referencedTransactionId === transactionId) {
        throw new BadRequestException('Transaction cannot reference itself in its expression')
      }
    }
  }

  private async mapToResponseDto(transaction: Transaction): Promise<TransactionResponseDto> {
    const dto = new TransactionResponseDto()

    // Evaluate the transaction using the transaction evaluator service
    const evaluation = await this.transactionEvaluatorService.evaluate(transaction)

    Object.assign(dto, transaction, {
      categoryName: transaction.category?.name,
      amount: evaluation.amount,
      normalizedAmount: evaluation.normalizedAmount,
    })

    return dto
  }
}
