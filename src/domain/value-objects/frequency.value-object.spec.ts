import { Frequency, FrequencyEnum } from './frequency.value-object'

describe('Frequency', () => {
  describe('constructor and basic properties', () => {
    it('should create frequency with valid value', () => {
      const frequency = new Frequency(FrequencyEnum.MONTH)
      expect(frequency.value).toBe(FrequencyEnum.MONTH)
    })

    // Removed unnecessary type check tests - use enum values directly when needed
  })

  describe('monthly equivalent calculations', () => {
    it('should calculate daily frequency correctly', () => {
      const frequency = new Frequency(FrequencyEnum.DAILY)
      expect(frequency.calculatenormalizedAmount(10)).toBe(300) // 10 * 30
    })

    it('should calculate weekly frequency correctly', () => {
      const frequency = new Frequency(FrequencyEnum.WEEK)
      expect(frequency.calculatenormalizedAmount(100)).toBeCloseTo(433, 0) // 100 * 4.33
    })

    it('should calculate fortnight frequency correctly', () => {
      const frequency = new Frequency(FrequencyEnum.FORTNIGHT)
      expect(frequency.calculatenormalizedAmount(200)).toBeCloseTo(434, 0) // 200 * 2.17
    })

    it('should calculate monthly frequency correctly', () => {
      const frequency = new Frequency(FrequencyEnum.MONTH)
      expect(frequency.calculatenormalizedAmount(500)).toBe(500)
    })

    it('should calculate 2-month frequency correctly', () => {
      const frequency = new Frequency(FrequencyEnum.TWO_MONTH)
      expect(frequency.calculatenormalizedAmount(1000)).toBe(500) // 1000 / 2
    })

    it('should calculate 3-month frequency correctly', () => {
      const frequency = new Frequency(FrequencyEnum.THREE_MONTH)
      expect(frequency.calculatenormalizedAmount(900)).toBe(300) // 900 / 3
    })

    it('should calculate quarter frequency correctly', () => {
      const frequency = new Frequency(FrequencyEnum.QUARTER)
      expect(frequency.calculatenormalizedAmount(900)).toBe(300) // 900 / 3
    })

    it('should calculate half frequency correctly', () => {
      const frequency = new Frequency(FrequencyEnum.HALF)
      expect(frequency.calculatenormalizedAmount(1200)).toBe(200) // 1200 / 6
    })

    it('should calculate yearly frequency correctly', () => {
      const frequency = new Frequency(FrequencyEnum.YEAR)
      expect(frequency.calculatenormalizedAmount(12000)).toBe(1000) // 12000 / 12
    })

    it('should calculate 2-year frequency correctly', () => {
      const frequency = new Frequency(FrequencyEnum.TWO_YEAR)
      expect(frequency.calculatenormalizedAmount(24000)).toBe(1000) // 24000 / 24
    })
  })

  describe('display labels', () => {
    it('should return correct display labels', () => {
      expect(new Frequency(FrequencyEnum.DAILY).getDisplayLabel()).toBe('Daily')
      expect(new Frequency(FrequencyEnum.WEEK).getDisplayLabel()).toBe('Week')
      expect(new Frequency(FrequencyEnum.FORTNIGHT).getDisplayLabel()).toBe('Fortnight')
      expect(new Frequency(FrequencyEnum.MONTH).getDisplayLabel()).toBe('Month')
      expect(new Frequency(FrequencyEnum.TWO_MONTH).getDisplayLabel()).toBe('2-Month')
      expect(new Frequency(FrequencyEnum.THREE_MONTH).getDisplayLabel()).toBe('3-Month')
      expect(new Frequency(FrequencyEnum.QUARTER).getDisplayLabel()).toBe('Quarter')
      expect(new Frequency(FrequencyEnum.HALF).getDisplayLabel()).toBe('Half')
      expect(new Frequency(FrequencyEnum.YEAR).getDisplayLabel()).toBe('Year')
      expect(new Frequency(FrequencyEnum.TWO_YEAR).getDisplayLabel()).toBe('2-Year')
    })
  })

  describe('monthly equivalent display', () => {
    it('should format monthly equivalent display correctly', () => {
      const frequency = new Frequency(FrequencyEnum.TWO_MONTH)
      expect(frequency.getnormalizedAmountDisplay(1000)).toBe('500.00 per month')
    })

    it('should handle decimal amounts correctly', () => {
      const frequency = new Frequency(FrequencyEnum.WEEK)
      expect(frequency.getnormalizedAmountDisplay(100)).toBe('433.00 per month')
    })
  })

  describe('cron expressions', () => {
    it('should return correct cron expressions', () => {
      expect(new Frequency(FrequencyEnum.DAILY).getCronExpression()).toBe('0 0 * * *')
      expect(new Frequency(FrequencyEnum.WEEK).getCronExpression()).toBe('0 0 * * 1')
      expect(new Frequency(FrequencyEnum.MONTH).getCronExpression()).toBe('0 0 1 * *')
      expect(new Frequency(FrequencyEnum.YEAR).getCronExpression()).toBe('0 0 1 1 *')
    })
  })

  describe('next occurrence calculation', () => {
    it('should calculate next occurrence correctly', () => {
      const startDate = new Date('2024-01-01')
      
      const daily = new Frequency(FrequencyEnum.DAILY)
      const weekly = new Frequency(FrequencyEnum.WEEK)
      const monthly = new Frequency(FrequencyEnum.MONTH)
      const yearly = new Frequency(FrequencyEnum.YEAR)

      expect(daily.getNextOccurrence(startDate)).toEqual(new Date('2024-01-02'))
      expect(weekly.getNextOccurrence(startDate)).toEqual(new Date('2024-01-08'))
      expect(monthly.getNextOccurrence(startDate)).toEqual(new Date('2024-02-01'))
      expect(yearly.getNextOccurrence(startDate)).toEqual(new Date('2025-01-01'))
    })

    it('should handle month boundaries correctly', () => {
      const startDate = new Date('2024-01-31')
      const monthly = new Frequency(FrequencyEnum.MONTH)
      const nextDate = monthly.getNextOccurrence(startDate)
      expect(nextDate.getMonth()).toBe(1) // February
    })
  })

  describe('static methods', () => {
    it('should create frequency from string', () => {
      const frequency = Frequency.fromString('month')
      expect(frequency.value).toBe(FrequencyEnum.MONTH)
    })

    it('should throw error for invalid string', () => {
      expect(() => Frequency.fromString('invalid')).toThrow('Invalid frequency: invalid')
    })

    it('should get all frequencies', () => {
      const frequencies = Frequency.getAllFrequencies()
      expect(frequencies).toHaveLength(10)
      expect(frequencies[0]).toBeInstanceOf(Frequency)
    })

    it('should get frequency labels', () => {
      const labels = Frequency.getFrequencyLabels()
      expect(labels).toHaveLength(10)
      expect(labels[0]).toHaveProperty('value')
      expect(labels[0]).toHaveProperty('label')
    })
  })

  describe('equality and serialization', () => {
    it('should compare frequencies correctly', () => {
      const freq1 = new Frequency(FrequencyEnum.MONTH)
      const freq2 = new Frequency(FrequencyEnum.MONTH)
      const freq3 = new Frequency(FrequencyEnum.YEAR)

      expect(freq1.equals(freq2)).toBe(true)
      expect(freq1.equals(freq3)).toBe(false)
    })

    it('should convert to string correctly', () => {
      const frequency = new Frequency(FrequencyEnum.WEEK)
      expect(frequency.toString()).toBe('week')
    })

    it('should serialize to JSON correctly', () => {
      const frequency = new Frequency(FrequencyEnum.MONTH)
      expect(frequency.toJSON()).toEqual({ value: FrequencyEnum.MONTH })
    })
  })
})
