import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { RecurrenceHandlerService, RecurrencePattern } from './recurrence-handler.service'
import { Frequency, FrequencyEnum } from '../value-objects/frequency.value-object'

export interface RecurringTransaction {
  id: string
  description: string
  amount: number
  frequency: Frequency
  startDate: Date
  endDate?: Date
  maxOccurrences?: number
  categoryId?: string
  userId: string
  isActive: boolean
  lastProcessedDate?: Date
  nextOccurrenceDate: Date
  createdAt: Date
  updatedAt: Date
}

export interface TransactionNotification {
  transactionId: string
  userId: string
  description: string
  amount: number
  dueDate: Date
  daysUntilDue: number
  frequency: string
}

@Injectable()
export class RecurringTransactionService {
  private readonly logger = new Logger(RecurringTransactionService.name)

  constructor(
    private readonly recurrenceHandler: RecurrenceHandlerService
  ) {}

  /**
   * Process recurring transactions - runs daily at midnight
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async processRecurringTransactions(): Promise<void> {
    this.logger.log('Processing recurring transactions...')
    
    try {
      // This would typically fetch from database
      // For now, we'll simulate the process
      const recurringTransactions = await this.getActiveRecurringTransactions()
      
      for (const transaction of recurringTransactions) {
        await this.processRecurringTransaction(transaction)
      }
      
      this.logger.log(`Processed ${recurringTransactions.length} recurring transactions`)
    } catch (error) {
      this.logger.error('Error processing recurring transactions', error)
    }
  }

  /**
   * Check for upcoming transactions (3 days before) - runs daily at 9 AM
   */
  @Cron('0 9 * * *')
  async checkUpcomingTransactions(): Promise<void> {
    this.logger.log('Checking for upcoming recurring transactions...')
    
    try {
      const upcomingNotifications = await this.getUpcomingTransactionNotifications()
      
      for (const notification of upcomingNotifications) {
        await this.sendTransactionNotification(notification)
      }
      
      if (upcomingNotifications.length > 0) {
        this.logger.log(`Sent ${upcomingNotifications.length} upcoming transaction notifications`)
      }
    } catch (error) {
      this.logger.error('Error checking upcoming transactions', error)
    }
  }

