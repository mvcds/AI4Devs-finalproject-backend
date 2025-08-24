import { IsString, IsNotEmpty, MaxLength } from 'class-validator'

export class Expression {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  private readonly _value: string

  constructor(value?: string | null) {
    this._value = value?.trim() ?? '0'
  }

  toString(): string {
    return this._value
  }

  toJSON(): string {
    return this.toString()
  }
}
