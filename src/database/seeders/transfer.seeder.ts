import { DataSource } from 'typeorm';
import { TransferEntity } from '../../core/entities/transfer.entity';
import { TransferStatus } from '../../core/entities/transfer-status.enum';
import { randomUUID } from 'crypto';

export class TransferSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    const transferRepository = this.dataSource.getRepository(TransferEntity);
    const userRepository = this.dataSource.getRepository('UserEntity');

    // Get existing users
    const users = await userRepository.find({ take: 5 });
    if (users.length === 0) {
      console.log('No users found. Please run user seeder first.');
      return;
    }

    const senegaleseTransfers = [
      {
        amount: 50000,
        currency: 'XOF',
        channel: 'MOBILE_MONEY',
        recipient: {
          phone: '+221771234567',
          name: 'Mamadou Diop'
        },
        reference: `TXN-${randomUUID().substring(0, 8).toUpperCase()}`,
        status: TransferStatus.COMPLETED,
      },
      {
        amount: 25000,
        currency: 'XOF',
        channel: 'BANK_TRANSFER',
        recipient: {
          phone: '+221782345678',
          name: 'Fatou Sow'
        },
        reference: `TXN-${randomUUID().substring(0, 8).toUpperCase()}`,
        status: TransferStatus.PROCESSING,
      },
      {
        amount: 100000,
        currency: 'XOF',
        channel: 'MOBILE_MONEY',
        recipient: {
          phone: '+221763456789',
          name: 'Abdoulaye Ndiaye'
        },
        reference: `TXN-${randomUUID().substring(0, 8).toUpperCase()}`,
        status: TransferStatus.COMPLETED,
      },
      {
        amount: 75000,
        currency: 'XOF',
        channel: 'CASH_PICKUP',
        recipient: {
          phone: '+221774567890',
          name: 'Aminata Ba'
        },
        reference: `TXN-${randomUUID().substring(0, 8).toUpperCase()}`,
        status: TransferStatus.PENDING,
      },
      {
        amount: 30000,
        currency: 'XOF',
        channel: 'MOBILE_MONEY',
        recipient: {
          phone: '+221785678901',
          name: 'Ibrahima Faye'
        },
        reference: `TXN-${randomUUID().substring(0, 8).toUpperCase()}`,
        status: TransferStatus.FAILED,
      },
      {
        amount: 150000,
        currency: 'XOF',
        channel: 'BANK_TRANSFER',
        recipient: {
          phone: '+221796789012',
          name: 'Mariama Diallo'
        },
        reference: `TXN-${randomUUID().substring(0, 8).toUpperCase()}`,
        status: TransferStatus.COMPLETED,
      },
      {
        amount: 45000,
        currency: 'XOF',
        channel: 'MOBILE_MONEY',
        recipient: {
          phone: '+221707890123',
          name: 'Ousmane Sy'
        },
        reference: `TXN-${randomUUID().substring(0, 8).toUpperCase()}`,
        status: TransferStatus.PROCESSING,
      },
      {
        amount: 80000,
        currency: 'XOF',
        channel: 'CASH_PICKUP',
        recipient: {
          phone: '+221718901234',
          name: 'Khadija Mbaye'
        },
        reference: `TXN-${randomUUID().substring(0, 8).toUpperCase()}`,
        status: TransferStatus.CANCELLED,
      },
      {
        amount: 60000,
        currency: 'XOF',
        channel: 'BANK_TRANSFER',
        recipient: {
          phone: '+221729012345',
          name: 'Cheikh Gueye'
        },
        reference: `TXN-${randomUUID().substring(0, 8).toUpperCase()}`,
        status: TransferStatus.COMPLETED,
      },
      {
        amount: 35000,
        currency: 'XOF',
        channel: 'MOBILE_MONEY',
        recipient: {
          phone: '+221731234567',
          name: 'Ndeye Fatou Thiam'
        },
        reference: `TXN-${randomUUID().substring(0, 8).toUpperCase()}`,
        status: TransferStatus.PENDING,
      },
    ];

    for (const transferData of senegaleseTransfers) {
      const existingTransfer = await transferRepository.findOne({
        where: { reference: transferData.reference }
      });

      if (!existingTransfer) {
        // Calculate fees (example: 2% of amount, min 500 XOF, max 5000 XOF)
        const feeAmount = Math.min(Math.max(transferData.amount * 0.02, 500), 5000);
        const total = transferData.amount + feeAmount;

        const transfer = transferRepository.create({
          id: randomUUID(),
          ...transferData,
          fees: feeAmount,
          total,
          metadata: {
            country: 'Senegal',
            region: 'Dakar',
            purpose: 'Family support'
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        await transferRepository.save(transfer);
        console.log(`Created transfer: ${transfer.reference} - ${transfer.amount} XOF`);
      }
    }
  }
}
