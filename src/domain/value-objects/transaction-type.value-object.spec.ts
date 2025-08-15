import { TransactionType, TransactionTypeEnum } from './transaction-type.value-object'

describe('TransactionType', () => {
  describe('constructor', () => {
    it('should create a TransactionType instance with valid value', () => {
      const incomeType = new TransactionType(TransactionTypeEnum.INCOME)
      expect(incomeType.value).toBe(TransactionTypeEnum.INCOME)

      const expenseType = new TransactionType(TransactionTypeEnum.EXPENSE)
      expect(expenseType.value).toBe(TransactionTypeEnum.EXPENSE)
    })
  })

  describe('properties', () => {
    it('should correctly identify income type', () => {
      const incomeType = new TransactionType(TransactionTypeEnum.INCOME)
      expect(incomeType.isIncome).toBe(true)
      expect(incomeType.isExpense).toBe(false)
    })

    it('should correctly identify expense type', () => {
      const expenseType = new TransactionType(TransactionTypeEnum.EXPENSE)
      expect(expenseType.isIncome).toBe(false)
      expect(expenseType.isExpense).toBe(true)
    })
  })

  describe('equality', () => {
    it('should be equal to another TransactionType with same value', () => {
      const type1 = new TransactionType(TransactionTypeEnum.INCOME)
      const type2 = new TransactionType(TransactionTypeEnum.INCOME)
      expect(type1.equals(type2)).toBe(true)
    })

    it('should not be equal to TransactionType with different value', () => {
      const incomeType = new TransactionType(TransactionTypeEnum.INCOME)
      const expenseType = new TransactionType(TransactionTypeEnum.EXPENSE)
      expect(incomeType.equals(expenseType)).toBe(false)
    })
  })

  describe('string representation', () => {
    it('should convert to string correctly', () => {
      const incomeType = new TransactionType(TransactionTypeEnum.INCOME)
      expect(incomeType.toString()).toBe('income')

      const expenseType = new TransactionType(TransactionTypeEnum.EXPENSE)
      expect(expenseType.toString()).toBe('expense')
    })

    it('should convert to JSON with value', () => {
      const incomeType = new TransactionType(TransactionTypeEnum.INCOME)
      expect(incomeType.toJSON()).toEqual({ value: TransactionTypeEnum.INCOME })
    })
  })

  describe('static methods', () => {
    it('should create income TransactionType', () => {
      const incomeType = TransactionType.income()
      expect(incomeType.value).toBe(TransactionTypeEnum.INCOME)
      expect(incomeType.isIncome).toBe(true)
    })

    it('should create expense TransactionType', () => {
      const expenseType = TransactionType.expense()
      expect(expenseType.value).toBe(TransactionTypeEnum.EXPENSE)
      expect(expenseType.isExpense).toBe(true)
    })

    it('should create TransactionType from valid string', () => {
      const incomeType = TransactionType.fromString('income')
      expect(incomeType.value).toBe(TransactionTypeEnum.INCOME)

      const expenseType = TransactionType.fromString('expense')
      expect(expenseType.value).toBe(TransactionTypeEnum.EXPENSE)
    })

    it('should throw error for invalid string', () => {
      expect(() => TransactionType.fromString('invalid')).toThrow('Invalid transaction type: invalid')
      expect(() => TransactionType.fromString('')).toThrow('Invalid transaction type: ')
    })
  })

  describe('enum values', () => {
    it('should have correct enum values', () => {
      expect(TransactionTypeEnum.INCOME).toBe('income')
      expect(TransactionTypeEnum.EXPENSE).toBe('expense')
    })
  })
})
