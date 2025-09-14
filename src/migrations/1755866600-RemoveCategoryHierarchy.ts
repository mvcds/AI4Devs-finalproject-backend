import { MigrationInterface, QueryRunner } from 'typeorm'

export class RemoveCategoryHierarchy1755866600 implements MigrationInterface {
  name = 'RemoveCategoryHierarchy1755866600'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remove the parentId column from categories table
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "parentId"`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add back the parentId column
    await queryRunner.query(`ALTER TABLE "categories" ADD "parentId" uuid`)
  }
}