  /**
   * Create a new recurring transaction
   */
  async createRecurringTransaction(
    description: string,
    amount: number,
    frequency: Frequency,
    startDate: Date,
    userId: string,
    categoryId?: string,
    endDate?: Date,
    maxOccurrences?: number
  ): Promise<RecurringTransaction> {
    // Validate the recurrence pattern
    const pattern: RecurrencePattern = {
      frequency,
      startDate,
      endDate,
      maxOccurrences
    }

    if (!this.recurrenceHandler.validateRecurrencePattern(pattern)) {
      throw new Error('Invalid recurrence pattern')
    }

    // Calculate next occurrence
    const nextOccurrence = this.recurrenceHandler.generateNextOccurrence(pattern, startDate)
    if (!nextOccurrence) {
      throw new Error('Could not generate next occurrence')
    }

    const recurringTransaction: RecurringTransaction = {
      id: this.generateId(), // In real implementation, this would come from database
      description,
      amount,
      frequency,
      startDate,
      endDate,
      maxOccurrences,
      categoryId,
      userId,
      isActive: true,
      nextOccurrenceDate: nextOccurrence.date,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // In real implementation, save to database
    this.logger.log(`Created recurring transaction: ${description} with frequency: ${frequency.value}`)
    
    return recurringTransaction
  }

  /**
   * Process a single recurring transaction
   */
  private async processRecurringTransaction(transaction: RecurringTransaction): Promise<void> {
    const today = new Date()
    
    // Check if it's time to process this transaction
    if (transaction.nextOccurrenceDate <= today) {
      try {
        // Create the actual transaction
        await this.createTransactionFromRecurring(transaction)
        
        // Update next occurrence
        const nextOccurrence = this.recurrenceHandler.generateNextOccurrence(
          {
            frequency: transaction.frequency,
            startDate: transaction.startDate,
            endDate: transaction.endDate,
            maxOccurrences: transaction.maxOccurrences
          },
          transaction.nextOccurrenceDate
        )
        
        if (nextOccurrence) {
          // Update the recurring transaction with next occurrence
          transaction.nextOccurrenceDate = nextOccurrence.date
          transaction.lastProcessedDate = new Date()
          transaction.updatedAt = new Date()
          
          // In real implementation, save to database
          this.logger.log(`Updated next occurrence for transaction ${transaction.id} to ${nextOccurrence.date}`)
        } else {
          // No more occurrences, deactivate
          transaction.isActive = false
          transaction.updatedAt = new Date()
          
          // In real implementation, save to database
          this.logger.log(`Deactivated recurring transaction ${transaction.id} - no more occurrences`)
        }
      } catch (error) {
        this.logger.error(`Error processing recurring transaction ${transaction.id}`, error)
      }
    }
  }

  /**
   * Get notifications for transactions due in the next 3 days
   */
  private async getUpcomingTransactionNotifications(): Promise<TransactionNotification[]> {
    const notifications: TransactionNotification[] = []
    const today = new Date()
    const threeDaysFromNow = new Date(today)
    threeDaysFromNow.setDate(today.getDate() + 3)
    
    // In real implementation, this would query the database
    const activeTransactions = await this.getActiveRecurringTransactions()
    
    for (const transaction of activeTransactions) {
      if (transaction.nextOccurrenceDate >= today && transaction.nextOccurrenceDate <= threeDaysFromNow) {
        const daysUntilDue = Math.ceil(
          (transaction.nextOccurrenceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        )
        
        notifications.push({
          transactionId: transaction.id,
          userId: transaction.userId,
          description: transaction.description,
          amount: transaction.amount,
          dueDate: transaction.nextOccurrenceDate,
          daysUntilDue,
          frequency: transaction.frequency.getDisplayLabel()
        })
      }
    }
    
    return notifications
  }

  /**
   * Send notification for upcoming transaction
   */
  private async sendTransactionNotification(notification: TransactionNotification): Promise<void> {
    // In real implementation, this would send email, push notification, etc.
    this.logger.log(
      `NOTIFICATION: Transaction "${notification.description}" (${notification.amount}) due in ${notification.daysUntilDue} day(s) on ${notification.dueDate.toDateString()}`
    )
    
    // Example notification message
    const message = `Reminder: Your recurring transaction "${notification.description}" for ${notification.amount} is due in ${notification.daysUntilDue} day(s) on ${notification.dueDate.toDateString()}. Frequency: ${notification.frequency}`
    
    // Here you would integrate with your notification service
    // await this.notificationService.send(notification.userId, message)
  }

  /**
   * Create actual transaction from recurring transaction
   */
  private async createTransactionFromRecurring(recurringTransaction: RecurringTransaction): Promise<void> {
    // In real implementation, this would create a Transaction entity
    // and save it to the database through the TransactionService
    
    const transactionData = {
      description: recurringTransaction.description,
      amount: recurringTransaction.amount,
      date: recurringTransaction.nextOccurrenceDate,
      userId: recurringTransaction.userId,
      categoryId: recurringTransaction.categoryId,
      notes: `Recurring transaction from ${recurringTransaction.id}`
    }
    
    this.logger.log(`Created transaction: ${transactionData.description} for ${transactionData.amount} on ${transactionData.date}`)
    
    // await this.transactionService.createTransaction(transactionData)
  }

  /**
   * Get all active recurring transactions
   */
  private async getActiveRecurringTransactions(): Promise<RecurringTransaction[]> {
    // In real implementation, this would query the database
    // For now, return mock data for testing
    return [
      {
        id: '1',
        description: 'Monthly Rent',
        amount: 1200,
        frequency: new Frequency(FrequencyEnum.MONTH),
        startDate: new Date('2024-01-01'),
        userId: 'mock-user-id',
        isActive: true,
        nextOccurrenceDate: new Date('2024-02-01'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: '2',
        description: 'Weekly Groceries',
        amount: -150,
        frequency: new Frequency(FrequencyEnum.WEEK),
        startDate: new Date('2024-01-01'),
        userId: 'mock-user-id',
        isActive: true,
        nextOccurrenceDate: new Date('2024-01-29'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ]
  }

  /**
   * Generate a mock ID for testing
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  /**
   * Get upcoming occurrences for a recurring transaction
   */
  async getUpcomingOccurrences(
    transactionId: string,
    limit: number = 12
  ): Promise<Date[]> {
    const transaction = await this.getRecurringTransactionById(transactionId)
    if (!transaction) {
      throw new Error('Recurring transaction not found')
    }

    const pattern: RecurrencePattern = {
      frequency: transaction.frequency,
      startDate: transaction.startDate,
      endDate: transaction.endDate,
      maxOccurrences: transaction.maxOccurrences
    }

    return this.recurrenceHandler.getFutureOccurrences(pattern, limit)
  }

  /**
   * Get recurring transaction by ID
   */
  private async getRecurringTransactionById(id: string): Promise<RecurringTransaction | null> {
    const transactions = await this.getActiveRecurringTransactions()
    return transactions.find(t => t.id === id) || null
  }

  /**
   * Deactivate a recurring transaction
   */
  async deactivateRecurringTransaction(transactionId: string): Promise<void> {
    const transaction = await this.getRecurringTransactionById(transactionId)
    if (!transaction) {
      throw new Error('Recurring transaction not found')
    }

    transaction.isActive = false
    transaction.updatedAt = new Date()
    
    // In real implementation, save to database
    this.logger.log(`Deactivated recurring transaction ${transactionId}`)
  }
}
