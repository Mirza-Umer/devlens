import { MigrationInterface, QueryRunner } from "typeorm";

export class Files1781637303363 implements MigrationInterface {
    name = 'Files1781637303363'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file_entity" ALTER COLUMN "name" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file_entity" ALTER COLUMN "name" SET NOT NULL`);
    }

}
