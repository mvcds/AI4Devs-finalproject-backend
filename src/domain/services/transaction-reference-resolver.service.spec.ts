import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TransactionReferenceResolverService } from './transaction-reference-resolver.service'
import { Transaction } from '../entities/transaction.entity'
import { Expression } from '../value-objects/expression.value-object'

describe('TransactionReferenceResolverService', () => {
  let service: TransactionReferenceResolverService
  let transactionRepository: Repository<Transaction>

  const mockTransactionRepository = {
    find: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionReferenceResolverService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
      ],
    }).compile()

    service = module.get<TransactionReferenceResolverService>(TransactionReferenceResolverService)
    transactionRepository = module.get<Repository<Transaction>>(getRepositoryToken(Transaction))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('resolveReferences', () => {
    it('should return expression unchanged when no transaction references exist', async () => {
      const expression = '100 + 50'
      const userId = 'user-123'

      const result = await service.resolveReferences(expression, userId)

      expect(result).toBe(expression)
      expect(mockTransactionRepository.find).not.toHaveBeenCalled()
    })

    it('should resolve single transaction reference', async () => {
      const expression = '100 + $tx-123'
      const userId = 'user-123'
      const mockTransaction = {
        id: 'tx-123',
        expression: new Expression('50'),
        userId: 'user-123',
      } as Transaction

      mockTransactionRepository.find.mockResolvedValue([mockTransaction])

      const result = await service.resolveReferences(expression, userId)

      expect(result).toBe('100 + 50')
      expect(mockTransactionRepository.find).toHaveBeenCalledWith({
        where: [{ id: 'tx-123', userId }],
        select: ['id', 'expression'],
      })
    })

    it('should resolve multiple transaction references', async () => {
      const expression = '$tx-123 + $tx-456'
      const userId = 'user-123'
      const mockTransactions = [
        { id: 'tx-123', expression: new Expression('100'), userId: 'user-123' },
        { id: 'tx-456', expression: new Expression('200'), userId: 'user-123' },
      ] as Transaction[]

      mockTransactionRepository.find.mockResolvedValue(mockTransactions)

      const result = await service.resolveReferences(expression, userId)

      expect(result).toBe('100 + 200')
      expect(mockTransactionRepository.find).toHaveBeenCalledWith({
        where: [{ id: 'tx-123', userId }, { id: 'tx-456', userId }],
        select: ['id', 'expression'],
      })
    })

    it('should recursively resolve nested transaction references', async () => {
      const expression = '$tx-123 * 2'
      const userId = 'user-123'
      const mockTransaction = {
        id: 'tx-123',
        expression: new Expression('$tx-456 + 10'),
        userId: 'user-123',
      } as Transaction

      // First call for tx-123, second call for tx-456
      mockTransactionRepository.find
        .mockResolvedValueOnce([mockTransaction])
        .mockResolvedValueOnce([{ id: 'tx-456', expression: new Expression('50'), userId: 'user-123' } as Transaction])

      const result = await service.resolveReferences(expression, userId)

      expect(result).toBe('60 * 2') // (50 + 10) * 2
      expect(mockTransactionRepository.find).toHaveBeenCalledTimes(2)
    })

    it('should throw error when transaction reference not found', async () => {
      const expression = '100 + $tx-nonexistent'
      const userId = 'user-123'

      mockTransactionRepository.find.mockResolvedValue([])

      await expect(service.resolveReferences(expression, userId)).rejects.toThrow(
        'Transaction reference not found: tx-nonexistent'
      )
    })

    it('should throw error when transaction belongs to different user', async () => {
      const expression = '100 + $tx-123'
      const userId = 'user-123'

      mockTransactionRepository.find.mockResolvedValue([])

      await expect(service.resolveReferences(expression, userId)).rejects.toThrow(
        'Transaction reference not found: tx-123'
      )
    })

    it('should handle complex expressions with multiple references', async () => {
      const expression = '($tx-123 + $tx-456) * 0.1'
      const userId = 'user-123'
      const mockTransactions = [
        { id: 'tx-123', expression: new Expression('100'), userId: 'user-123' },
        { id: 'tx-456', expression: new Expression('200'), userId: 'user-123' },
      ] as Transaction[]

      mockTransactionRepository.find.mockResolvedValue(mockTransactions)

      const result = await service.resolveReferences(expression, userId)

      expect(result).toBe('(100 + 200) * 0.1')
    })

    it('should handle expressions with mathematical operations in referenced transactions', async () => {
      const expression = '$tx-123'
      const userId = 'user-123'
      const mockTransaction = {
        id: 'tx-123',
        expression: new Expression('100 * 2 + 50'),
        userId: 'user-123',
      } as Transaction

      mockTransactionRepository.find.mockResolvedValue([mockTransaction])

      const result = await service.resolveReferences(expression, userId)

      expect(result).toBe('250') // 100 * 2 + 50 = 250
    })

    describe('circular reference detection', () => {
      it('should detect direct circular reference (A -> A)', async () => {
        const expression = '$tx-123 + 100'
        const userId = 'user-123'
        const mockTransaction = {
          id: 'tx-123',
          expression: new Expression('$tx-123 + 50'), // tx-123 references itself
          userId: 'user-123',
        } as Transaction

        mockTransactionRepository.find.mockResolvedValue([mockTransaction])

        await expect(service.resolveReferences(expression, userId)).rejects.toThrow(
          'Circular reference detected: tx-123 -> tx-123'
        )
      })

      it('should detect indirect circular reference (A -> B -> A)', async () => {
        const expression = '$tx-123 + 100'
        const userId = 'user-123'
        const mockTransactionA = {
          id: 'tx-123',
          expression: new Expression('$tx-456 + 50'),
          userId: 'user-123',
        } as Transaction
        const mockTransactionB = {
          id: 'tx-456',
          expression: new Expression('$tx-123 + 25'), // tx-456 references tx-123
          userId: 'user-123',
        } as Transaction

        // First call for tx-123, second call for tx-456
        mockTransactionRepository.find
          .mockResolvedValueOnce([mockTransactionA])
          .mockResolvedValueOnce([mockTransactionB])

        await expect(service.resolveReferences(expression, userId)).rejects.toThrow(
          'Circular reference detected: tx-123 -> tx-456 -> tx-123'
        )
      })

      it('should detect complex circular reference (A -> B -> C -> A)', async () => {
        const expression = '$tx-123 + 100'
        const userId = 'user-123'
        const mockTransactionA = {
          id: 'tx-123',
          expression: new Expression('$tx-456 + 50'),
          userId: 'user-123',
        } as Transaction
        const mockTransactionB = {
          id: 'tx-456',
          expression: new Expression('$tx-789 + 25'),
          userId: 'user-123',
        } as Transaction
        const mockTransactionC = {
          id: 'tx-789',
          expression: new Expression('$tx-123 + 10'), // tx-789 references tx-123
          userId: 'user-123',
        } as Transaction

        // Multiple calls for different transactions
        mockTransactionRepository.find
          .mockResolvedValueOnce([mockTransactionA])
          .mockResolvedValueOnce([mockTransactionB])
          .mockResolvedValueOnce([mockTransactionC])

        await expect(service.resolveReferences(expression, userId)).rejects.toThrow(
          'Circular reference detected: tx-123 -> tx-456 -> tx-789 -> tx-123'
        )
      })

      it('should not detect false positive circular reference when same transaction appears multiple times', async () => {
        const expression = '$tx-123 + $tx-456'
        const userId = 'user-123'
        const mockTransactionA = {
          id: 'tx-123',
          expression: new Expression('100'),
          userId: 'user-123',
        } as Transaction
        const mockTransactionB = {
          id: 'tx-456',
          expression: new Expression('$tx-123 + 50'), // tx-456 references tx-123, but tx-123 doesn't reference anything
          userId: 'user-123',
        } as Transaction

        // First call for both transactions, second call for tx-123 resolution
        mockTransactionRepository.find
          .mockResolvedValueOnce([mockTransactionA, mockTransactionB])
          .mockResolvedValueOnce([mockTransactionA])

        const result = await service.resolveReferences(expression, userId)

        expect(result).toBe('100 + 150') // 100 + (100 + 50)
      })
    })
  })
})
