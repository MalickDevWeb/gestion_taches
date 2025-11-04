import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransferEntity } from '../../core/entities/transfer.entity';
import { TransferStatus } from '../../core/entities/transfer-status.enum';
import { TransferStatusFilter } from '../../core/entities/transfer-status-filter.enum';
import {
  ITransfersRepository,
  TransferFilters,
  PaginationOptions,
  PaginatedTransfers,
  CursorPaginationOptions,
  CursorPaginatedTransfers,
} from '../../core/interfaces/transfers-repository.interface';

@Injectable()
export class TransfersRepository implements ITransfersRepository {
  constructor(
    @InjectRepository(TransferEntity)
    private transferRepository: Repository<TransferEntity>,
  ) {}

  async create(transfer: TransferEntity): Promise<TransferEntity> {
    const newTransfer = this.transferRepository.create({
      amount: transfer.getAmount(),
      currency: transfer.getCurrency(),
      channel: transfer.getChannel(),
      recipient: transfer.getRecipient(),
      metadata: transfer.getMetadata(),
      status: transfer.getStatus(),
      reference: transfer.getReference(),
      fees: transfer.getFees(),
      total: transfer.getTotal(),
      createdAt: transfer.getCreatedAt(),
      updatedAt: transfer.getUpdatedAt(),
    });
    return await this.transferRepository.save(newTransfer);
  }

