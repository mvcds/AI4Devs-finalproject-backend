import { Money } from './money.value-object'

describe('Money', () => {
  describe('constructor', () => {
    it('should create a Money instance with valid amount and decimals', () => {
      const money = new Money(100.50, 2)
      expect(money.amount).toBe(100.50)
      expect(money.decimals).toBe(2)
    })

    it('should round amount to specified decimals', () => {
      const money = new Money(100.567, 2)
      expect(money.amount).toBe(100.57)
    })

    it('should use default decimals (2) when not specified', () => {
      const money = new Money(100.50)
      expect(money.decimals).toBe(2)
    })
  })

  describe('properties', () => {
    it('should correctly identify positive amounts', () => {
      const positiveMoney = new Money(100.50)
      expect(positiveMoney.isPositive).toBe(true)
      expect(positiveMoney.isNegative).toBe(false)
      expect(positiveMoney.isZero).toBe(false)
    })

    it('should correctly identify negative amounts', () => {
      const negativeMoney = new Money(-100.50)
      expect(negativeMoney.isPositive).toBe(false)
      expect(negativeMoney.isNegative).toBe(true)
      expect(negativeMoney.isZero).toBe(false)
    })

    it('should correctly identify zero amounts', () => {
      const zeroMoney = new Money(0)
      expect(zeroMoney.isPositive).toBe(false)
      expect(zeroMoney.isNegative).toBe(false)
      expect(zeroMoney.isZero).toBe(true)
    })
  })

  describe('arithmetic operations', () => {
    it('should add two Money instances with same decimals', () => {
      const money1 = new Money(100.50, 2)
      const money2 = new Money(50.25, 2)
      const result = money1.add(money2)
      expect(result.amount).toBe(150.75)
      expect(result.decimals).toBe(2)
    })

    it('should subtract two Money instances with same decimals', () => {
      const money1 = new Money(100.50, 2)
      const money2 = new Money(50.25, 2)
      const result = money1.subtract(money2)
      expect(result.amount).toBe(50.25)
      expect(result.decimals).toBe(2)
    })

    it('should multiply by a factor', () => {
      const money = new Money(100.50, 2)
      const result = money.multiply(2)
      expect(result.amount).toBe(201.00)
      expect(result.decimals).toBe(2)
    })

    it('should divide by a divisor', () => {
      const money = new Money(100.50, 2)
      const result = money.divide(2)
      expect(result.amount).toBe(50.25)
      expect(result.decimals).toBe(2)
    })

    it('should throw error when adding Money with different decimals', () => {
      const money1 = new Money(100.50, 2)
      const money2 = new Money(50.25, 3)
      expect(() => money1.add(money2)).toThrow('Cannot add money with different decimal places')
    })

    it('should throw error when dividing by zero', () => {
      const money = new Money(100.50)
      expect(() => money.divide(0)).toThrow('Cannot divide by zero')
    })
  })

  describe('equality', () => {
    it('should be equal to another Money with same amount and decimals', () => {
      const money1 = new Money(100.50, 2)
      const money2 = new Money(100.50, 2)
      expect(money1.equals(money2)).toBe(true)
    })

    it('should not be equal to Money with different amount', () => {
      const money1 = new Money(100.50, 2)
      const money2 = new Money(100.51, 2)
      expect(money1.equals(money2)).toBe(false)
    })

    it('should not be equal to Money with different decimals', () => {
      const money1 = new Money(100.50, 2)
      const money2 = new Money(100.50, 3)
      expect(money1.equals(money2)).toBe(false)
    })
  })

  describe('string representation', () => {
    it('should convert to string with proper decimal places', () => {
      const money = new Money(100.50, 2)
      expect(money.toString()).toBe('100.50')
    })

    it('should convert to JSON with amount and decimals', () => {
      const money = new Money(100.50, 2)
      expect(money.toJSON()).toEqual({ amount: 100.50, decimals: 2 })
    })
  })

  describe('static methods', () => {
    it('should create Money from string', () => {
      const money = Money.fromString('100.50', 2)
      expect(money.amount).toBe(100.50)
      expect(money.decimals).toBe(2)
    })

    it('should throw error for invalid string', () => {
      expect(() => Money.fromString('invalid')).toThrow('Invalid money string format')
    })

    it('should create zero Money', () => {
      const zeroMoney = Money.zero(2)
      expect(zeroMoney.amount).toBe(0)
      expect(zeroMoney.decimals).toBe(2)
    })
  })

  describe('validation', () => {
    it('should accept valid amount range', () => {
      expect(() => new Money(999999999.99)).not.toThrow()
      expect(() => new Money(-999999999.99)).not.toThrow()
    })

    it('should accept valid decimal range', () => {
      expect(() => new Money(100, 0)).not.toThrow()
      expect(() => new Money(100, 999)).not.toThrow()
    })
  })
})
