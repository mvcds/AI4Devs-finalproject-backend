import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { IsString, IsOptional, IsUUID, IsDate, IsNotEmpty } from 'class-validator'
import { Category } from './category.entity'
import { Money } from '../value-objects/money.value-object'
import { TransactionType } from '../value-objects/transaction-type.value-object'

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  id: string

  @Column({ type: 'varchar', length: 255 })
  @IsString()
  @IsNotEmpty()
  description: string

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  @IsNotEmpty()
  amount: number

  // Type is inferred from amount: positive = income, negative/zero = expense

  @Column({ type: 'date' })
  @IsDate()
  @IsNotEmpty()
  date: Date

  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  categoryId?: string

  @ManyToOne(() => Category, category => category.transactions, { nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category?: Category

  @Column({ type: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  userId: string

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  notes?: string

  @CreateDateColumn()
  @IsDate()
  createdAt: Date

  @UpdateDateColumn()
  @IsDate()
  updatedAt: Date

  constructor(
    description: string,
    amount: number,
    date: Date,
    userId: string,
    categoryId?: string,
    notes?: string
  ) {
    this.description = description
    this.amount = amount
    this.date = date
    this.userId = userId
    this.categoryId = categoryId
    this.notes = notes
  }

  getMoney(): Money {
    return new Money(this.amount)
  }

  getTransactionType(): TransactionType {
    return this.amount > 0 ? TransactionType.income() : TransactionType.expense()
  }

  isIncome(): boolean {
    return this.amount > 0
  }

  isExpense(): boolean {
    return this.amount <= 0
  }

  getAbsoluteAmount(): number {
    return Math.abs(this.amount)
  }

  updateAmount(amount: number): void {
    this.amount = amount
  }

  updateDescription(description: string): void {
    this.description = description
  }

  updateDate(date: Date): void {
    this.date = date
  }

  updateCategory(categoryId: string): void {
    this.categoryId = categoryId
  }

  updateNotes(notes: string): void {
    this.notes = notes
  }

  belongsToUser(userId: string): boolean {
    return this.userId === userId
  }
}
