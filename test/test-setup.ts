import { Test } from '@nestjs/testing'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { getRepositoryToken } from '@nestjs/typeorm'

// Global test setup
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test'
  process.env.DATABASE_URL = 'postgresql://user:password@localhost:5432/salary_tracker_test'
  process.env.REDIS_URL = 'redis://localhost:6379'
})

// Global test teardown
afterAll(async () => {
  // Cleanup test environment
})

// Helper function to create test module
export const createTestingModule = async (entities: any[], providers: any[] = []) => {
  return Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env.test',
      }),
      TypeOrmModule.forRoot({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        entities,
        synchronize: true, // Only for tests
        logging: false,
      }),
      TypeOrmModule.forFeature(entities),
    ],
    providers,
  }).compile()
}

// Helper function to get repository
export const getRepository = (module: any, entity: any) => {
  return module.get(getRepositoryToken(entity))
}
