import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Transaction } from '../../domain/entities/transaction.entity'
import { Category } from '../../domain/entities/category.entity'
import { CreateTransactionDto } from '../dto/create-transaction.dto'
import { UpdateTransactionDto } from '../dto/update-transaction.dto'
import { TransactionResponseDto } from '../dto/transaction-response.dto'
import { MockUserService } from '../../domain/services/mock-user.service'


@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly mockUserService: MockUserService,
  ) {}

  async create(createTransactionDto: CreateTransactionDto): Promise<TransactionResponseDto> {
    const userId = this.mockUserService.getCurrentUserId()

    // Validate category if provided
    if (createTransactionDto.categoryId) {
      await this.validateCategory(createTransactionDto.categoryId)
    }

    const transaction = new Transaction(
      createTransactionDto.description,
      createTransactionDto.amount,
      new Date(createTransactionDto.date),
      userId,
      createTransactionDto.categoryId,
      createTransactionDto.notes,
      createTransactionDto.frequency,
    )

    const savedTransaction = await this.transactionRepository.save(transaction)
    return this.mapToResponseDto(savedTransaction)
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    type?: string,
    categoryId?: string,
    frequency?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<{ transactions: TransactionResponseDto[]; total: number; page: number; limit: number }> {
    const userId = this.mockUserService.getCurrentUserId()
    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.category', 'category')
      .where('transaction.userId = :userId', { userId })

    // Apply filters
    if (type) {
      if (type === 'income') {
        queryBuilder.andWhere('transaction.amount > 0')
      } else if (type === 'expense') {
        queryBuilder.andWhere('transaction.amount <= 0')
      }
    }

    if (categoryId) {
      queryBuilder.andWhere('transaction.categoryId = :categoryId', { categoryId })
    }

    if (frequency) {
      queryBuilder.andWhere('transaction.frequency = :frequency', { frequency })
    }

    if (startDate) {
      queryBuilder.andWhere('transaction.date >= :startDate', { startDate })
    }

    if (endDate) {
      queryBuilder.andWhere('transaction.date <= :endDate', { endDate })
    }

    // Apply pagination
    const offset = (page - 1) * limit
    queryBuilder
      .orderBy('transaction.date', 'DESC')
      .addOrderBy('transaction.createdAt', 'DESC')
      .skip(offset)
      .take(limit)

    const [transactions, total] = await queryBuilder.getManyAndCount()

    return {
      transactions: transactions.map(transaction => this.mapToResponseDto(transaction)),
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

    return this.mapToResponseDto(transaction)
  }

  async update(id: string, updateTransactionDto: UpdateTransactionDto): Promise<TransactionResponseDto> {
    const userId = this.mockUserService.getCurrentUserId()
    const transaction = await this.transactionRepository.findOne({
      where: { id, userId },
    })

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`)
    }

    // Amount validation is no longer needed since type is inferred from amount

    // Validate category if provided
    if (updateTransactionDto.categoryId) {
      await this.validateCategory(updateTransactionDto.categoryId)
    }

    // Update transaction
    Object.assign(transaction, updateTransactionDto)
    
    if (updateTransactionDto.date) {
      transaction.date = new Date(updateTransactionDto.date)
    }

    const updatedTransaction = await this.transactionRepository.save(transaction)
    return this.mapToResponseDto(updatedTransaction)
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

  async getSummary(
    startDate?: string,
    endDate?: string,
  ): Promise<{ totalIncome: number; totalExpenses: number; netAmount: number; transactionCount: number }> {
    const userId = this.mockUserService.getCurrentUserId()
    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.userId = :userId', { userId })

    if (startDate) {
      queryBuilder.andWhere('transaction.date >= :startDate', { startDate })
    }

    if (endDate) {
      queryBuilder.andWhere('transaction.date <= :endDate', { endDate })
    }

    const [incomeResult, expenseResult, countResult] = await Promise.all([
      queryBuilder
        .select('SUM(transaction.amount)', 'total')
        .where('transaction.amount > 0')
        .getRawOne(),
      queryBuilder
        .select('SUM(transaction.amount)', 'total')
        .where('transaction.amount <= 0')
        .getRawOne(),
      queryBuilder.getCount(),
    ])

    const totalIncome = parseFloat(incomeResult?.total || '0')
    const totalExpenses = parseFloat(expenseResult?.total || '0')
    const netAmount = totalIncome + totalExpenses // Expenses are negative

    return {
      totalIncome,
      totalExpenses: Math.abs(totalExpenses),
      netAmount,
      transactionCount: countResult,
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

  private mapToResponseDto(transaction: Transaction): TransactionResponseDto {
    const dto = new TransactionResponseDto()
    Object.assign(dto, {
      id: transaction.id,
      description: transaction.description,
      amount: transaction.amount,
      date: transaction.date,
      categoryId: transaction.categoryId,
      categoryName: transaction.category?.name,
      notes: transaction.notes,
      frequency: transaction.frequency,
      userId: transaction.userId,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    })

    // Calculate monthly equivalent for all transactions (they are all recurring)
    if (transaction.frequency) {
      const { Frequency, FrequencyEnum } = require('../../domain/value-objects/frequency.value-object')
      // Ensure the frequency is a valid enum value
      const frequencyValue = Object.values(FrequencyEnum).includes(transaction.frequency) 
        ? transaction.frequency 
        : FrequencyEnum.MONTH // fallback to month if invalid
      const frequency = new Frequency(frequencyValue)
      dto.monthlyEquivalent = frequency.getMonthlyEquivalentDisplay(transaction.amount)
    }

    return dto
  }
}
