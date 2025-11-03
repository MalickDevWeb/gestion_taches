import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
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

@Entity('transfers')
export class TransferEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Transfer ID' })
  id!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  @ApiProperty({ description: 'Transfer amount' })
  amount!: number;

  @Column({ length: 3, default: 'XOF' })
  @ApiProperty({ description: 'Currency code' })
  currency!: string;

  @Column({ length: 50 })
  @ApiProperty({ description: 'Transfer channel' })
  channel!: string;

  @Column('simple-json')
  @ApiProperty({ description: 'Recipient information' })
  recipient!: Recipient;

  @Column('simple-json', { nullable: true })
  @ApiProperty({ description: 'Additional metadata' })
  metadata!: Metadata;

  @Column({ type: 'varchar', default: TransferStatus.PENDING })
  @ApiProperty({ description: 'Transfer status', enum: TransferStatus })
  status!: TransferStatus;

  @Column({ unique: true, length: 100 })
  @ApiProperty({ description: 'Transfer reference' })
  reference!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  @ApiProperty({ description: 'Transfer fees' })
  fees!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  @ApiProperty({ description: 'Total amount including fees' })
  total!: number;

  @CreateDateColumn()
  @ApiProperty({ description: 'Creation timestamp' })
  createdAt!: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt!: Date;

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
    const entity = new TransferEntity();
    entity.id = id;
    entity.amount = amount;
    entity.currency = currency;
    entity.channel = channel;
    entity.recipient = recipient;
    entity.metadata = metadata;
    entity.status = status;
    entity.reference = reference;
    entity.fees = fees;
    entity.total = total;
    entity.createdAt = createdAt;
    entity.updatedAt = updatedAt;
    return entity;
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
