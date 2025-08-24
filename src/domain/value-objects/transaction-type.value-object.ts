import { IsEnum } from 'class-validator'

export enum TransactionTypeEnum {
  INCOME = 'income',
  EXPENSE = 'expense',
}


export class TransactionType {
  @IsEnum(TransactionTypeEnum)
  private readonly _value: TransactionTypeEnum

  constructor(value: TransactionTypeEnum) {
    this._value = value
  }

  get value(): TransactionTypeEnum {
    return this._value
  }

  get isIncome(): boolean {
    return this._value === TransactionTypeEnum.INCOME
  }

  get isExpense(): boolean {
    return this._value === TransactionTypeEnum.EXPENSE
  }

  equals(other: TransactionType): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }

  toJSON(): { value: TransactionTypeEnum } {
    return { value: this._value }
  }

  static income(): TransactionType {
    return new TransactionType(TransactionTypeEnum.INCOME)
  }

  static expense(): TransactionType {
    return new TransactionType(TransactionTypeEnum.EXPENSE)
  }

  static fromString(value: string): TransactionType {
    if (value === TransactionTypeEnum.INCOME) {
      return TransactionType.income()
    }
    if (value === TransactionTypeEnum.EXPENSE) {
      return TransactionType.expense()
    }
    throw new Error(`Invalid transaction type: ${value}`)
  }
}
