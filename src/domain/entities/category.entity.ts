import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { IsString, IsOptional, IsUUID, IsDate, IsEnum } from 'class-validator'
import { Transaction } from './transaction.entity'

export enum CategoryFlow {
  INCOME = 'income',
  EXPENSE = 'expense',
  SAVINGS_AND_INVESTMENTS = 's&i'
}

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  id: string

  @Column({ type: 'varchar', length: 100 })
  @IsString()
  name: string

  @Column({ type: 'enum', enum: CategoryFlow, default: CategoryFlow.EXPENSE })
  @IsEnum(CategoryFlow)
  flow: CategoryFlow

  @Column({ type: 'varchar', length: 7, nullable: true })
  @IsOptional()
  @IsString()
  color?: string

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  description?: string


  @OneToMany(() => Transaction, transaction => transaction.category)
  transactions: Transaction[]

  @CreateDateColumn()
  @IsDate()
  createdAt: Date

  @UpdateDateColumn()
  @IsDate()
  updatedAt: Date

  constructor(name: string, flow: CategoryFlow = CategoryFlow.EXPENSE, color?: string, description?: string) {
    this.name = name
    this.flow = flow
    this.color = color
    this.description = description
  }


  updateName(name: string): void {
    this.name = name
  }

  updateFlow(flow: CategoryFlow): void {
    this.flow = flow
  }

  updateColor(color: string): void {
    this.color = color
  }

  updateDescription(description: string): void {
    this.description = description
  }

}
