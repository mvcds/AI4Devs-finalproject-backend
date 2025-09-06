import { Test, TestingModule } from '@nestjs/testing'
import { MathEvaluatorService } from './math-evaluator.service'
import { TransactionReferenceResolverService } from './transaction-reference-resolver.service'

describe('MathEvaluatorService', () => {
  let service: MathEvaluatorService
  let transactionReferenceResolver: TransactionReferenceResolverService

  const mockTransactionReferenceResolver = {
    resolveReferences: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MathEvaluatorService,
        {
          provide: TransactionReferenceResolverService,
          useValue: mockTransactionReferenceResolver,
        },
      ],
    }).compile()

    service = module.get<MathEvaluatorService>(MathEvaluatorService)
    transactionReferenceResolver = module.get<TransactionReferenceResolverService>(TransactionReferenceResolverService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('evaluate', () => {
    describe('Given a simple mathematical expression', () => {
      describe('When evaluating basic arithmetic operations', () => {
        describe('Then it should return correct results', () => {
          it('addition: 2 + 3', async () => {
            // Arrange
            const expression = '2 + 3'
            
            // Act
            const result = await service.evaluate(expression)
            
            // Assert
            expect(result).toBe(5)
          })

          it('subtraction: 10 - 4', async () => {
            // Arrange
            const expression = '10 - 4'
            
            // Act
            const result = await service.evaluate(expression)
            
            // Assert
            expect(result).toBe(6)
          })

          it('multiplication: 6 * 7', async () => {
            // Arrange
            const expression = '6 * 7'
            
            // Act
            const result = await service.evaluate(expression)
            
            // Assert
            expect(result).toBe(42)
          })

          it('division: 15 / 3', async () => {
            // Arrange
            const expression = '15 / 3'
            
            // Act
            const result = await service.evaluate(expression)
            
            // Assert
            expect(result).toBe(5)
          })
        })
      })

      describe('When evaluating expressions with parentheses', () => {
        describe('Then it should respect order of operations', () => {
          it('(2 + 3) * 4', async () => {
            // Arrange
            const expression = '(2 + 3) * 4'
            
            // Act
            const result = await service.evaluate(expression)
            
            // Assert
            expect(result).toBe(20)
          })

          it('2 + (3 * 4)', async () => {
            // Arrange
            const expression = '2 + (3 * 4)'
            
            // Act
            const result = await service.evaluate(expression)
            
            // Assert
            expect(result).toBe(14)
          })
        })
      })

      describe('When evaluating expressions with decimals', () => {
        describe('Then it should handle decimal arithmetic correctly', () => {
          it('3.5 + 2.1', async () => {
            // Arrange
            const expression = '3.5 + 2.1'
            
            // Act
            const result = await service.evaluate(expression)
            
            // Assert
            expect(result).toBeCloseTo(5.6)
          })

          it('10.5 / 2', async () => {
            // Arrange
            const expression = '10.5 / 2'
            
            // Act
            const result = await service.evaluate(expression)
            
            // Assert
            expect(result).toBe(5.25)
          })
        })
      })

      describe('When evaluating expressions with variables', () => {
        describe('Then it should handle mathematical constants', () => {
          it('pi', async () => {
            // Arrange
            const expression = 'pi'
            
            // Act
            const result = await service.evaluate(expression)
            
            // Assert
            expect(result).toBeCloseTo(Math.PI)
          })

          it('e', async () => {
            // Arrange
            const expression = 'e'
            
            // Act
            const result = await service.evaluate(expression)
            
            // Assert
            expect(result).toBeCloseTo(Math.E)
          })
        })
      })
    })

    describe('Given an expression with whitespace', () => {
      describe('When evaluating expressions with various spacing', () => {
        describe('Then it should handle whitespace correctly', () => {
          it('expression with spaces: 2 + 3', async () => {
            // Arrange
            const expression = '2 + 3'
            
            // Act
            const result = await service.evaluate(expression)
            
            // Assert
            expect(result).toBe(5)
          })

          it('expression with tabs and newlines: 2\t+\n3', async () => {
            // Arrange
            const expression = '2\t+\n3'
            
            // Act
            const result = await service.evaluate(expression)
            
            // Assert
            expect(result).toBe(5)
          })
        })
      })
    })

    describe('Given an invalid expression', () => {
      describe('When evaluating expressions with unsafe characters', () => {
        describe('Then it should throw an error', () => {
          it('expression with letters: 2 + a', async () => {
            // Arrange
            const expression = '2 + a'
            
            // Act & Assert
            await expect(service.evaluate(expression)).rejects.toThrow('Undefined symbol a')
          })

          it('expression with special characters: 2 + @', async () => {
            // Arrange
            const expression = '2 + @'
            
            // Act & Assert
            await expect(service.evaluate(expression)).rejects.toThrow('Unsafe characters in expression')
          })

          it('expression with dollar sign: $100 + 50', async () => {
            // Arrange
            const expression = '$100 + 50'
            
            // Act & Assert
            await expect(service.evaluate(expression)).rejects.toThrow('Undefined symbol $')
          })
        })
      })

      describe('When evaluating expressions that result in non-numbers', () => {
        describe('Then it should throw an error', () => {
          it('expression resulting in string: "hello"', async () => {
            // Arrange
            const expression = '"hello"'
            
            // Act & Assert
            await expect(service.evaluate(expression)).rejects.toThrow('Unsafe characters in expression')
          })
        })
      })
    })

    describe('Given an expression with transaction references', () => {
      describe('When evaluating expressions with $transactionId syntax', () => {
        describe('Then it should resolve transaction references', () => {
          it('should resolve single transaction reference', async () => {
            // Arrange
            const expression = '100 + $tx-123'
            const userId = 'user-123'
            mockTransactionReferenceResolver.resolveReferences.mockResolvedValue('100 + 50')

            // Act
            const result = await service.evaluate(expression, userId)

            // Assert
            expect(result).toBe(150)
            expect(mockTransactionReferenceResolver.resolveReferences).toHaveBeenCalledWith('100+$tx-123', userId)
          })

          it('should resolve multiple transaction references', async () => {
            // Arrange
            const expression = '$tx-123 + $tx-456'
            const userId = 'user-123'
            mockTransactionReferenceResolver.resolveReferences.mockResolvedValue('100 + 200')

            // Act
            const result = await service.evaluate(expression, userId)

            // Assert
            expect(result).toBe(300)
            expect(mockTransactionReferenceResolver.resolveReferences).toHaveBeenCalledWith('$tx-123+$tx-456', userId)
          })

          it('should not resolve references when no userId provided', async () => {
            // Arrange
            const expression = '$tx-123 + 50'

            // Act & Assert
            await expect(service.evaluate(expression)).rejects.toThrow('Undefined symbol $')
            expect(mockTransactionReferenceResolver.resolveReferences).not.toHaveBeenCalled()
          })

          it('should handle transaction reference not found error', async () => {
            // Arrange
            const expression = '100 + $tx-nonexistent'
            const userId = 'user-123'
            mockTransactionReferenceResolver.resolveReferences.mockRejectedValue(
              new Error('Transaction reference not found: tx-nonexistent')
            )

            // Act & Assert
            await expect(service.evaluate(expression, userId)).rejects.toThrow(
              'Cannot evaluate expression "100 + $tx-nonexistent": Transaction reference not found: tx-nonexistent'
            )
          })

          it('should handle case where resolver returns unresolved expression', async () => {
            // Arrange
            const expression = '100 + $tx-nonexistent'
            const userId = 'user-123'
            // Simulate a bug where resolver returns the original expression instead of throwing
            mockTransactionReferenceResolver.resolveReferences.mockResolvedValue('100 + $tx-nonexistent')

            // Act & Assert
            await expect(service.evaluate(expression, userId)).rejects.toThrow(
              'Cannot evaluate expression "100 + $tx-nonexistent": Undefined symbol $'
            )
          })

          it('should handle case where userId is falsy and skip resolver', async () => {
            // Arrange
            const expression = '100 + $tx-nonexistent'
            const userId = undefined // Falsy userId

            // Act & Assert
            await expect(service.evaluate(expression, userId)).rejects.toThrow(
              'Cannot evaluate expression "100 + $tx-nonexistent": Undefined symbol $'
            )
            expect(mockTransactionReferenceResolver.resolveReferences).not.toHaveBeenCalled()
          })

          it('should handle complex expressions with transaction references', async () => {
            // Arrange
            const expression = '($tx-123 + $tx-456) * 0.1'
            const userId = 'user-123'
            mockTransactionReferenceResolver.resolveReferences.mockResolvedValue('(100 + 200) * 0.1')

            // Act
            const result = await service.evaluate(expression, userId)

            // Assert
            expect(result).toBe(30)
            expect(mockTransactionReferenceResolver.resolveReferences).toHaveBeenCalledWith('($tx-123+$tx-456)*0.1', userId)
          })

          it('should propagate errors from transaction reference resolver', async () => {
            // Arrange
            const expression = '$tx-nonexistent + 50'
            const userId = 'user-123'
            mockTransactionReferenceResolver.resolveReferences.mockRejectedValue(new Error('Transaction reference not found: tx-nonexistent'))

            // Act & Assert
            await expect(service.evaluate(expression, userId)).rejects.toThrow('Transaction reference not found: tx-nonexistent')
          })
        })
      })
    })
  })
})
