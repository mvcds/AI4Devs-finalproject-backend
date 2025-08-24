import { IsEnum, IsNotEmpty } from 'class-validator'

export enum FrequencyEnum {
  DAILY = 'daily',
  WEEK = 'week',
  FORTNIGHT = 'fortnight',
  MONTH = 'month',
  TWO_MONTH = '2-month',
  THREE_MONTH = '3-month',
  QUARTER = 'quarter',
  HALF = 'half',
  YEAR = 'year',
  TWO_YEAR = '2-year',
}

export class Frequency {
  @IsEnum(FrequencyEnum)
  @IsNotEmpty()
  private readonly _value: FrequencyEnum

  constructor(value: FrequencyEnum) {
    this._value = value
  }

  get value(): FrequencyEnum {
    return this._value
  }



  /**
   * Calculate the monthly equivalent amount
   * @param amount - The original amount
   * @returns The monthly equivalent amount
   */
  calculatenormalizedAmount(amount: number): number {
    switch (this._value) {
      case FrequencyEnum.DAILY:
        return amount * 30 // Approximate days in month
      case FrequencyEnum.WEEK:
        return amount * 4.33 // Average weeks per month (52/12)
      case FrequencyEnum.FORTNIGHT:
        return amount * 2.17 // Average fortnights per month (26/12)
      case FrequencyEnum.MONTH:
        return amount
      case FrequencyEnum.TWO_MONTH:
        return amount / 2
      case FrequencyEnum.THREE_MONTH:
        return amount / 3
      case FrequencyEnum.QUARTER:
        return amount / 3
      case FrequencyEnum.HALF:
        return amount / 6
      case FrequencyEnum.YEAR:
        return amount / 12
      case FrequencyEnum.TWO_YEAR:
        return amount / 24
      default:
        return amount
    }
  }

  /**
   * Get the display label for the frequency
   */
  getDisplayLabel(): string {
    switch (this._value) {
      case FrequencyEnum.DAILY:
        return 'Daily'
      case FrequencyEnum.WEEK:
        return 'Week'
      case FrequencyEnum.FORTNIGHT:
        return 'Fortnight'
      case FrequencyEnum.MONTH:
        return 'Month'
      case FrequencyEnum.TWO_MONTH:
        return '2-Month'
      case FrequencyEnum.THREE_MONTH:
        return '3-Month'
      case FrequencyEnum.QUARTER:
        return 'Quarter'
      case FrequencyEnum.HALF:
        return 'Half'
      case FrequencyEnum.YEAR:
        return 'Year'
      case FrequencyEnum.TWO_YEAR:
        return '2-Year'
      default:
        return this._value
    }
  }

  /**
   * Get the monthly equivalent display text
   * @param amount - The original amount
   * @returns Formatted string showing monthly equivalent
   */
  getnormalizedAmountDisplay(amount: number): string {
    // Ensure amount is a number
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(numericAmount)) {
      return '0.00 per month'
    }
    
    const monthlyAmount = this.calculatenormalizedAmount(numericAmount)
    return `${monthlyAmount.toFixed(2)} per month`
  }

  /**
   * Get cron expression for the frequency
   */
  getCronExpression(): string {
    switch (this._value) {
      case FrequencyEnum.DAILY:
        return '0 0 * * *' // Every day at midnight
      case FrequencyEnum.WEEK:
        return '0 0 * * 1' // Every Monday at midnight
      case FrequencyEnum.FORTNIGHT:
        return '0 0 1,15 * *' // 1st and 15th of every month
      case FrequencyEnum.MONTH:
        return '0 0 1 * *' // 1st of every month
      case FrequencyEnum.TWO_MONTH:
        return '0 0 1 */2 *' // 1st of every 2nd month
      case FrequencyEnum.THREE_MONTH:
        return '0 0 1 */3 *' // 1st of every 3rd month
      case FrequencyEnum.QUARTER:
        return '0 0 1 */3 *' // 1st of every 3rd month
      case FrequencyEnum.HALF:
        return '0 0 1 */6 *' // 1st of every 6th month
      case FrequencyEnum.YEAR:
        return '0 0 1 1 *' // 1st of January every year
      case FrequencyEnum.TWO_YEAR:
        return '0 0 1 1 */2' // 1st of January every 2 years
      default:
        return '0 0 * * *' // Default to daily
    }
  }

  /**
   * Calculate next occurrence date from a given start date
   */
  getNextOccurrence(startDate: Date): Date {
    const nextDate = new Date(startDate)
    
    switch (this._value) {
      case FrequencyEnum.DAILY:
        nextDate.setDate(nextDate.getDate() + 1)
        break
      case FrequencyEnum.WEEK:
        nextDate.setDate(nextDate.getDate() + 7)
        break
      case FrequencyEnum.FORTNIGHT:
        nextDate.setDate(nextDate.getDate() + 14)
        break
      case FrequencyEnum.MONTH:
        // Handle month boundaries properly
        const currentDay = nextDate.getDate()
        nextDate.setMonth(nextDate.getMonth() + 1)
        
        // If the original date was the last day of the month, 
        // and the next month has fewer days, adjust to the last day
        if (currentDay !== nextDate.getDate()) {
          nextDate.setDate(0) // Set to last day of previous month
        }
        break
      case FrequencyEnum.TWO_MONTH:
        nextDate.setMonth(nextDate.getMonth() + 2)
        break
      case FrequencyEnum.THREE_MONTH:
        nextDate.setMonth(nextDate.getMonth() + 3)
        break
      case FrequencyEnum.QUARTER:
        nextDate.setMonth(nextDate.getMonth() + 3)
        break
      case FrequencyEnum.HALF:
        nextDate.setMonth(nextDate.getMonth() + 6)
        break
      case FrequencyEnum.YEAR:
        nextDate.setFullYear(nextDate.getFullYear() + 1)
        break
      case FrequencyEnum.TWO_YEAR:
        nextDate.setFullYear(nextDate.getFullYear() + 2)
        break
    }
    
    return nextDate
  }

  equals(other: Frequency): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }

  toJSON(): { value: FrequencyEnum } {
    return { value: this._value }
  }

  static fromString(value: string): Frequency {
    if (Object.values(FrequencyEnum).includes(value as FrequencyEnum)) {
      return new Frequency(value as FrequencyEnum)
    }
    throw new Error(`Invalid frequency: ${value}`)
  }

  static getAllFrequencies(): Frequency[] {
    return Object.values(FrequencyEnum).map(value => new Frequency(value))
  }

  static getFrequencyLabels(): { value: string; label: string }[] {
    return Object.values(FrequencyEnum).map(value => ({
      value,
      label: new Frequency(value).getDisplayLabel()
    }))
  }
}
