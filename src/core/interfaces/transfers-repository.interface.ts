import { TransferEntity } from '../entities/transfer.entity';
import { TransferStatusFilter } from '../entities/transfer-status-filter.enum';

export interface TransferFilters {
  fromUserId?: number;
  toUserId?: number;
  status?: TransferStatusFilter;
  minAmount?: number;
  maxAmount?: number;
  createdAfter?: Date;
  createdBefore?: Date;
  currency?: string;
  channel?: string;
  reference?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface CursorPaginationOptions {
  cursor?: string;
  limit: number;
}

export interface PaginatedTransfers {
  data: TransferEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CursorPaginatedTransfers {
  data: TransferEntity[];
  hasNextPage: boolean;
  nextCursor?: string;
}

export interface ITransfersRepository {
  create(transfer: TransferEntity): Promise<TransferEntity>;
  findById(id: string): Promise<TransferEntity | null>;
  findAll(): Promise<TransferEntity[]>;
  findWithPagination(options: PaginationOptions): Promise<PaginatedTransfers>;
  findWithCursorPagination(options: CursorPaginationOptions): Promise<CursorPaginatedTransfers>;
  findWithFilters(filters: TransferFilters): Promise<TransferEntity[]>;
  findWithFiltersAndPagination(
    filters: TransferFilters,
    options: PaginationOptions
  ): Promise<PaginatedTransfers>;
  findWithFiltersAndCursorPagination(
    filters: TransferFilters,
    options: CursorPaginationOptions
  ): Promise<CursorPaginatedTransfers>;
  update(id: string, transfer: Partial<TransferEntity>): Promise<TransferEntity | null>;
  delete(id: string): Promise<boolean>;
}
