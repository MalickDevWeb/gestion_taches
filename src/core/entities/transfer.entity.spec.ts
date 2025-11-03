import { TransferEntity } from './transfer.entity';
import { TransferStatus } from './transfer-status.enum';

describe('TransferEntity', () => {
  let transfer: TransferEntity;

  beforeEach(() => {
    transfer = TransferEntity.create(
      '1',
      10000,
      'USD',
      'mobile',
      { phone: '+1234567890', name: 'John Doe' },
      {},
      TransferStatus.PENDING,
      'TRF-20231101-ABCD',
      100,
      10100,
      new Date(),
      new Date()
    );
  });

  describe('calculateFees', () => {
    it('should calculate fees correctly for small amounts (minimum fee)', () => {
      const smallTransfer = TransferEntity.create(
        '2',
        1000, // 1000 * 0.008 = 8, ceil to 8, but min 100
        'USD',
        'mobile',
        { phone: '+1234567890', name: 'John Doe' },
        {},
        TransferStatus.PENDING,
        'TRF-20231101-ABCD',
        0, // fees will be calculated
        0,
        new Date(),
        new Date()
      );

      expect(smallTransfer.calculateFees()).toBe(100);
    });

    it('should calculate fees correctly for normal amounts', () => {
      expect(transfer.calculateFees()).toBe(100); // 10000 * 0.008 = 80, ceil 80, min 100 = 100
    });

    it('should calculate fees correctly for large amounts (maximum fee)', () => {
      const largeTransfer = TransferEntity.create(
        '3',
        200000, // 200000 * 0.008 = 1600, ceil 1600, max 1500
        'USD',
        'mobile',
        { phone: '+1234567890', name: 'John Doe' },
        {},
        TransferStatus.PENDING,
        'TRF-20231101-ABCD',
        0,
        0,
        new Date(),
        new Date()
      );

      expect(largeTransfer.calculateFees()).toBe(1500);
    });

    it('should calculate fees correctly for very large amounts (capped at maximum)', () => {
      const veryLargeTransfer = TransferEntity.create(
        '4',
        300000, // 300000 * 0.008 = 2400, ceil 2400, max 1500
        'USD',
        'mobile',
        { phone: '+1234567890', name: 'John Doe' },
        {},
        TransferStatus.PENDING,
        'TRF-20231101-ABCD',
        0,
        0,
        new Date(),
        new Date()
      );

      expect(veryLargeTransfer.calculateFees()).toBe(1500);
    });

    it('should calculate fees correctly for amounts resulting in fractional fees', () => {
      const fractionalTransfer = TransferEntity.create(
        '5',
        1250, // 1250 * 0.008 = 10, ceil 10, min 100 = 100
        'USD',
        'mobile',
        { phone: '+1234567890', name: 'John Doe' },
        {},
        TransferStatus.PENDING,
        'TRF-20231101-ABCD',
        0,
        0,
        new Date(),
        new Date()
      );

      expect(fractionalTransfer.calculateFees()).toBe(100);
    });
  });

  describe('calculateTotal', () => {
    it('should calculate total correctly', () => {
      expect(transfer.calculateTotal()).toBe(10100); // amount + fees
    });
  });

  describe('canTransitionTo', () => {
    it('should allow valid transitions from PENDING', () => {
      expect(transfer.canTransitionTo(TransferStatus.PROCESSING)).toBe(true);
      expect(transfer.canTransitionTo(TransferStatus.CANCELLED)).toBe(true);
      expect(transfer.canTransitionTo(TransferStatus.COMPLETED)).toBe(false);
      expect(transfer.canTransitionTo(TransferStatus.FAILED)).toBe(false);
    });

    it('should allow valid transitions from PROCESSING', () => {
      transfer.setStatus(TransferStatus.PROCESSING);
      expect(transfer.canTransitionTo(TransferStatus.COMPLETED)).toBe(true);
      expect(transfer.canTransitionTo(TransferStatus.FAILED)).toBe(true);
      expect(transfer.canTransitionTo(TransferStatus.PENDING)).toBe(false);
      expect(transfer.canTransitionTo(TransferStatus.CANCELLED)).toBe(false);
    });

    it('should allow valid transitions from COMPLETED', () => {
      const completedTransfer = TransferEntity.create(
        '3',
        1000,
        'USD',
        'mobile',
        { phone: '+1234567890', name: 'John Doe' },
        {},
        TransferStatus.COMPLETED,
        'TRF-20231101-ABCD',
        100,
        1100,
        new Date(),
        new Date()
      );
      expect(completedTransfer.canTransitionTo(TransferStatus.PENDING)).toBe(false);
      expect(completedTransfer.canTransitionTo(TransferStatus.PROCESSING)).toBe(false);
      expect(completedTransfer.canTransitionTo(TransferStatus.FAILED)).toBe(false);
      expect(completedTransfer.canTransitionTo(TransferStatus.CANCELLED)).toBe(false);
    });

    it('should allow valid transitions from FAILED', () => {
      const failedTransfer = TransferEntity.create(
        '4',
        1000,
        'USD',
        'mobile',
        { phone: '+1234567890', name: 'John Doe' },
        {},
        TransferStatus.FAILED,
        'TRF-20231101-ABCD',
        100,
        1100,
        new Date(),
        new Date()
      );
      expect(failedTransfer.canTransitionTo(TransferStatus.PENDING)).toBe(true);
      expect(failedTransfer.canTransitionTo(TransferStatus.COMPLETED)).toBe(false);
      expect(failedTransfer.canTransitionTo(TransferStatus.PROCESSING)).toBe(false);
      expect(failedTransfer.canTransitionTo(TransferStatus.CANCELLED)).toBe(false);
    });

    it('should allow valid transitions from CANCELLED', () => {
      transfer.setStatus(TransferStatus.CANCELLED);
      expect(transfer.canTransitionTo(TransferStatus.PENDING)).toBe(false);
      expect(transfer.canTransitionTo(TransferStatus.PROCESSING)).toBe(false);
      expect(transfer.canTransitionTo(TransferStatus.COMPLETED)).toBe(false);
      expect(transfer.canTransitionTo(TransferStatus.FAILED)).toBe(false);
    });
  });

  describe('transitionTo', () => {
    it('should transition to valid status and update updatedAt', () => {
      const oldUpdatedAt = transfer.getUpdatedAt();
      // Add a small delay to ensure updatedAt changes
      setTimeout(() => {
        transfer.transitionTo(TransferStatus.PROCESSING);
        expect(transfer.getStatus()).toBe(TransferStatus.PROCESSING);
        expect(transfer.getUpdatedAt().getTime()).toBeGreaterThan(oldUpdatedAt.getTime());
      }, 1);
    });

    it('should throw error for invalid transition', () => {
      expect(() => transfer.transitionTo(TransferStatus.COMPLETED)).toThrow(
        'Invalid status transition from pending to completed'
      );
    });
  });

  describe('setAmount', () => {
    it('should update amount, recalculate fees and total, and update updatedAt', () => {
      const oldUpdatedAt = transfer.getUpdatedAt();
      // Add a small delay to ensure updatedAt changes
      setTimeout(() => {
        transfer.setAmount(20000);
        expect(transfer.getAmount()).toBe(20000);
        expect(transfer.getFees()).toBe(160); // 20000 * 0.008 = 160, ceil 160
        expect(transfer.getTotal()).toBe(20160);
        expect(transfer.getUpdatedAt().getTime()).toBeGreaterThan(oldUpdatedAt.getTime());
      }, 1);
    });
  });

  describe('setStatus', () => {
    it('should set status using transitionTo', () => {
      transfer.setStatus(TransferStatus.PROCESSING);
      expect(transfer.getStatus()).toBe(TransferStatus.PROCESSING);
    });

    it('should throw error for invalid status set', () => {
      expect(() => transfer.setStatus(TransferStatus.COMPLETED)).toThrow(
        'Invalid status transition from pending to completed'
      );
    });
  });
});
