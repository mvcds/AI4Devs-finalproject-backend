import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { TransactionController } from './application/controllers/transaction.controller'
import { CategoryController } from './application/controllers/category.controller'
import { TransactionService } from './application/services/transaction.service'
import { CategoryService } from './application/services/category.service'
import { MathEvaluatorService } from './domain/services/math-evaluator.service'
import { TransactionEvaluatorService } from './domain/services/transaction-evaluator.service'
import { TransactionReferenceResolverService } from './domain/services/transaction-reference-resolver.service'
import { MockUserService } from './domain/services/mock-user.service'
import { Transaction } from './domain/entities/transaction.entity'
import { Category } from './domain/entities/category.entity'

const isProduction = process.env.NODE_ENV === 'production'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Transaction, Category],
      synchronize: !isProduction,
      migrationsRun: isProduction,
    }),
    TypeOrmModule.forFeature([Transaction, Category]),
  ],
  controllers: [AppController, TransactionController, CategoryController],
  providers: [AppService, TransactionService, CategoryService, MockUserService, MathEvaluatorService, TransactionEvaluatorService, TransactionReferenceResolverService],
})
export class AppModule {}
