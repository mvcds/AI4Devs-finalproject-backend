import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  ValidationPipe,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger'
import { TransactionService } from '../services/transaction.service'
import { CreateTransactionDto } from '../dto/create-transaction.dto'
import { UpdateTransactionDto } from '../dto/update-transaction.dto'
import { TransactionResponseDto } from '../dto/transaction-response.dto'

@ApiTags('transactions')
@Controller('api/transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({
    status: 201,
    description: 'Transaction created successfully',
    type: TransactionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  async create(
    @Body(ValidationPipe) createTransactionDto: CreateTransactionDto,
  ): Promise<TransactionResponseDto> {
    return this.transactionService.create(createTransactionDto)
  }

  @Get()
  @ApiOperation({ summary: 'Get all transactions with filtering and pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'type', required: false, enum: ['income', 'expense'], description: 'Filter by transaction type' })
  @ApiQuery({ name: 'categoryId', required: false, type: String, description: 'Filter by category ID' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Filter by start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'Filter by end date (YYYY-MM-DD)' })
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        transactions: {
          type: 'array',
          items: { $ref: '#/components/schemas/TransactionResponseDto' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('type') type?: string,
    @Query('categoryId') categoryId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.transactionService.findAll(page, limit, type, categoryId, startDate, endDate)
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get transaction summary with totals' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date for summary (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date for summary (YYYY-MM-DD)' })
  @ApiResponse({
    status: 200,
    description: 'Summary retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalIncome: { type: 'number' },
        totalExpenses: { type: 'number' },
        netAmount: { type: 'number' },
        transactionCount: { type: 'number' },
      },
    },
  })
  async getSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.transactionService.getSummary(startDate, endDate)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a transaction by ID' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({
    status: 200,
    description: 'Transaction retrieved successfully',
    type: TransactionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Transaction not found',
  })
  async findOne(@Param('id') id: string): Promise<TransactionResponseDto> {
    return this.transactionService.findOne(id)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a transaction' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({
    status: 200,
    description: 'Transaction updated successfully',
    type: TransactionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiResponse({
    status: 404,
    description: 'Transaction not found',
  })
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateTransactionDto: UpdateTransactionDto,
  ): Promise<TransactionResponseDto> {
    return this.transactionService.update(id, updateTransactionDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a transaction' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({
    status: 200,
    description: 'Transaction deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Transaction not found',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.transactionService.remove(id)
  }
}
