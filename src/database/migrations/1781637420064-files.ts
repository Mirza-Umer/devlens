import { MigrationInterface, QueryRunner } from "typeorm";

export class Files1781637420064 implements MigrationInterface {
    name = 'Files1781637420064'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file_entity" ALTER COLUMN "extension" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file_entity" ALTER COLUMN "extension" SET NOT NULL`);
    }

}
