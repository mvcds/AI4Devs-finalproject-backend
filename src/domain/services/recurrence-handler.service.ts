import { Injectable } from '@nestjs/common'
import { Frequency, FrequencyEnum } from '../value-objects/frequency.value-object'

export interface RecurrencePattern {
  frequency: Frequency
  startDate: Date
  endDate?: Date
  maxOccurrences?: number
  customCron?: string
}

export interface NextOccurrence {
  date: Date
  occurrenceNumber: number
  isLast: boolean
}

@Injectable()
export class RecurrenceHandlerService {
  /**
   * Generate the next occurrence based on recurrence pattern
   */
  generateNextOccurrence(pattern: RecurrencePattern, currentDate: Date): NextOccurrence | null {
    if (!this.validateRecurrencePattern(pattern)) {
      throw new Error('Invalid recurrence pattern')
    }

    const { frequency, startDate, endDate, maxOccurrences } = pattern
    
    // If we have a max occurrences limit, check if we've reached it
    if (maxOccurrences && this.getOccurrenceCount(pattern, currentDate) >= maxOccurrences) {
      return null
    }

    // If we have an end date, check if we've passed it
    if (endDate && currentDate >= endDate) {
      return null
    }

    // Calculate next occurrence
    let nextDate = new Date(currentDate)
    let occurrenceNumber = this.getOccurrenceCount(pattern, currentDate) + 1

    // If this is the first occurrence, use start date
    if (occurrenceNumber === 1) {
      nextDate = new Date(startDate)
    } else {
      // Calculate next occurrence based on frequency
      nextDate = frequency.getNextOccurrence(currentDate)
    }

    // Check if next occurrence is beyond end date
    if (endDate && nextDate > endDate) {
      return null
    }

    const isLast = this.isLastOccurrence(pattern, nextDate, occurrenceNumber)

    return {
      date: nextDate,
      occurrenceNumber,
      isLast
    }
  }

  /**
   * Validate recurrence pattern
   */
  validateRecurrencePattern(pattern: RecurrencePattern): boolean {
    if (!pattern.frequency || !pattern.startDate) {
      return false
    }

    // Start date cannot be in the past
    if (pattern.startDate < new Date()) {
      return false
    }

    // If end date is provided, it must be after start date
    if (pattern.endDate && pattern.endDate <= pattern.startDate) {
      return false
    }

    // Max occurrences must be positive
    if (pattern.maxOccurrences && pattern.maxOccurrences <= 0) {
      return false
    }

    // Validate custom cron if provided
    if (pattern.customCron && !this.validateCronExpression(pattern.customCron)) {
      return false
    }

    return true
  }

  /**
   * Validate cron expression
   */
  validateCronExpression(cronExpression: string): boolean {
    const cronParts = cronExpression.split(' ')
    
    if (cronParts.length !== 5) {
      return false
    }

    const [minute, hour, dayOfMonth, month, dayOfWeek] = cronParts

    // Basic validation for each part
    const isValidMinute = this.isValidCronField(minute, 0, 59)
    const isValidHour = this.isValidCronField(hour, 0, 23)
    const isValidDayOfMonth = this.isValidCronField(dayOfMonth, 1, 31)
    const isValidMonth = this.isValidCronField(month, 1, 12)
    const isValidDayOfWeek = this.isValidCronField(dayOfWeek, 0, 6)

    return isValidMinute && isValidHour && isValidDayOfMonth && isValidMonth && isValidDayOfWeek
  }

  /**
   * Get the number of occurrences up to a given date
   */
  getOccurrenceCount(pattern: RecurrencePattern, upToDate: Date): number {
    const { frequency, startDate, endDate, maxOccurrences } = pattern
    
    if (upToDate < startDate) {
      return 0
    }

    if (endDate && upToDate > endDate) {
      upToDate = new Date(endDate)
    }

    let count = 0
    let currentDate = new Date(startDate)

    while (currentDate <= upToDate) {
      count++
      
      // Check max occurrences limit
      if (maxOccurrences && count >= maxOccurrences) {
        break
      }

      currentDate = frequency.getNextOccurrence(currentDate)
    }

    return count
  }

  /**
   * Check if a given occurrence is the last one
   */
  private isLastOccurrence(pattern: RecurrencePattern, date: Date, occurrenceNumber: number): boolean {
    const { endDate, maxOccurrences } = pattern

    // Check if we've reached max occurrences
    if (maxOccurrences && occurrenceNumber >= maxOccurrences) {
      return true
    }

    // Check if next occurrence would be beyond end date
    if (endDate) {
      const nextDate = pattern.frequency.getNextOccurrence(date)
      return nextDate > endDate
    }

    return false
  }

  /**
   * Validate cron field value
   */
  private isValidCronField(field: string, min: number, max: number): boolean {
    // Handle wildcard
    if (field === '*') {
      return true
    }

    // Handle ranges (e.g., 1-5)
    if (field.includes('-')) {
      const [start, end] = field.split('-').map(Number)
      return !isNaN(start) && !isNaN(end) && start >= min && end <= max && start <= end
    }

    // Handle lists (e.g., 1,3,5)
    if (field.includes(',')) {
      return field.split(',').every(part => {
        const num = Number(part)
        return !isNaN(num) && num >= min && num <= max
      })
    }

    // Handle step values (e.g., */5)
    if (field.includes('/')) {
      const [base, step] = field.split('/')
      if (base === '*') {
        const stepNum = Number(step)
        return !isNaN(stepNum) && stepNum > 0 && stepNum <= max
      }
      return false
    }

    // Handle single number
    const num = Number(field)
    return !isNaN(num) && num >= min && num <= max
  }

  /**
   * Get all future occurrences for a pattern
   */
  getFutureOccurrences(pattern: RecurrencePattern, limit: number = 12): Date[] {
    if (!this.validateRecurrencePattern(pattern)) {
      throw new Error('Invalid recurrence pattern')
    }

    const occurrences: Date[] = []
    let currentDate = new Date(pattern.startDate)
    let count = 0

    while (count < limit) {
      // Check if we've reached max occurrences
      if (pattern.maxOccurrences && count >= pattern.maxOccurrences) {
        break
      }

      // Check if we've passed end date
      if (pattern.endDate && currentDate > pattern.endDate) {
        break
      }

      occurrences.push(new Date(currentDate))
      currentDate = pattern.frequency.getNextOccurrence(currentDate)
      count++
    }

    return occurrences
  }

  /**
   * Calculate the total amount for a recurring transaction over a period
   */
  calculateTotalAmount(
    frequency: Frequency,
    amount: number,
    startDate: Date,
    endDate: Date
  ): number {
    const occurrences = this.getOccurrenceCount({ frequency, startDate, endDate }, endDate)
    return amount * occurrences
  }
}
