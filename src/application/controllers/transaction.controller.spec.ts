import { Test, TestingModule } from '@nestjs/testing'
import { TransactionController } from './transaction.controller'
import { TransactionService } from '../services/transaction.service'
import { MathEvaluatorService } from '../../domain/services/math-evaluator.service'
import { MockUserService } from '../../domain/services/mock-user.service'

describe('TransactionController', () => {
  let controller: TransactionController
  let transactionService: TransactionService
  let mathEvaluatorService: MathEvaluatorService
  let mockUserService: MockUserService

  const mockTransactionService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getSummary: jest.fn(),
  }

  const mockMathEvaluatorService = {
    evaluate: jest.fn(),
  }

  const mockMockUserService = {
    getCurrentUserId: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: TransactionService,
          useValue: mockTransactionService,
        },
        {
          provide: MathEvaluatorService,
          useValue: mockMathEvaluatorService,
        },
        {
          provide: MockUserService,
          useValue: mockMockUserService,
        },
      ],
    }).compile()

    controller = module.get<TransactionController>(TransactionController)
    transactionService = module.get<TransactionService>(TransactionService)
    mathEvaluatorService = module.get<MathEvaluatorService>(MathEvaluatorService)
    mockUserService = module.get<MockUserService>(MockUserService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('evaluateExpression', () => {
    it('should evaluate expression with transaction references correctly', async () => {
      // Arrange
      const expression = '100 + $tx-123'
      const frequency = 'month'
      const userId = 'user-123'
      
      mockMockUserService.getCurrentUserId.mockReturnValue(userId)
      mockMathEvaluatorService.evaluate.mockResolvedValue(150)

      // Act
      const result = await controller.evaluateExpression(expression, frequency)

      // Assert
      expect(result).toEqual({
        amount: 150,
        type: 'income',
        normalizedAmount: 150,
        isValid: true
      })
      expect(mockMockUserService.getCurrentUserId).toHaveBeenCalled()
      expect(mockMathEvaluatorService.evaluate).toHaveBeenCalledWith(expression, userId)
    })

    it('should handle transaction reference not found error', async () => {
      // Arrange
      const expression = '100 + $tx-nonexistent'
      const frequency = 'month'
      const userId = 'user-123'
      
      mockMockUserService.getCurrentUserId.mockReturnValue(userId)
      mockMathEvaluatorService.evaluate.mockRejectedValue(
        new Error('Cannot evaluate expression "100 + $tx-nonexistent": Transaction reference not found: tx-nonexistent')
      )

      // Act & Assert
      await expect(controller.evaluateExpression(expression, frequency)).rejects.toThrow(
        'Cannot evaluate expression "100 + $tx-nonexistent": Transaction reference not found: tx-nonexistent'
      )
    })
  })
})