  async findById(id: string): Promise<TransferEntity | null> {
    return await this.transferRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<TransferEntity[]> {
    return await this.transferRepository.find();
  }

  async findWithPagination(options: PaginationOptions): Promise<PaginatedTransfers> {
    const [data, total] = await this.transferRepository.findAndCount({
      skip: (options.page - 1) * options.limit,
      take: options.limit,
    });

    const totalPages = Math.ceil(total / options.limit);

    return {
      data,
      total,
      page: options.page,
      limit: options.limit,
      totalPages,
    };
  }

  async findWithFilters(filters: TransferFilters): Promise<TransferEntity[]> {
    const queryBuilder = this.transferRepository.createQueryBuilder('transfer');

    if (filters.status) {
      queryBuilder.andWhere('transfer.status = :status', { status: filters.status });
    }
    if (filters.minAmount) {
      queryBuilder.andWhere('transfer.amount >= :minAmount', { minAmount: filters.minAmount });
    }
    if (filters.maxAmount) {
      queryBuilder.andWhere('transfer.amount <= :maxAmount', { maxAmount: filters.maxAmount });
    }
    if (filters.createdAfter) {
      queryBuilder.andWhere('transfer.createdAt >= :createdAfter', { createdAfter: filters.createdAfter });
    }
    if (filters.createdBefore) {
      queryBuilder.andWhere('transfer.createdAt <= :createdBefore', { createdBefore: filters.createdBefore });
    }
    if (filters.currency) {
      queryBuilder.andWhere('transfer.currency = :currency', { currency: filters.currency });
    }
    if (filters.channel) {
      queryBuilder.andWhere('transfer.channel = :channel', { channel: filters.channel });
    }
    if (filters.reference) {
      queryBuilder.andWhere('transfer.reference = :reference', { reference: filters.reference });
    }

    return await queryBuilder.getMany();
  }

  async findWithFiltersAndPagination(
    filters: TransferFilters,
    options: PaginationOptions
  ): Promise<PaginatedTransfers> {
    const queryBuilder = this.transferRepository.createQueryBuilder('transfer');

    if (filters.status) {
      queryBuilder.andWhere('transfer.status = :status', { status: filters.status });
    }
    if (filters.minAmount) {
      queryBuilder.andWhere('transfer.amount >= :minAmount', { minAmount: filters.minAmount });
    }
    if (filters.maxAmount) {
      queryBuilder.andWhere('transfer.amount <= :maxAmount', { maxAmount: filters.maxAmount });
    }
    if (filters.createdAfter) {
      queryBuilder.andWhere('transfer.createdAt >= :createdAfter', { createdAfter: filters.createdAfter });
    }
    if (filters.createdBefore) {
      queryBuilder.andWhere('transfer.createdAt <= :createdBefore', { createdBefore: filters.createdBefore });
    }
    if (filters.currency) {
      queryBuilder.andWhere('transfer.currency = :currency', { currency: filters.currency });
    }
    if (filters.channel) {
      queryBuilder.andWhere('transfer.channel = :channel', { channel: filters.channel });
    }
    if (filters.reference) {
      queryBuilder.andWhere('transfer.reference = :reference', { reference: filters.reference });
    }

    const [data, total] = await queryBuilder
      .skip((options.page - 1) * options.limit)
      .take(options.limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / options.limit);

    return {
      data,
      total,
      page: options.page,
      limit: options.limit,
      totalPages,
    };
  }

  async findWithCursorPagination(options: CursorPaginationOptions): Promise<CursorPaginatedTransfers> {
    const queryBuilder = this.transferRepository.createQueryBuilder('transfer');

    if (options.cursor) {
      queryBuilder.andWhere('transfer.id > :cursor', { cursor: options.cursor });
    }

    queryBuilder.orderBy('transfer.id', 'ASC').limit(options.limit + 1);

    const transfers = await queryBuilder.getMany();
    const hasNextPage = transfers.length > options.limit;
    const data = hasNextPage ? transfers.slice(0, options.limit) : transfers;
    const nextCursor = hasNextPage && data.length > 0 ? data[data.length - 1].id : undefined;

    return {
      data,
      hasNextPage,
      nextCursor,
    };
  }

  async findWithFiltersAndCursorPagination(
    filters: TransferFilters,
    options: CursorPaginationOptions
  ): Promise<CursorPaginatedTransfers> {
    const queryBuilder = this.transferRepository.createQueryBuilder('transfer');

    if (filters.status) {
      queryBuilder.andWhere('transfer.status = :status', { status: filters.status });
    }
    if (filters.minAmount) {
      queryBuilder.andWhere('transfer.amount >= :minAmount', { minAmount: filters.minAmount });
    }
    if (filters.maxAmount) {
      queryBuilder.andWhere('transfer.amount <= :maxAmount', { maxAmount: filters.maxAmount });
    }
    if (filters.createdAfter) {
      queryBuilder.andWhere('transfer.createdAt >= :createdAfter', { createdAfter: filters.createdAfter });
    }
    if (filters.createdBefore) {
      queryBuilder.andWhere('transfer.createdAt <= :createdBefore', { createdBefore: filters.createdBefore });
    }
    if (filters.currency) {
      queryBuilder.andWhere('transfer.currency = :currency', { currency: filters.currency });
    }
    if (filters.channel) {
      queryBuilder.andWhere('transfer.channel = :channel', { channel: filters.channel });
    }
    if (filters.reference) {
      queryBuilder.andWhere('transfer.reference = :reference', { reference: filters.reference });
    }
    if (filters.q) {
      queryBuilder.andWhere(
        '(transfer.reference ILIKE :q OR transfer.recipient->>\'name\' ILIKE :q)',
        { q: `%${filters.q}%` }
      );
    }

    if (options.cursor) {
      queryBuilder.andWhere('transfer.id > :cursor', { cursor: options.cursor });
    }

    queryBuilder.orderBy('transfer.id', 'ASC').limit(options.limit + 1);

    const transfers = await queryBuilder.getMany();
    const hasNextPage = transfers.length > options.limit;
    const data = hasNextPage ? transfers.slice(0, options.limit) : transfers;
    const nextCursor = hasNextPage && data.length > 0 ? data[data.length - 1].id : undefined;

    return {
      data,
      hasNextPage,
      nextCursor,
    };
  }

  async update(id: string, updateData: Partial<TransferEntity>): Promise<TransferEntity | null> {
    const transfer = await this.findById(id);
    if (!transfer) {
      return null;
    }

    if (updateData.amount !== undefined) {
      transfer.amount = updateData.amount;
    }
    if (updateData.status !== undefined) {
      transfer.status = updateData.status;
    }
    if (updateData.updatedAt !== undefined) {
      transfer.updatedAt = updateData.updatedAt;
    }

    return await this.transferRepository.save(transfer);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.transferRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
