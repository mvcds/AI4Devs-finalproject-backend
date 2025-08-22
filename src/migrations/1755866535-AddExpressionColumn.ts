import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddExpressionColumn1755866535000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "expression" text`)
    
    await queryRunner.query(`
      UPDATE "transactions" 
      SET "expression" = CAST("amount" AS text) 
      WHERE "expression" IS NULL
    `)
    
    await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "expression" SET NOT NULL`)
    
    await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN IF EXISTS "amount"`)
    
    await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN IF EXISTS "date"`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "amount" decimal NOT NULL DEFAULT 0`)
    
    await queryRunner.query(`
      UPDATE "transactions" 
      SET "amount" = CAST("expression" AS decimal)
      WHERE "expression" ~ '^[0-9.-]+$' -- Only convert simple numeric expressions
    `)
    
    await queryRunner.query(`ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "date" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`)
    
    await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN IF EXISTS "expression"`)
  }
}
