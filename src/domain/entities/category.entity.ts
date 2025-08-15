import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm'
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

  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  parentId?: string

  @ManyToOne(() => Category, category => category.children, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent?: Category

  @OneToMany(() => Category, category => category.parent)
  children: Category[]

  @OneToMany(() => Transaction, transaction => transaction.category)
  transactions: Transaction[]

  @CreateDateColumn()
  @IsDate()
  createdAt: Date

  @UpdateDateColumn()
  @IsDate()
  updatedAt: Date

  constructor(name: string, flow: CategoryFlow = CategoryFlow.EXPENSE, color?: string, description?: string, parentId?: string) {
    this.name = name
    this.flow = flow
    this.color = color
    this.description = description
    this.parentId = parentId
  }

  isRoot(): boolean {
    return !this.parentId
  }

  isLeaf(): boolean {
    return !this.children || this.children.length === 0
  }

  hasChildren(): boolean {
    return this.children && this.children.length > 0
  }

  getDepth(): number {
    if (this.isRoot()) {
      return 0
    }
    return this.parent ? this.parent.getDepth() + 1 : 1
  }

  getFullPath(): string {
    if (this.isRoot()) {
      return this.name
    }
    return this.parent ? `${this.parent.getFullPath()} > ${this.name}` : this.name
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

  updateParent(parentId: string): void {
    this.parentId = parentId
  }
}
