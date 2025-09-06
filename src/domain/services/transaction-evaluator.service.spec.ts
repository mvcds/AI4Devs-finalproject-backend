import { Test, TestingModule } from '@nestjs/testing'
import { TransactionEvaluatorService } from './transaction-evaluator.service'
import { MathEvaluatorService } from './math-evaluator.service'
import { TransactionTypeEnum } from '../value-objects/transaction-type.value-object'
import { FrequencyEnum } from '../value-objects/frequency.value-object'
import { Transaction } from '../entities/transaction.entity'

function makeTx(description: string, expression: string, frequency: FrequencyEnum = FrequencyEnum.MONTH): Transaction {
  return new Transaction(description, expression, 'user-1', 'cat-1', undefined, frequency)
}

describe('TransactionEvaluatorService', () => {
  let service: TransactionEvaluatorService
  let mathEvaluatorService: MathEvaluatorService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionEvaluatorService,
        {
          provide: MathEvaluatorService,
          useValue: {
            evaluate: jest.fn()
          }
        }
      ]
    }).compile()

    service = module.get<TransactionEvaluatorService>(TransactionEvaluatorService)
    mathEvaluatorService = module.get<MathEvaluatorService>(MathEvaluatorService)
  })

  describe('evaluate(transaction)', () => {
    it('income: positive amount, monthly normalization unchanged', async () => {
      const tx = makeTx('salary', '1000', FrequencyEnum.MONTH)
      jest.spyOn(mathEvaluatorService, 'evaluate').mockResolvedValue(1000)

      const result = await service.evaluate(tx)
      expect(result.amount).toBe(1000)
      expect(result.type).toBe(TransactionTypeEnum.INCOME)
      expect(result.normalizedAmount).toBe(1000)
    })

    it('expense: negative amount, monthly normalization preserves sign', async () => {
      const tx = makeTx('rent', '-500', FrequencyEnum.MONTH)
      jest.spyOn(mathEvaluatorService, 'evaluate').mockResolvedValue(-500)

      const result = await service.evaluate(tx)
      expect(result.amount).toBe(-500) // Now preserving the sign
      expect(result.type).toBe(TransactionTypeEnum.EXPENSE)
      expect(result.normalizedAmount).toBe(-500) // Normalized amount preserves the sign
    })

    it('weekly normalization multiplies by ~4.33', async () => {
      const tx = makeTx('groceries', '100', FrequencyEnum.WEEK)
      jest.spyOn(mathEvaluatorService, 'evaluate').mockResolvedValue(100)

      const result = await service.evaluate(tx)
      expect(result.amount).toBe(100)
      expect(result.type).toBe(TransactionTypeEnum.INCOME)
      expect(result.normalizedAmount).toBeCloseTo(100 * 4.33, 2)
    })

    it('yearly normalization divides by 12', async () => {
      const tx = makeTx('bonus', '12000', FrequencyEnum.YEAR)
      jest.spyOn(mathEvaluatorService, 'evaluate').mockResolvedValue(12000)

      const result = await service.evaluate(tx)
      expect(result.amount).toBe(12000)
      expect(result.type).toBe(TransactionTypeEnum.INCOME)
      expect(result.normalizedAmount).toBe(1000)
    })

    it('zero treated as expense with zero normalization', async () => {
      const tx = makeTx('zero', '0', FrequencyEnum.MONTH)
      jest.spyOn(mathEvaluatorService, 'evaluate').mockResolvedValue(0)

      const result = await service.evaluate(tx)
      expect(result.amount).toBe(0)
      expect(result.type).toBe(TransactionTypeEnum.EXPENSE)
      expect(result.normalizedAmount).toBe(0)
    })

    it('throws when math evaluation fails', async () => {
      const tx = makeTx('invalid', 'invalid', FrequencyEnum.MONTH)
      jest.spyOn(mathEvaluatorService, 'evaluate').mockImplementation(() => {
        throw new Error('Invalid expression')
      })

      await expect(service.evaluate(tx)).rejects.toThrow('Cannot evaluate transaction expression: Invalid expression')
    })

    it('handles complex expressions', async () => {
      const tx = makeTx('complex', '1000 + 500 - 200 * 2', FrequencyEnum.MONTH)
      jest.spyOn(mathEvaluatorService, 'evaluate').mockResolvedValue(1100)

      const result = await service.evaluate(tx)
      expect(result.amount).toBe(1100)
      expect(result.type).toBe(TransactionTypeEnum.INCOME)
      expect(result.normalizedAmount).toBe(1100)
    })

    it('handles decimals', async () => {
      const tx = makeTx('decimal', '99.99', FrequencyEnum.MONTH)
      jest.spyOn(mathEvaluatorService, 'evaluate').mockResolvedValue(99.99)

      const result = await service.evaluate(tx)
      expect(result.amount).toBe(99.99)
      expect(result.type).toBe(TransactionTypeEnum.INCOME)
      expect(result.normalizedAmount).toBe(99.99)
    })

    it('handles very large amounts', async () => {
      const tx = makeTx('large', '999999.99', FrequencyEnum.MONTH)
      jest.spyOn(mathEvaluatorService, 'evaluate').mockResolvedValue(999999.99)

      const result = await service.evaluate(tx)
      expect(result.amount).toBe(999999.99)
      expect(result.type).toBe(TransactionTypeEnum.INCOME)
      expect(result.normalizedAmount).toBe(999999.99)
    })
  })
})
