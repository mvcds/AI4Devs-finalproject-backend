import { Test, TestingModule } from '@nestjs/testing'
import { MathEvaluatorService } from './math-evaluator.service'

describe('MathEvaluatorService', () => {
  let service: MathEvaluatorService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MathEvaluatorService],
    }).compile()

    service = module.get<MathEvaluatorService>(MathEvaluatorService)
  })

  describe('evaluate', () => {
    describe('Given a simple mathematical expression', () => {
      describe('When evaluating basic arithmetic operations', () => {
        describe('Then it should return correct results', () => {
          it('addition: 2 + 3', () => {
            // Arrange
            const expression = '2 + 3'
            
            // Act
            const result = service.evaluate(expression)
            
            // Assert
            expect(result).toBe(5)
          })

          it('subtraction: 10 - 4', () => {
            // Arrange
            const expression = '10 - 4'
            
            // Act
            const result = service.evaluate(expression)
            
            // Assert
            expect(result).toBe(6)
          })

          it('multiplication: 6 * 7', () => {
            // Arrange
            const expression = '6 * 7'
            
            // Act
            const result = service.evaluate(expression)
            
            // Assert
            expect(result).toBe(42)
          })

          it('division: 15 / 3', () => {
            // Arrange
            const expression = '15 / 3'
            
            // Act
            const result = service.evaluate(expression)
            
            // Assert
            expect(result).toBe(5)
          })
        })
      })

      describe('When evaluating expressions with parentheses', () => {
        describe('Then it should respect order of operations', () => {
          it('(2 + 3) * 4', () => {
            // Arrange
            const expression = '(2 + 3) * 4'
            
            // Act
            const result = service.evaluate(expression)
            
            // Assert
            expect(result).toBe(20)
          })

          it('2 + (3 * 4)', () => {
            // Arrange
            const expression = '2 + (3 * 4)'
            
            // Act
            const result = service.evaluate(expression)
            
            // Assert
            expect(result).toBe(14)
          })
        })
      })

      describe('When evaluating expressions with decimals', () => {
        describe('Then it should handle decimal arithmetic correctly', () => {
          it('3.5 + 2.1', () => {
            // Arrange
            const expression = '3.5 + 2.1'
            
            // Act
            const result = service.evaluate(expression)
            
            // Assert
            expect(result).toBeCloseTo(5.6)
          })

          it('10.5 / 2', () => {
            // Arrange
            const expression = '10.5 / 2'
            
            // Act
            const result = service.evaluate(expression)
            
            // Assert
            expect(result).toBe(5.25)
          })
        })
      })

      describe('When evaluating expressions with variables', () => {
        describe('Then it should handle mathematical constants', () => {
          it('pi', () => {
            // Arrange
            const expression = 'pi'
            
            // Act
            const result = service.evaluate(expression)
            
            // Assert
            expect(result).toBeCloseTo(Math.PI)
          })

          it('e', () => {
            // Arrange
            const expression = 'e'
            
            // Act
            const result = service.evaluate(expression)
            
            // Assert
            expect(result).toBeCloseTo(Math.E)
          })
        })
      })
    })

    describe('Given an expression with whitespace', () => {
      describe('When evaluating expressions with various spacing', () => {
        describe('Then it should handle whitespace correctly', () => {
          it('expression with spaces: 2 + 3', () => {
            // Arrange
            const expression = '2 + 3'
            
            // Act
            const result = service.evaluate(expression)
            
            // Assert
            expect(result).toBe(5)
          })

          it('expression with tabs and newlines: 2\t+\n3', () => {
            // Arrange
            const expression = '2\t+\n3'
            
            // Act
            const result = service.evaluate(expression)
            
            // Assert
            expect(result).toBe(5)
          })
        })
      })
    })

    describe('Given an invalid expression', () => {
      describe('When evaluating expressions with unsafe characters', () => {
        describe('Then it should throw an error', () => {
          it('expression with letters: 2 + a', () => {
            // Arrange
            const expression = '2 + a'
            
            // Act & Assert
            expect(() => service.evaluate(expression)).toThrow('Undefined symbol a')
          })

          it('expression with special characters: 2 + @', () => {
            // Arrange
            const expression = '2 + @'
            
            // Act & Assert
            expect(() => service.evaluate(expression)).toThrow('Unsafe characters in expression')
          })
        })
      })

      describe('When evaluating expressions that result in non-numbers', () => {
        describe('Then it should throw an error', () => {
          it('expression resulting in string: "hello"', () => {
            // Arrange
            const expression = '"hello"'
            
            // Act & Assert
            expect(() => service.evaluate(expression)).toThrow('Unsafe characters in expression')
          })
        })
      })
    })
  })
})
