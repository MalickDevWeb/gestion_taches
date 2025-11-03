import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTransfersTable1762158714973 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "transfer_status_enum" AS ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED')
        `);
        await queryRunner.query(`
            CREATE TABLE "transfers" (
                "id" character varying NOT NULL,
                "amount" numeric(10,2) NOT NULL,
                "currency" character varying(3) NOT NULL DEFAULT 'XOF',
                "channel" character varying(50) NOT NULL,
                "recipient" jsonb NOT NULL,
                "metadata" jsonb,
                "status" "transfer_status_enum" NOT NULL DEFAULT 'PENDING',
                "reference" character varying(100) NOT NULL,
                "fees" numeric(10,2) NOT NULL,
                "total" numeric(10,2) NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_4a4a3a8e7f3b4c8e8e8e8e8e8e8" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_4a4a3a8e7f3b4c8e8e8e8e8e8e9" ON "transfers" ("reference")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_4a4a3a8e7f3b4c8e8e8e8e8e8e9"`);
        await queryRunner.query(`DROP TABLE "transfers"`);
        await queryRunner.query(`DROP TYPE "transfer_status_enum"`);
    }

}
