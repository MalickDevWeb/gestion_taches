import { Test, TestingModule } from '@nestjs/testing';
import { TransfersService } from './transfers.service';
import { TransferEntity } from '../../core/entities/transfer.entity';
import { TransferStatus } from '../../core/entities/transfer-status.enum';
import { TransferStatusFilter } from '../../core/entities/transfer-status-filter.enum';
import { ITransfersRepository } from '../../core/interfaces/transfers-repository.interface';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { UpdateTransferDto } from './dto/update-transfer.dto';
import { AuditService } from './audit.service';

describe('TransfersService', () => {
  let service: TransfersService;
  let mockRepository: jest.Mocked<ITransfersRepository>;

  beforeEach(async () => {
    const mockTransfersRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      findWithFiltersAndCursorPagination: jest.fn(),
    };

    const mockQueue = {
      add: jest.fn(),
    };

    const mockAuditService = {
      log: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransfersService,
        {
          provide: 'ITransfersRepository',
          useValue: mockTransfersRepository,
        },
        {
          provide: 'BullQueue_transfer-processing',
          useValue: mockQueue,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    service = module.get<TransfersService>(TransfersService);
    mockRepository = module.get('ITransfersRepository');
  });

  it('should calculate fees correctly for transfer creation', async () => {
    const createTransferDto: CreateTransferDto = {
      amount: 10000,
      currency: 'USD',
      channel: 'mobile',
      recipient: { phone: '+1234567890', name: 'John Doe' },
      metadata: {},
    };

    const expectedFees = Math.min(Math.max(Math.ceil(10000 * 0.008), 100), 1500); // 80, but min 100 = 100
    const expectedTotal = 10000 + expectedFees;

    const mockTransfer = TransferEntity.create(
      'test-id',
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
    mockRepository.create.mockResolvedValue(mockTransfer);

    await service.create(createTransferDto);

    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        getFees: expect.any(Function),
        getTotal: expect.any(Function),
      })
    );

    // Since we can't directly access private methods, we test through the create call
    // The fees should be calculated as per business logic
    const callArgs = mockRepository.create.mock.calls[0][0];
    expect(callArgs.getFees()).toBe(expectedFees);
    expect(callArgs.getTotal()).toBe(expectedTotal);
  });

  it('should handle status transitions correctly in updateStatus', async () => {
    const transfer = TransferEntity.create(
      '1',
      1000,
      'USD',
      'mobile',
      { phone: '+1234567890', name: 'John Doe' },
      {},
      TransferStatus.PENDING,
      'TRF-20231101-ABCD',
      100,
      1100,
      new Date(),
      new Date()
    );

    const updateTransferDto: UpdateTransferDto = {
      status: TransferStatus.PROCESSING,
    };

    mockRepository.findById.mockResolvedValue(transfer);
    mockRepository.update.mockResolvedValue(transfer);

    const result = await service.updateStatus('1', updateTransferDto);

    expect(result.getStatus()).toBe(TransferStatus.PROCESSING);
    expect(mockRepository.update).toHaveBeenCalledWith('1', transfer);
  });

  describe('processTransfer', () => {
    let pendingTransfer: TransferEntity;

    beforeEach(() => {
      pendingTransfer = TransferEntity.create(
        '1',
        1000,
        'USD',
        'mobile',
        { phone: '+1234567890', name: 'John Doe' },
        {},
        TransferStatus.PENDING,
        'TRF-20231101-ABCD',
        100,
        1100,
        new Date(),
        new Date()
      );
    });

    it('should throw error if transfer is not pending', async () => {
      const processingTransfer = TransferEntity.create(
        '2',
        1000,
        'USD',
        'mobile',
        { phone: '+1234567890', name: 'John Doe' },
        {},
        TransferStatus.PROCESSING,
        'TRF-20231101-ABCD',
        100,
        1100,
        new Date(),
        new Date()
      );

      mockRepository.findById.mockResolvedValue(processingTransfer);

      await expect(service.processTransfer('2')).rejects.toThrow(
        'Transfer is not in a processable state'
      );
    });

    it('should set status to PROCESSING immediately', async () => {
      mockRepository.findById.mockResolvedValue(pendingTransfer);
      mockRepository.update.mockResolvedValue(pendingTransfer);

      await service.processTransfer('1');

      expect(mockRepository.update).toHaveBeenCalledWith('1', pendingTransfer);
      expect(pendingTransfer.getStatus()).toBe(TransferStatus.PROCESSING);
    });

    it('should simulate successful processing (70% chance)', async () => {
      // Mock Math.random to return 0.2 (success since 0.2 < 0.3)
      jest.spyOn(Math, 'random').mockReturnValue(0.2);

      mockRepository.findById.mockResolvedValue(pendingTransfer);
      mockRepository.update.mockResolvedValue(pendingTransfer);

      await service.processTransfer('1');

      // Wait for the timeout to complete
      await new Promise(resolve => setTimeout(resolve, 2100));

      expect(pendingTransfer.getStatus()).toBe(TransferStatus.COMPLETED);
      expect(mockRepository.update).toHaveBeenCalledTimes(2); // Initial update + final update

      // Restore Math.random
      jest.restoreAllMocks();
    });

    it('should simulate failed processing (30% chance)', async () => {
      // Mock Math.random to return 0.5 (failure since 0.5 > 0.3)
      jest.spyOn(Math, 'random').mockReturnValue(0.5);

      mockRepository.findById.mockResolvedValue(pendingTransfer);
      mockRepository.update.mockResolvedValue(pendingTransfer);

      await service.processTransfer('1');

      // Wait for the timeout to complete
      await new Promise(resolve => setTimeout(resolve, 2100));

      expect(pendingTransfer.getStatus()).toBe(TransferStatus.FAILED);
      expect(mockRepository.update).toHaveBeenCalledTimes(2); // Initial update + final update

      // Restore Math.random
      jest.restoreAllMocks();
    });

    it('should calculate fees correctly', () => {
      // Test fee calculation directly
      const serviceInstance = service as any; // Access private method for testing
      expect(serviceInstance.calculateFees(10000)).toBe(100); // 10000 * 0.008 = 80, ceil to 80, min 100 = 100
      expect(serviceInstance.calculateFees(100000)).toBe(800); // 100000 * 0.008 = 800
      expect(serviceInstance.calculateFees(200000)).toBe(1500); // 200000 * 0.008 = 1600, max 1500 = 1500
    });
  });

  describe('findById', () => {
    it('should return transfer if found', async () => {
      const transfer = TransferEntity.create(
        '1',
        1000,
        'USD',
        'mobile',
        { phone: '+1234567890', name: 'John Doe' },
        {},
        TransferStatus.PENDING,
        'TRF-20231101-ABCD',
        100,
        1100,
        new Date(),
        new Date()
      );

      mockRepository.findById.mockResolvedValue(transfer);

      const result = await service.findById('1');

      expect(result).toBe(transfer);
      expect(mockRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if transfer not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findById('1')).rejects.toThrow(
        'Transfer with ID 1 not found'
      );
    });
  });

  describe('findAll', () => {
    it('should call repository with correct filters and options', async () => {
      const query = {
        status: TransferStatusFilter.PENDING,
        minAmount: 100,
        maxAmount: 1000,
        createdAfter: '2023-11-01',
        createdBefore: '2023-11-30',
        currency: 'USD',
        channel: 'mobile',
        reference: 'TRF-20231101',
        cursor: 'cursor123',
        limit: 20,
      };

      const mockResult = { data: [], hasNextPage: false };
      mockRepository.findWithFiltersAndCursorPagination.mockResolvedValue(mockResult);

      const result = await service.findAll(query);

      expect(result).toBe(mockResult);
      expect(mockRepository.findWithFiltersAndCursorPagination).toHaveBeenCalledWith(
        {
          status: TransferStatusFilter.PENDING,
          minAmount: 100,
          maxAmount: 1000,
          createdAfter: new Date('2023-11-01'),
          createdBefore: new Date('2023-11-30'),
          currency: 'USD',
          channel: 'mobile',
          reference: 'TRF-20231101',
        },
        {
          cursor: 'cursor123',
          limit: 20,
        }
      );
    });

    it('should use default limit of 10 when not provided', async () => {
      const query = {};
      const mockResult = { data: [], hasNextPage: false };
      mockRepository.findWithFiltersAndCursorPagination.mockResolvedValue(mockResult);

      await service.findAll(query);

      expect(mockRepository.findWithFiltersAndCursorPagination).toHaveBeenCalledWith(
        {},
        {
          cursor: undefined,
          limit: 10,
        }
      );
    });
  });

  describe('updateStatus', () => {
    it('should update status successfully', async () => {
      const transfer = TransferEntity.create(
        '1',
        1000,
        'USD',
        'mobile',
        { phone: '+1234567890', name: 'John Doe' },
        {},
        TransferStatus.PENDING,
        'TRF-20231101-ABCD',
        100,
        1100,
        new Date(),
        new Date()
      );

      const updateDto: UpdateTransferDto = {
        status: TransferStatus.PROCESSING,
      };

      mockRepository.findById.mockResolvedValue(transfer);
      mockRepository.update.mockResolvedValue(transfer);

      const result = await service.updateStatus('1', updateDto);

      expect(result).toBe(transfer);
      expect(transfer.getStatus()).toBe(TransferStatus.PROCESSING);
      expect(mockRepository.update).toHaveBeenCalledWith('1', transfer);
    });

    it('should update amount and recalculate fees and total', async () => {
      const transfer = TransferEntity.create(
        '1',
        1000,
        'USD',
        'mobile',
        { phone: '+1234567890', name: 'John Doe' },
        {},
        TransferStatus.PENDING,
        'TRF-20231101-ABCD',
        100,
        1100,
        new Date(),
        new Date()
      );

      const updateDto: UpdateTransferDto = {
        amount: 2000,
      };

      mockRepository.findById.mockResolvedValue(transfer);
      mockRepository.update.mockResolvedValue(transfer);

      const result = await service.updateStatus('1', updateDto);

      expect(result).toBe(transfer);
      expect(transfer.getAmount()).toBe(2000);
      expect(transfer.getFees()).toBe(100); // 2000 * 0.008 = 16, ceil 16, min 100 = 100
      expect(transfer.getTotal()).toBe(2100);
      expect(mockRepository.update).toHaveBeenCalledWith('1', transfer);
    });

    it('should throw NotFoundException if transfer not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.updateStatus('1', {})).rejects.toThrow(
        'Transfer with ID 1 not found'
      );
    });
  });
});
