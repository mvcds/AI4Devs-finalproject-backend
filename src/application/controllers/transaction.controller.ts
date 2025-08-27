import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { TransactionService } from '../services/transaction.service'
import { CreateTransactionDto } from '../dto/create-transaction.dto'
import { UpdateTransactionDto } from '../dto/update-transaction.dto'
import { TransactionResponseDto } from '../dto/transaction-response.dto'
import { MathEvaluatorService } from '../../domain/services/math-evaluator.service'
import { Frequency, FrequencyEnum } from '../../domain/value-objects/frequency.value-object'

@ApiTags('transactions')
@Controller('api/transactions')
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly mathEvaluatorService: MathEvaluatorService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created successfully', type: TransactionResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createTransactionDto: CreateTransactionDto): Promise<TransactionResponseDto> {
    return this.transactionService.create(createTransactionDto)
  }

  @Get()
  @ApiOperation({ summary: 'Get all transactions' })
  @ApiResponse({ status: 200, description: 'Transactions retrieved successfully', type: [TransactionResponseDto] })
  async findAll(): Promise<{ transactions: TransactionResponseDto[]; total: number; page: number; limit: number }> {
    return this.transactionService.findAll()
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get transaction summary' })
  @ApiResponse({ status: 200, description: 'Summary retrieved successfully' })
  async getSummary(): Promise<{ totalIncome: number; totalExpenses: number; netAmount: number; transactionCount: number }> {
    return this.transactionService.getSummary()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a transaction by ID' })
  @ApiResponse({ status: 200, description: 'Transaction retrieved successfully', type: TransactionResponseDto })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async findOne(@Param('id') id: string): Promise<TransactionResponseDto> {
    return this.transactionService.findOne(id)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a transaction' })
  @ApiResponse({ status: 200, description: 'Transaction updated successfully', type: TransactionResponseDto })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async update(@Param('id') id: string, @Body() updateTransactionDto: UpdateTransactionDto): Promise<TransactionResponseDto> {
    return this.transactionService.update(id, updateTransactionDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a transaction' })
  @ApiResponse({ status: 200, description: 'Transaction deleted successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.transactionService.remove(id)
  }

  @Post('evaluate-expression')
  @ApiOperation({ summary: 'Evaluate an expression for preview' })
  @ApiResponse({ status: 200, description: 'Expression evaluated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid expression' })
  async evaluateExpression(
    @Body() body: { expression: string; frequency: string }
  ): Promise<{ 
    amount: number; 
    type: 'income' | 'expense'; 
    normalizedAmount: number;
    isValid: boolean;
  }> {
    try {
      const amount = this.mathEvaluatorService.evaluate(body.expression)
      const type = amount > 0 ? 'income' : 'expense'
      
      // Calculate normalized amount based on frequency
      const frequency = Frequency.fromString(body.frequency)
      const normalizedAmount = frequency.calculatenormalizedAmount(amount)
      
      return {
        amount,
        type,
        normalizedAmount,
        isValid: true
      }
    } catch (error) {
      return {
        amount: 0,
        type: 'expense',
        normalizedAmount: 0,
        isValid: false
      }
    }
  }
}
