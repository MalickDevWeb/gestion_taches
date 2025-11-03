import { ApiProperty } from '@nestjs/swagger';
import { TransferStatus } from './transfer-status.enum';
import { FeeConstants } from '../constants/fee-constants.enum';

interface Recipient {
  phone: string;
  name: string;
}

interface Metadata {
  [key: string]: any;
}

export class TransferEntity {
  constructor(
    private id: string,
    private amount: number,
    private currency: string,
    private channel: string,
    private recipient: Recipient,
    private metadata: Metadata,
    private status: TransferStatus,
    private reference: string,
    private fees: number,
    private total: number,
    private createdAt: Date,
    private updatedAt: Date
  ) {}

  static create(
    id: string,
    amount: number,
    currency: string,
    channel: string,
    recipient: Recipient,
    metadata: Metadata,
    status: TransferStatus,
    reference: string,
    fees: number,
    total: number,
    createdAt: Date,
    updatedAt: Date
  ): TransferEntity {
    return new TransferEntity(
      id,
      amount,
      currency,
      channel,
      recipient,
      metadata,
      status,
      reference,
      fees,
      total,
      createdAt,
      updatedAt
    );
  }

  // Getters
  getId(): string {
    return this.id;
  }

  getAmount(): number {
    return this.amount;
  }

  getCurrency(): string {
    return this.currency;
  }

  getChannel(): string {
    return this.channel;
  }

  getRecipient(): Recipient {
    return this.recipient;
  }

  getMetadata(): Metadata {
    return this.metadata;
  }

  getStatus(): TransferStatus {
    return this.status;
  }

  getReference(): string {
    return this.reference;
  }

  getFees(): number {
    return this.fees;
  }

  getTotal(): number {
    return this.total;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // Business logic methods
  calculateFees(): number {
    const fee = Math.ceil(this.amount * FeeConstants.FEE_PERCENTAGE);
    return Math.min(Math.max(fee, FeeConstants.MIN_FEE), FeeConstants.MAX_FEE);
  }

  calculateTotal(): number {
    return this.amount + this.fees;
  }

  canTransitionTo(newStatus: TransferStatus): boolean {
    const validTransitions: Record<TransferStatus, TransferStatus[]> = {
      [TransferStatus.PENDING]: [TransferStatus.PROCESSING, TransferStatus.CANCELLED],
      [TransferStatus.PROCESSING]: [TransferStatus.COMPLETED, TransferStatus.FAILED],
      [TransferStatus.COMPLETED]: [],
      [TransferStatus.FAILED]: [TransferStatus.PENDING],
      [TransferStatus.CANCELLED]: [],
    };

    return validTransitions[this.status].includes(newStatus);
  }

  transitionTo(newStatus: TransferStatus): void {
    if (!this.canTransitionTo(newStatus)) {
      throw new Error(`Invalid status transition from ${this.status} to ${newStatus}`);
    }
    this.status = newStatus;
    this.updatedAt = new Date();
  }

  // Setters for updates
  setAmount(amount: number): void {
    this.amount = amount;
    this.fees = this.calculateFees();
    this.total = this.calculateTotal();
    this.updatedAt = new Date();
  }

  setStatus(status: TransferStatus): void {
    this.transitionTo(status);
  }
}
