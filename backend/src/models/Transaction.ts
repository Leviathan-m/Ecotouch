import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Mission } from './Mission';
import { MissionType } from './Mission';

export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'mission_id', nullable: true })
  missionId: string;

  @Column({ type: 'enum', enum: ['carbon_offset', 'donation', 'petition'] })
  type: MissionType;

  @Column({ type: 'decimal', precision: 15, scale: 6 })
  amount: number;

  @Column({ default: 'KRW' })
  currency: 'KRW' | 'USD';

  @Column({ type: 'enum', enum: ['pending', 'processing', 'completed', 'failed', 'refunded'], default: 'pending' })
  status: TransactionStatus;

  @Column({ name: 'external_tx_id', nullable: true })
  externalTxId: string; // External API transaction ID

  @Column({ name: 'blockchain_tx_hash', nullable: true })
  blockchainTxHash: string;

  @Column({ name: 'gas_used', nullable: true })
  gasUsed: string;

  @Column({ name: 'gas_price', nullable: true })
  gasPrice: string;

  @Column({ name: 'fee_amount', type: 'decimal', precision: 15, scale: 6, nullable: true })
  feeAmount: number;

  @Column({ name: 'tax_deductible', default: false })
  taxDeductible: boolean;

  @Column({ name: 'receipt_issued', default: false })
  receiptIssued: boolean;

  @Column({ name: 'receipt_id', nullable: true })
  receiptId: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, user => user.transactions)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Mission, mission => mission.transactions, { nullable: true })
  @JoinColumn({ name: 'mission_id' })
  mission: Mission;

  // Methods
  markAsProcessing() {
    this.status = 'processing';
    this.addNote('Transaction moved to processing status');
  }

  markAsCompleted(txHash?: string) {
    this.status = 'completed';
    if (txHash) this.blockchainTxHash = txHash;
    this.addNote('Transaction completed successfully');
  }

  markAsFailed(reason?: string) {
    this.status = 'failed';
    this.addNote(`Transaction failed: ${reason || 'Unknown error'}`);
  }

  markAsRefunded() {
    this.status = 'refunded';
    this.addNote('Transaction refunded');
  }

  setExternalTransactionId(txId: string) {
    this.externalTxId = txId;
  }

  setBlockchainData(txHash: string, gasUsed?: string, gasPrice?: string) {
    this.blockchainTxHash = txHash;
    if (gasUsed) this.gasUsed = gasUsed;
    if (gasPrice) this.gasPrice = gasPrice;
  }

  setFee(feeAmount: number) {
    this.feeAmount = feeAmount;
  }

  markReceiptIssued(receiptId: string) {
    this.receiptIssued = true;
    this.receiptId = receiptId;
  }

  addNote(note: string) {
    if (!this.notes) {
      this.notes = note;
    } else {
      this.notes += `\n[${new Date().toISOString()}] ${note}`;
    }
  }

  // Computed properties
  get totalAmount(): number {
    return this.amount + (this.feeAmount || 0);
  }

  get isCompleted(): boolean {
    return this.status === 'completed';
  }

  get isFailed(): boolean {
    return this.status === 'failed';
  }

  get isPending(): boolean {
    return this.status === 'pending';
  }

  // Helper methods
  getTypeDisplayName(): string {
    switch (this.type) {
      case 'carbon_offset': return '탄소상쇄';
      case 'donation': return '기부';
      case 'petition': return '청원';
      default: return this.type;
    }
  }

  getStatusDisplayName(): string {
    switch (this.status) {
      case 'pending': return '대기중';
      case 'processing': return '처리중';
      case 'completed': return '완료됨';
      case 'failed': return '실패함';
      case 'refunded': return '환불됨';
      default: return this.status;
    }
  }

  // Validation
  validateAmount(): { valid: boolean; error?: string } {
    if (this.amount <= 0) {
      return { valid: false, error: 'Amount must be greater than 0' };
    }
    if (this.amount > 1000000) { // 1M limit for safety
      return { valid: false, error: 'Amount exceeds maximum limit' };
    }
    return { valid: true };
  }

  canRefund(): boolean {
    return ['pending', 'processing'].includes(this.status);
  }

  // Utility methods
  toJSON() {
    return {
      ...this,
      totalAmount: this.totalAmount,
      typeDisplayName: this.getTypeDisplayName(),
      statusDisplayName: this.getStatusDisplayName(),
    };
  }
}
