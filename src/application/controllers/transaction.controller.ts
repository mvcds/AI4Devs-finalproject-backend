import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger'
import { TransactionService } from '../services/transaction.service'
import { CreateTransactionDto } from '../dto/create-transaction.dto'
import { UpdateTransactionDto } from '../dto/update-transaction.dto'
import { TransactionResponseDto } from '../dto/transaction-response.dto'
import { ExpressionResult } from '../dto/expression-result.dto'
import { MathEvaluatorService } from '../../domain/services/math-evaluator.service'
import { MockUserService } from '../../domain/services/mock-user.service'
import { Frequency, FrequencyEnum } from '../../domain/value-objects/frequency.value-object'
import { TransactionSummaryDto } from '../dto/transaction-summary.dto'
import { BudgetPercentagesDto } from '../dto/budget-percentages.dto'

@ApiTags('transactions')
@Controller('api/transactions')
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly mathEvaluatorService: MathEvaluatorService,
    private readonly mockUserService: MockUserService,
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
  async findAll(): Promise<TransactionResponseDto[]> {
    const result = await this.transactionService.findAll()
    return result.transactions
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get transaction summary' })
  @ApiResponse({ status: 200, description: 'Summary retrieved successfully', type: TransactionSummaryDto })
  async getSummary(): Promise<TransactionSummaryDto> {
    return this.transactionService.getSummary()
  }

  @Get('budget-percentages')
  @ApiOperation({ summary: 'Get budget percentages by category and flow' })
  @ApiResponse({ status: 200, description: 'Budget percentages retrieved successfully', type: BudgetPercentagesDto })
  async getBudgetPercentages(): Promise<BudgetPercentagesDto> {
    return this.transactionService.getBudgetPercentages()
  }

  @Get('evaluate-expression')
  @ApiOperation({ summary: 'Evaluate an expression for preview' })
  @ApiQuery({
    name: 'expression',
    description: 'Mathematical expression to evaluate (e.g., "1000", "-500", "1000 * 0.12")',
    example: '1000',
    type: 'string',
    required: true
  })
  @ApiQuery({
    name: 'frequency',
    description: 'Frequency for normalization calculation',
    enum: FrequencyEnum,
    example: FrequencyEnum.MONTH,
    required: true
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Expression evaluated successfully', 
    type: ExpressionResult 
  })
  @ApiResponse({ status: 400, description: 'Invalid expression' })
  async evaluateExpression(
    @Query('expression') expression: string,
    @Query('frequency') frequency: string
  ): Promise<ExpressionResult> {
    const userId = this.mockUserService.getCurrentUserId()
    const amount = await this.mathEvaluatorService.evaluate(expression, userId)
    const type = amount > 0 ? 'income' : 'expense'
    
    // Calculate normalized amount based on frequency
    const frequencyObj = Frequency.fromString(frequency)
    const normalizedAmount = frequencyObj.calculatenormalizedAmount(amount)
    
    return {
      amount,
      type,
      normalizedAmount,
      isValid: true
    }
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

}
