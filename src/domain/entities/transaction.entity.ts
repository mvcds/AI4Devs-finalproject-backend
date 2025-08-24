import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { IsString, IsOptional, IsUUID, IsDate, IsNotEmpty, IsEnum } from 'class-validator'
import { Category } from './category.entity'
import { Money } from '../value-objects/money.value-object'
import { FrequencyEnum } from '../value-objects/frequency.value-object'
import { Expression } from '../value-objects/expression.value-object'

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  id: string

  @Column({ type: 'varchar', length: 255 })
  @IsString()
  @IsNotEmpty()
  description: string

  @Column({ type: 'text', transformer: { 
    to: (value: Expression) => value.toString(),
    from: (value: string) => new Expression(value)
  }})
  @IsNotEmpty()
  expression: Expression

  @ManyToOne(() => Category, category => category.transactions, { 
    nullable: false,
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    eager: false
  })
  @JoinColumn({ name: 'categoryId', referencedColumnName: 'id' })
  category: Category

  @Column({ type: 'uuid', name: 'categoryId' })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string

  @Column({ type: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  userId: string

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  notes?: string

  @Column({ type: 'enum', enum: FrequencyEnum, default: FrequencyEnum.MONTH })
  @IsNotEmpty()
  @IsEnum(FrequencyEnum)
  frequency: FrequencyEnum

  @CreateDateColumn()
  @IsDate()
  createdAt: Date

  @UpdateDateColumn()
  @IsDate()
  updatedAt: Date
  
  constructor(
    description: string,
    expression: string,
    userId: string,
    categoryId: string,
    notes?: string,
    frequency?: FrequencyEnum
  ) {
    this.description = description
    this.expression = new Expression(expression)
    this.userId = userId
    this.categoryId = categoryId
    this.notes = notes
    this.frequency = frequency || FrequencyEnum.MONTH
  }

    /**
   * Get the evaluated amount as a Money value object
   * For simple expressions like "35" or "-12", this returns the Money object
   * For complex expressions, this will need to be evaluated with transaction context
   */
  get amount(): Money {
    return new Money(this.expression.value)
  }

  isIncome(): boolean {
    return this.amount.amount > 0
  }

  isExpense(): boolean {
    return this.amount.amount <= 0
  }


  updateExpression(expression: string): void {
    this.expression = new Expression(expression)
  }

  updateDescription(description: string): void {
    this.description = description
  }

  updateCategory(categoryId: string): void {
    this.categoryId = categoryId
  }

  updateNotes(notes: string): void {
    this.notes = notes
  }

  updateFrequency(frequency: FrequencyEnum): void {
    this.frequency = frequency
  }

  belongsToUser(userId: string): boolean {
    return this.userId === userId
  }
}
