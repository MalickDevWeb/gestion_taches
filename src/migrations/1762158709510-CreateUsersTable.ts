import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersTable1762158709510 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" SERIAL NOT NULL,
                "name" character varying(100) NOT NULL,
                "email" character varying(150) NOT NULL,
                "password" character varying(255) NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_96aac72f1574b88752e9fb00089" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
