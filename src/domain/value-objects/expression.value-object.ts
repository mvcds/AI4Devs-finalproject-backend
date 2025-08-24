import { IsString, IsNotEmpty, MaxLength } from 'class-validator'

export class Expression {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  private readonly _value: string

  constructor(value: string) {
    if (!value) {
      this._value = '0'
    } else {
      this._value = value.trim()
    }
    this.validate()
  }

  get value(): number {
    //TODO: use the correct parser service to evaluate the expression
    return +(this._value ?? 0)
  }

  private validate(): void {
    if (this._value.length > 1000) {
      throw new Error('Expression is too long (max 1000 characters)')
    }
  }

  toString(): string {
    return this._value
  }

  toJSON(): string {
    return this.toString()
  }
}
