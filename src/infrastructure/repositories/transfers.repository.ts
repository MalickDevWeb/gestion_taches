import { Injectable } from '@nestjs/common';
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
  private transfers = new Map<string, TransferEntity>();
  private nextId = 1;

  async create(transfer: TransferEntity): Promise<TransferEntity> {
    const id = (this.nextId++).toString();
    const newTransfer = TransferEntity.create(
      id,
      transfer.getAmount(),
      transfer.getCurrency(),
      transfer.getChannel(),
      transfer.getRecipient(),
      transfer.getMetadata(),
      transfer.getStatus(),
      transfer.getReference(),
      transfer.getFees(),
      transfer.getTotal(),
      transfer.getCreatedAt(),
      transfer.getUpdatedAt()
    );
    this.transfers.set(id, newTransfer);
    return newTransfer;
  }

  async findById(id: string): Promise<TransferEntity | null> {
    return this.transfers.get(id) || null;
  }

  async findAll(): Promise<TransferEntity[]> {
    return Array.from(this.transfers.values());
  }

  async findWithPagination(options: PaginationOptions): Promise<PaginatedTransfers> {
    const allTransfers = Array.from(this.transfers.values());
    const total = allTransfers.length;
    const totalPages = Math.ceil(total / options.limit);
    const startIndex = (options.page - 1) * options.limit;
    const endIndex = startIndex + options.limit;
    const data = allTransfers.slice(startIndex, endIndex);

    return {
      data,
      total,
      page: options.page,
      limit: options.limit,
      totalPages,
    };
  }

  async findWithFilters(filters: TransferFilters): Promise<TransferEntity[]> {
    const allTransfers = Array.from(this.transfers.values());
    return allTransfers.filter((transfer) => {
      if (filters.status && transfer.getStatus() !== (filters.status as unknown as TransferStatus)) {
        return false;
      }
      if (filters.minAmount && transfer.getAmount() < filters.minAmount) {
        return false;
      }
      if (filters.maxAmount && transfer.getAmount() > filters.maxAmount) {
        return false;
      }
      if (filters.createdAfter && transfer.getCreatedAt() < filters.createdAfter) {
        return false;
      }
      if (filters.createdBefore && transfer.getCreatedAt() > filters.createdBefore) {
        return false;
      }
      if (filters.currency && transfer.getCurrency() !== filters.currency) {
        return false;
      }
      if (filters.channel && transfer.getChannel() !== filters.channel) {
        return false;
      }
      if (filters.reference && transfer.getReference() !== filters.reference) {
        return false;
      }
      return true;
    });
  }

  async findWithFiltersAndPagination(
    filters: TransferFilters,
    options: PaginationOptions
  ): Promise<PaginatedTransfers> {
    const filteredTransfers = await this.findWithFilters(filters);
    const total = filteredTransfers.length;
    const totalPages = Math.ceil(total / options.limit);
    const startIndex = (options.page - 1) * options.limit;
    const endIndex = startIndex + options.limit;
    const data = filteredTransfers.slice(startIndex, endIndex);

    return {
      data,
      total,
      page: options.page,
      limit: options.limit,
      totalPages,
    };
  }

  async findWithCursorPagination(options: CursorPaginationOptions): Promise<CursorPaginatedTransfers> {
    const allTransfers = Array.from(this.transfers.values()).sort((a, b) =>
      a.getId().localeCompare(b.getId())
    );

    let startIndex = 0;
    if (options.cursor) {
      const cursorIndex = allTransfers.findIndex(t => t.getId() === options.cursor);
      if (cursorIndex !== -1) {
        startIndex = cursorIndex + 1;
      }
    }

    const endIndex = startIndex + options.limit;
    const data = allTransfers.slice(startIndex, endIndex);
    const hasNextPage = endIndex < allTransfers.length;
    const nextCursor = hasNextPage && data.length > 0 ? data[data.length - 1].getId() : undefined;

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
    const filteredTransfers = await this.findWithFilters(filters);
    const sortedTransfers = filteredTransfers.sort((a, b) =>
      a.getId().localeCompare(b.getId())
    );

    let startIndex = 0;
    if (options.cursor) {
      const cursorIndex = sortedTransfers.findIndex(t => t.getId() === options.cursor);
      if (cursorIndex !== -1) {
        startIndex = cursorIndex + 1;
      }
    }

    const endIndex = startIndex + options.limit;
    const data = sortedTransfers.slice(startIndex, endIndex);
    const hasNextPage = endIndex < sortedTransfers.length;
    const nextCursor = hasNextPage && data.length > 0 ? data[data.length - 1].getId() : undefined;

    return {
      data,
      hasNextPage,
      nextCursor,
    };
  }

  async update(id: string, updateData: Partial<TransferEntity>): Promise<TransferEntity | null> {
    const transfer = this.transfers.get(id);
    if (!transfer) {
      return null;
    }

    if (updateData.getAmount !== undefined) {
      transfer.setAmount(updateData.getAmount());
    }
    if (updateData.getStatus !== undefined) {
      transfer.setStatus(updateData.getStatus());
    }

    this.transfers.set(id, transfer);
    return transfer;
  }

  async delete(id: string): Promise<boolean> {
    return this.transfers.delete(id);
  }
}
