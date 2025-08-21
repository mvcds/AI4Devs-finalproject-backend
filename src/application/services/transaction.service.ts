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
    // Reload with category relation to get categoryName
    const transactionWithCategory = await this.transactionRepository.findOne({
      where: { id: savedTransaction.id },
      relations: ['category'],
    })
    return this.mapToResponseDto(transactionWithCategory!)
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
      relations: ['category'],
    })

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`)
    }

    // Validate category if provided
    if (updateTransactionDto.categoryId) {
      await this.validateCategory(updateTransactionDto.categoryId)
    }

    // Use update method to ensure all fields are properly updated
    const updateData: any = {}
    if (updateTransactionDto.description !== undefined) {
      updateData.description = updateTransactionDto.description
    }
    if (updateTransactionDto.amount !== undefined) {
      updateData.amount = updateTransactionDto.amount
    }
    if (updateTransactionDto.date !== undefined) {
      updateData.date = new Date(updateTransactionDto.date)
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

    // Get all transactions for this user and date range to calculate frequency-normalized amounts
    const transactions = await queryBuilder.getMany()
    
    let totalIncome = 0
    let totalExpenses = 0
    
    // Calculate frequency-normalized amounts
    for (const transaction of transactions) {
      const { Frequency, FrequencyEnum } = require('../../domain/value-objects/frequency.value-object')
      
      const frequencyValue = Object.values(FrequencyEnum).includes(transaction.frequency) 
        ? transaction.frequency 
        : FrequencyEnum.MONTH
      
      const frequency = new Frequency(frequencyValue)
      const monthlyEquivalent = frequency.calculateMonthlyEquivalent(transaction.amount)
      
      if (monthlyEquivalent > 0) {
        totalIncome += monthlyEquivalent
      } else {
        totalExpenses += Math.abs(monthlyEquivalent)
      }
    }

    const netAmount = totalIncome - totalExpenses

    return {
      totalIncome: Math.round(totalIncome * 100) / 100, // Round to 2 decimal places
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      netAmount: Math.round(netAmount * 100) / 100,
      transactionCount: transactions.length,
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
    const { Frequency, FrequencyEnum } = require('../../domain/value-objects/frequency.value-object')

    const dto = new TransactionResponseDto()

    const frequencyValue = Object.values(FrequencyEnum).includes(transaction.frequency) 
      ? transaction.frequency 
      : FrequencyEnum.MONTH

    const frequency = new Frequency(frequencyValue)

    Object.assign(dto, transaction, {
      categoryName: transaction.category?.name,
      monthlyEquivalent:  frequency.getMonthlyEquivalentDisplay(transaction.amount)
    })

    return dto
  }
}
