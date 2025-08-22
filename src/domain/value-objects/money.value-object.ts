import { IsNumber, Min, Max } from 'class-validator'

export class Money {
  @IsNumber()
  @Min(-999999999.99)
  @Max(999999999.99)
  private readonly _amount: number

  @IsNumber()
  @Min(0)
  @Max(999)
  private readonly _decimals: number

  constructor(amount: number, decimals: number = 2) {
    this._amount = this.roundToDecimals(amount, decimals)
    this._decimals = decimals
  }

  get amount(): number {
    return this._amount
  }

  get decimals(): number {
    return this._decimals
  }



  add(other: Money): Money {
    if (this._decimals !== other._decimals) {
      throw new Error('Cannot add money with different decimal places')
    }
    return new Money(this._amount + other._amount, this._decimals)
  }

  subtract(other: Money): Money {
    if (this._decimals !== other._decimals) {
      throw new Error('Cannot subtract money with different decimal places')
    }
    return new Money(this._amount - other._amount, this._decimals)
  }

  multiply(factor: number): Money {
    return new Money(this._amount * factor, this._decimals)
  }

  divide(divisor: number): Money {
    if (divisor === 0) {
      throw new Error('Cannot divide by zero')
    }
    return new Money(this._amount / divisor, this._decimals)
  }

  equals(other: Money): boolean {
    return this._amount === other._amount && this._decimals === other._decimals
  }

  toString(): string {
    return this._amount.toFixed(this._decimals)
  }

  toJSON(): { amount: number; decimals: number } {
    return {
      amount: this._amount,
      decimals: this._decimals,
    }
  }

  private roundToDecimals(value: number, decimals: number): number {
    const factor = Math.pow(10, decimals)
    return Math.round(value * factor) / factor
  }


}
