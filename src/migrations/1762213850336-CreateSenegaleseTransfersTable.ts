import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSenegaleseTransfersTable1762213850336 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Créer la table des transferts avec des données sénégalaises
        await queryRunner.query(`
            CREATE TYPE "transfer_status_enum" AS ENUM('pending', 'processing', 'completed', 'failed', 'cancelled')
        `);

        await queryRunner.query(`
            CREATE TABLE "transfers" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "amount" numeric(10,2) NOT NULL,
                "currency" varchar(3) NOT NULL DEFAULT 'XOF',
                "channel" varchar(50) NOT NULL,
                "recipient" jsonb NOT NULL,
                "metadata" jsonb,
                "status" "transfer_status_enum" NOT NULL DEFAULT 'pending',
                "reference" varchar(100) NOT NULL,
                "fees" numeric(10,2) NOT NULL,
                "total" numeric(10,2) NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_transfers" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_transfers_reference" ON "transfers" ("reference")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_transfers_status" ON "transfers" ("status")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_transfers_channel" ON "transfers" ("channel")
        `);

        // Insérer des données de test sénégalaises
        await queryRunner.query(`
            INSERT INTO "transfers" ("id", "amount", "currency", "channel", "recipient", "metadata", "status", "reference", "fees", "total", "createdAt", "updatedAt") VALUES
            ('550e8400-e29b-41d4-a716-446655440001', 25000, 'XOF', 'WAVE', '{"phone": "+221770000001", "name": "Mamadou Diop"}', '{"orderId": "SEN-001", "source": "mobile"}', 'completed', 'TRF-20250101-SEN001', 250, 25250, '2025-01-01 10:00:00', '2025-01-01 10:02:00'),
            ('550e8400-e29b-41d4-a716-446655440002', 50000, 'XOF', 'OM', '{"phone": "+221771000002", "name": "Fatou Sow"}', '{"orderId": "SEN-002", "source": "web"}', 'pending', 'TRF-20250101-SEN002', 500, 50500, '2025-01-01 11:00:00', '2025-01-01 11:00:00'),
            ('550e8400-e29b-41d4-a716-446655440003', 15000, 'XOF', 'FREE', '{"phone": "+221772000003", "name": "Abdoulaye Ndiaye"}', '{"orderId": "SEN-003", "source": "mobile"}', 'processing', 'TRF-20250101-SEN003', 150, 15150, '2025-01-01 12:00:00', '2025-01-01 12:01:00'),
            ('550e8400-e29b-41d4-a716-446655440004', 75000, 'XOF', 'WAVE', '{"phone": "+221773000004", "name": "Aminata Ba"}', '{"orderId": "SEN-004", "source": "web"}', 'failed', 'TRF-20250101-SEN004', 750, 75750, '2025-01-01 13:00:00', '2025-01-01 13:05:00'),
            ('550e8400-e29b-41d4-a716-446655440005', 30000, 'XOF', 'OM', '{"phone": "+221774000005", "name": "Ibrahima Faye"}', '{"orderId": "SEN-005", "source": "mobile"}', 'cancelled', 'TRF-20250101-SEN005', 300, 30300, '2025-01-01 14:00:00', '2025-01-01 14:30:00')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_transfers_channel"`);
        await queryRunner.query(`DROP INDEX "IDX_transfers_status"`);
        await queryRunner.query(`DROP INDEX "IDX_transfers_reference"`);
        await queryRunner.query(`DELETE FROM "transfers" WHERE "reference" LIKE 'TRF-20250101-SEN%'`);
        await queryRunner.query(`DROP TABLE "transfers"`);
        await queryRunner.query(`DROP TYPE "transfer_status_enum"`);
    }

}
