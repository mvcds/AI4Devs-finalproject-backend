import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { DataSource } from 'typeorm'
import { Transaction } from './domain/entities/transaction.entity'
import { Category } from './domain/entities/category.entity'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Enable CORS
  app.enableCors()

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  )

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Personal Finance Manager API')
    .setDescription('API for managing personal finances, transactions, and categories')
    .setVersion('1.0')
    .addTag('transactions', 'Transaction management endpoints')
    .addTag('categories', 'Category management endpoints')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)

  const port = process.env.PORT || 3000
  await app.listen(port)
  
  console.log(`🚀 Application is running on: http://localhost:${port}`)
  console.log(`📚 API Documentation available at: http://localhost:${port}/api/docs`)

  // Run seed data on startup
  await runSeedOnStartup(app)
}

async function runSeedOnStartup(app: any) {
  try {
    const dataSource = app.get(DataSource)
    
    // Check if categories already exist
    const categoryRepository = dataSource.getRepository(Category)
    const existingCategories = await categoryRepository.count()
    
    if (existingCategories === 0) {
      console.log('🌱 No categories found, running seed...')
      await runSeed(dataSource)
      console.log('✅ Seed completed successfully')
    } else {
      console.log(`📊 Database already contains ${existingCategories} categories, skipping seed`)
    }
  } catch (error) {
    console.error('❌ Failed to run seed on startup:', error)
  }
}

async function runSeed(dataSource: DataSource) {
  const categoryRepository = dataSource.getRepository(Category)
  const transactionRepository = dataSource.getRepository(Transaction)
  const { randomUUID } = await import('crypto')

  // Seed categories
  const categories = [
    { name: 'Salary', flow: 'income', color: '#10B981', description: 'Regular employment income' },
    { name: 'Freelance', flow: 'income', color: '#3B82F6', description: 'Freelance and contract work' },
    { name: 'Investments', flow: 'income', color: '#8B5CF6', description: 'Investment returns and dividends' },
    { name: 'Groceries', flow: 'expense', color: '#EF4444', description: 'Food and household items' },
    { name: 'Utilities', flow: 'expense', color: '#F59E0B', description: 'Electricity, water, gas, internet' },
    { name: 'Transportation', flow: 'expense', color: '#06B6D4', description: 'Fuel, public transport, maintenance' },
    { name: 'Entertainment', flow: 'expense', color: '#EC4899', description: 'Movies, dining out, hobbies' },
    { name: 'Healthcare', flow: 'expense', color: '#84CC16', description: 'Medical expenses and insurance' },
    { name: 'Savings', flow: 's&i', color: '#6366F1', description: 'Regular savings contributions' },
    { name: 'Emergency Fund', flow: 's&i', color: '#059669', description: 'Emergency savings fund' },
    { name: 'Retirement', flow: 's&i', color: '#DC2626', description: 'Retirement account contributions' }
  ]

  for (const categoryData of categories) {
    const category = new Category(
      categoryData.name,
      categoryData.flow as any,
      categoryData.color,
      categoryData.description
    )
    await categoryRepository.save(category)
  }

  // Seed transactions
  const salaryCategory = await categoryRepository.findOne({ where: { name: 'Salary' } })
  const groceriesCategory = await categoryRepository.findOne({ where: { name: 'Groceries' } })
  const utilitiesCategory = await categoryRepository.findOne({ where: { name: 'Utilities' } })

  if (salaryCategory && groceriesCategory && utilitiesCategory) {
    const mockUserId = randomUUID()
    const transactions = [
      {
        description: 'Monthly Salary',
        amount: 5000.00,
        date: new Date('2024-01-15'),
        categoryId: salaryCategory.id,
        notes: 'January 2024 salary',
        userId: mockUserId
      },
      {
        description: 'Weekly Groceries',
        amount: -150.75,
        date: new Date('2024-01-14'),
        categoryId: groceriesCategory.id,
        notes: 'Weekly food shopping',
        userId: mockUserId
      },
      {
        description: 'Electricity Bill',
        amount: -89.50,
        date: new Date('2024-01-13'),
        categoryId: utilitiesCategory.id,
        notes: 'December electricity bill',
        userId: mockUserId
      }
    ]

    for (const transactionData of transactions) {
      const transaction = new Transaction(
        transactionData.description,
        transactionData.amount,
        transactionData.date,
        transactionData.userId,
        transactionData.categoryId,
        transactionData.notes
      )
      await transactionRepository.save(transaction)
    }
  }
}

bootstrap()
