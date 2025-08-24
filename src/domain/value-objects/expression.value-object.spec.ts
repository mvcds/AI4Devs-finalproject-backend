import { Expression } from './expression.value-object'

describe('Expression Value Object', () => {
  describe('Constructor', () => {
    it('should create expression from string', () => {
      const expression = new Expression('100')
      expect(expression.value).toBe(100)
    })

    it('should trim whitespace', () => {
      const expression = new Expression('  100  ')
      expect(expression.value).toBe(100)
    })

    it('should handle empty string by defaulting to zero', () => {
      const expression = new Expression('')
      expect(expression.value).toBe(0)
    })

    it('should handle whitespace only by defaulting to zero', () => {
      const expression = new Expression('   ')
      expect(expression.value).toBe(0)
    })

    it('should throw error for too long expression', () => {
      const longExpression = 'a'.repeat(1001)
      expect(() => new Expression(longExpression)).toThrow('Expression is too long')
    })
  })

  describe('String Conversion', () => {
    it('should convert to string', () => {
      const expression = new Expression('100')
      expect(expression.toString()).toBe('100')
    })

    it('should convert to JSON', () => {
      const expression = new Expression('@salary_id * 0.12')
      const json = expression.toJSON()
      expect(json).toBe('@salary_id * 0.12')
    })
  })


})
