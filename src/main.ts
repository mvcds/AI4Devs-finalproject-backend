import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { DataSource } from 'typeorm'
import { Transaction } from './domain/entities/transaction.entity'
import { Category } from './domain/entities/category.entity'
import { FrequencyEnum } from './domain/value-objects/frequency.value-object'

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
  
  // Expose OpenAPI JSON specification
  app.use('/api-json', (req, res) => {
    res.json(document)
  })

  const port = process.env.BACKEND_PORT || 3000
  await app.listen(port)
  
  console.log(`🚀 Application is running on: http://localhost:${port}`)
  console.log(`📚 API Documentation available at: http://localhost:${port}/api/docs`)

  // Run seed data on startup (only in development)
  const nodeEnv = process.env.NODE_ENV || 'development'
  if (nodeEnv === 'development') {
    console.log('🚀 Starting seed process...')
    console.log(`📊 Environment: ${nodeEnv}`)
    console.log(`🗄️ Database URL: ${process.env.DATABASE_URL ? 'Set' : 'Not set'}`)
    await runSeedOnStartup(app)
    console.log('🎯 Seed process completed')
  } else {
    console.log(`⏭️ Skipping seed process for environment: ${nodeEnv}`)
  }
}

async function runSeedOnStartup(app: any) {
  try {
    // Wait for database to be fully ready
    await waitForDatabase(app)
    
    const dataSource = app.get(DataSource)
    
    // Add a simple lock to prevent multiple seed runs
    if ((global as any).__seedRunning) {
      console.log('⏳ Seed already running, skipping...')
      return
    }
    (global as any).__seedRunning = true
    
    try {
      // Check if seeding has already been completed by looking for a specific transaction
      const transactionRepository = dataSource.getRepository(Transaction)
      const seedCompletedTransaction = await transactionRepository.findOne({
        where: { description: 'Monthly Salary' }
      })
      
      if (seedCompletedTransaction) {
        console.log('✅ Seed has already been completed, skipping...')
        return
      }
      
      // Check if categories already exist
      const categoryRepository = dataSource.getRepository(Category)
      const existingCategories = await categoryRepository.count()
      const existingTransactions = await transactionRepository.count()
      
      if (existingCategories === 0) {
        console.log('🌱 No categories found, running seed...')
        await runSeed(dataSource)
        console.log('✅ Seed completed successfully')
      } else {
        console.log(`📊 Database already contains ${existingCategories} categories`)
        
        // Only recreate transactions if they exist and need frequency fixes
        if (existingTransactions > 0) {
          console.log(`🗑️ Clearing ${existingTransactions} existing transactions to fix frequency issues...`)
          await transactionRepository.clear()
          console.log('🔄 Recreating transactions with proper frequency values...')
          await runSeedTransactionsOnly(dataSource)
          console.log('✅ Transactions recreated successfully')
        } else {
          console.log('📊 No existing transactions, skipping transaction seed')
        }
      }
    } finally {
      // Release the lock
      (global as any).__seedRunning = false
    }
  } catch (error) {
    console.error('❌ Failed to run seed on startup:', error) as any
    // Don't exit the process, just log the error
    (global as any).__seedRunning = false
  }
}

async function waitForDatabase(app: any, maxRetries = 30, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const dataSource = app.get(DataSource)
      await dataSource.query('SELECT 1')
      console.log('✅ Database connection established')
      return
    } catch (error) {
      if (i === maxRetries - 1) {
        throw new Error(`Failed to connect to database after ${maxRetries} attempts`)
      }
      console.log(`⏳ Waiting for database connection... (attempt ${i + 1}/${maxRetries})`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

async function runSeed(dataSource: DataSource): Promise<void> {
  const categoryRepository = dataSource.getRepository(Category)
  const transactionRepository = dataSource.getRepository(Transaction)

  // Seed categories - check for existing ones by name
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
    // Check if category already exists by name
    const existingCategory = await categoryRepository.findOne({ 
      where: { name: categoryData.name } 
    })
    
    if (!existingCategory) {
      const category = new Category(
        categoryData.name,
        categoryData.flow as any,
        categoryData.color,
        categoryData.description
      )
      await categoryRepository.save(category)
      console.log(`✅ Created category: ${categoryData.name}`)
    } else {
      console.log(`⏭️ Category already exists: ${categoryData.name}`)
    }
  }

  // Seed transactions
  await runSeedTransactionsOnly(dataSource)
}

async function runSeedTransactionsOnly(dataSource: DataSource): Promise<boolean> {
  const categoryRepository = dataSource.getRepository(Category)
  const transactionRepository = dataSource.getRepository(Transaction)

  // Seed transactions
  const salaryCategory = await categoryRepository.findOne({ where: { name: 'Salary' } })
  const groceriesCategory = await categoryRepository.findOne({ where: { name: 'Groceries' } })
  const utilitiesCategory = await categoryRepository.findOne({ where: { name: 'Utilities' } })

  if (salaryCategory && groceriesCategory && utilitiesCategory) {
    const mockUserId = '0a390afb-d082-47be-9cfa-c3d4eebd553f'
    const transactions = [
      {
        description: 'Monthly Salary',
        amount: 5000.00,
        date: new Date('2024-01-15'),
        categoryId: salaryCategory.id,
        notes: 'January 2024 salary',
        userId: mockUserId,
        frequency: FrequencyEnum.MONTH
      },
      {
        description: 'Weekly Groceries',
        amount: -150.75,
        date: new Date('2024-01-14'),
        categoryId: groceriesCategory.id,
        notes: 'Weekly food shopping',
        userId: mockUserId,
        frequency: FrequencyEnum.WEEK
      },
      {
        description: 'Electricity Bill',
        amount: -89.50,
        date: new Date('2024-01-13'),
        categoryId: utilitiesCategory.id,
        notes: 'December electricity bill',
        userId: mockUserId,
        frequency: FrequencyEnum.TWO_MONTH
      }
    ]

    for (const transactionData of transactions) {
      const transaction = new Transaction(
        transactionData.description,
        transactionData.amount,
        transactionData.date,
        transactionData.userId,
        transactionData.categoryId,
        transactionData.notes,
        transactionData.frequency
      )
      await transactionRepository.save(transaction)
    }
    
    return true
  }
  
  return false
}

bootstrap()
