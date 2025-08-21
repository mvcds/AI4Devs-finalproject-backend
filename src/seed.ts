import { DataSource } from 'typeorm'
import { Transaction } from './domain/entities/transaction.entity'
import { Category } from './domain/entities/category.entity'

async function seed() {
  const nodeEnv = process.env.NODE_ENV || 'development'
  if (nodeEnv !== 'development') {
    console.log(`Seeding skipped for environment: ${nodeEnv}`)
    return
  }

  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/salary_tracker',
    entities: [Transaction, Category],
    synchronize: false,
  })

  try {
    await dataSource.initialize()
    console.log('Data Source initialized')

    const categoryRepository = dataSource.getRepository(Category)
    const transactionRepository = dataSource.getRepository(Transaction)

    // Check if categories already exist
    const existingCategories = await categoryRepository.count()
    if (existingCategories === 0) {
      console.log('Seeding categories...')
      
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
      
      console.log('Categories seeded successfully')
    } else {
      console.log('Categories already exist, skipping...')
    }

    // Check if transactions already exist
    const existingTransactions = await transactionRepository.count()
    if (existingTransactions === 0) {
      console.log('Seeding transactions...')
      
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
        
        console.log('Transactions seeded successfully')
      } else {
        console.log('Required categories not found, skipping transaction seeding')
      }
    } else {
      console.log('Transactions already exist, skipping...')
    }

    console.log('Seeding completed successfully')
  } catch (error) {
    console.error('Seeding failed:', error)
    process.exit(1)
  } finally {
    await dataSource.destroy()
  }
}

seed()
