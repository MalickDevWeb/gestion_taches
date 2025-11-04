import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedSenegaleseTransfers1762213934984 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Insérer des données de seed sénégalaises supplémentaires
        await queryRunner.query(`
            INSERT INTO "transfers" ("id", "amount", "currency", "channel", "recipient", "metadata", "status", "reference", "fees", "total", "createdAt", "updatedAt") VALUES
            ('550e8400-e29b-41d4-a716-446655440006', 100000, 'XOF', 'WAVE', '{"phone": "+221775000006", "name": "Seynabou Diagne"}', '{"orderId": "SEN-006", "source": "mobile", "purpose": "paiement_marchand"}', 'completed', 'TRF-20250101-SEN006', 1000, 101000, '2025-01-01 15:00:00', '2025-01-01 15:02:00'),
            ('550e8400-e29b-41d4-a716-446655440007', 20000, 'XOF', 'OM', '{"phone": "+221776000007", "name": "Omar Ba"}', '{"orderId": "SEN-007", "source": "web", "purpose": "transfert_familial"}', 'pending', 'TRF-20250101-SEN007', 200, 20200, '2025-01-01 16:00:00', '2025-01-01 16:00:00'),
            ('550e8400-e29b-41d4-a716-446655440008', 45000, 'XOF', 'FREE', '{"phone": "+221777000008", "name": "Aissatou Faye"}', '{"orderId": "SEN-008", "source": "mobile", "purpose": "achat_credit"}', 'processing', 'TRF-20250101-SEN008', 450, 45450, '2025-01-01 17:00:00', '2025-01-01 17:01:00'),
            ('550e8400-e29b-41d4-a716-446655440009', 80000, 'XOF', 'WAVE', '{"phone": "+221778000009", "name": "Moustapha Sy"}', '{"orderId": "SEN-009", "source": "web", "purpose": "paiement_service"}', 'failed', 'TRF-20250101-SEN009', 800, 80800, '2025-01-01 18:00:00', '2025-01-01 18:10:00'),
            ('550e8400-e29b-41d4-a716-446655440010', 35000, 'XOF', 'OM', '{"phone": "+221779000010", "name": "Fatima Mbaye"}', '{"orderId": "SEN-010", "source": "mobile", "purpose": "achat_bien"}', 'cancelled', 'TRF-20250101-SEN010', 350, 35350, '2025-01-01 19:00:00', '2025-01-01 19:15:00'),
            ('550e8400-e29b-41d4-a716-446655440011', 60000, 'XOF', 'WAVE', '{"phone": "+221780000011", "name": "Cheikh Ndiaye"}', '{"orderId": "SEN-011", "source": "web", "purpose": "transfert_commercial"}', 'completed', 'TRF-20250101-SEN011', 600, 60600, '2025-01-01 20:00:00', '2025-01-01 20:03:00'),
            ('550e8400-e29b-41d4-a716-446655440012', 12000, 'XOF', 'FREE', '{"phone": "+221781000012", "name": "Mariama Diallo"}', '{"orderId": "SEN-012", "source": "mobile", "purpose": "achat_data"}', 'pending', 'TRF-20250101-SEN012', 120, 12120, '2025-01-01 21:00:00', '2025-01-01 21:00:00'),
            ('550e8400-e29b-41d4-a716-446655440013', 95000, 'XOF', 'OM', '{"phone": "+221782000013", "name": "Abdou Karim Thiam"}', '{"orderId": "SEN-013", "source": "web", "purpose": "paiement_loyer"}', 'processing', 'TRF-20250101-SEN013', 950, 95950, '2025-01-01 22:00:00', '2025-01-01 22:01:00'),
            ('550e8400-e29b-41d4-a716-446655440014', 18000, 'XOF', 'WAVE', '{"phone": "+221783000014", "name": "Ndeye Fatou Gueye"}', '{"orderId": "SEN-014", "source": "mobile", "purpose": "achat_credit_tel"}', 'failed', 'TRF-20250101-SEN014', 180, 18180, '2025-01-01 23:00:00', '2025-01-01 23:08:00'),
            ('550e8400-e29b-41d4-a716-446655440015', 250000, 'XOF', 'WAVE', '{"phone": "+221784000015", "name": "Papa Amadou Sow"}', '{"orderId": "SEN-015", "source": "web", "purpose": "gros_transfert"}', 'completed', 'TRF-20250101-SEN015', 2500, 252500, '2025-01-02 08:00:00', '2025-01-02 08:05:00')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Supprimer les données de seed
        await queryRunner.query(`DELETE FROM "transfers" WHERE "reference" LIKE 'TRF-20250101-SEN%' OR "reference" LIKE 'TRF-20250102-SEN%'`);
    }

}
