import { Expression } from './expression.value-object'

describe('Expression (value-object)', () => {
  describe('construction and basic behavior', () => {
    it('should keep the provided string as-is (trimmed)', () => {
      const expression = new Expression(' 10 + 5 ')
      expect(expression.toString()).toBe('10 + 5')
    })

    it('should default to "0" when value is null/undefined', () => {
      const expressionNull = new Expression(null as any)
      const expressionUndefined = new Expression(undefined as any)
      expect(expressionNull.toString()).toBe('0')
      expect(expressionUndefined.toString()).toBe('0')
    })

    it('should serialize to JSON as the string value', () => {
      const expression = new Expression('2 * (3 + 4)')
      expect(expression.toJSON()).toBe('2 * (3 + 4)')
    })
  })

  describe('validation', () => {
    it('should not throw when expression exceeds 1000 characters (decorators validated elsewhere)', () => {
      const tooLong = 'x'.repeat(1001)
      expect(() => new Expression(tooLong)).not.toThrow()
    })

    it('should allow expressions up to 1000 characters', () => {
      const maxLen = 'x'.repeat(1000)
      const expression = new Expression(maxLen)
      expect(expression.toString()).toBe(maxLen)
    })
  })
})

