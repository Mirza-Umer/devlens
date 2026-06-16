import { MigrationInterface, QueryRunner } from "typeorm";

export class Files1781634844494 implements MigrationInterface {
    name = 'Files1781634844494'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "file_entity" ("id" SERIAL NOT NULL, "projectId" integer NOT NULL, "path" character varying NOT NULL, "name" character varying NOT NULL, "extension" character varying NOT NULL, "content" text NOT NULL, "size" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d8375e0b2592310864d2b4974b2" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "file_entity"`);
    }

}
