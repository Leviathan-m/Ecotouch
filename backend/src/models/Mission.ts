import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './User';
import { Transaction } from './Transaction';

export type MissionType = 'carbon_offset' | 'donation' | 'petition';
export type MissionStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

@Entity('missions')
export class Mission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ type: 'enum', enum: ['carbon_offset', 'donation', 'petition'] })
  type: MissionType;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'int', default: 0 })
  impact: number; // Impact score (0-100)

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  cost: number;

  @Column({ default: 'KRW' })
  currency: 'KRW' | 'USD';

  @Column({ type: 'enum', enum: ['pending', 'in_progress', 'completed', 'failed'], default: 'pending' })
  status: MissionStatus;

  @Column({ name: 'external_api_id', nullable: true })
  externalApiId: string; // ID from external APIs (Cloverly, 1ClickImpact, etc.)

  @Column({ name: 'external_transaction_id', nullable: true })
  externalTransactionId: string;

  @Column({ name: 'blockchain_tx_hash', nullable: true })
  blockchainTxHash: string;

  @Column({ name: 'sbt_token_id', nullable: true })
  sbtTokenId: string;

  @Column({ name: 'receipt_id', nullable: true })
  receiptId: string;

  @Column({ name: 'started_at', nullable: true })
  startedAt: Date;

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date;

  @Column({ name: 'failed_at', nullable: true })
  failedAt: Date;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>; // Store additional API-specific data

  @Column({ type: 'json', nullable: true })
  logs: Array<{
    timestamp: Date;
    action: string;
    status: 'info' | 'success' | 'warning' | 'error';
    message: string;
    metadata?: Record<string, any>;
  }>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, user => user.missions)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Transaction, transaction => transaction.mission)
  transactions: Transaction[];

  // Methods
  start() {
    this.status = 'in_progress';
    this.startedAt = new Date();
    this.addLog('mission_started', 'info', 'Mission started');
  }

  complete() {
    this.status = 'completed';
    this.completedAt = new Date();
    this.addLog('mission_completed', 'success', 'Mission completed successfully');
  }

  fail(reason?: string) {
    this.status = 'failed';
    this.failedAt = new Date();
    this.addLog('mission_failed', 'error', `Mission failed: ${reason || 'Unknown error'}`);
  }

  addLog(action: string, status: 'info' | 'success' | 'warning' | 'error', message: string, metadata?: Record<string, any>) {
    if (!this.logs) {
      this.logs = [];
    }

    this.logs.push({
      timestamp: new Date(),
      action,
      status,
      message,
      ...(metadata && { metadata }),
    });
  }

  updateProgress(progress: number, message?: string) {
    this.addLog('progress_update', 'info', message || `Progress: ${progress}%`, { progress });
  }

  setExternalIds(apiId?: string, transactionId?: string) {
    if (apiId) this.externalApiId = apiId;
    if (transactionId) this.externalTransactionId = transactionId;
  }

  setBlockchainData(txHash?: string, tokenId?: string) {
    if (txHash) this.blockchainTxHash = txHash;
    if (tokenId) this.sbtTokenId = tokenId;
  }

  // Computed properties
  get duration(): number | null {
    if (!this.startedAt) return null;
    const endTime = this.completedAt || this.failedAt || new Date();
    return endTime.getTime() - this.startedAt.getTime();
  }

  get isActive(): boolean {
    return this.status === 'in_progress';
  }

  get isCompleted(): boolean {
    return this.status === 'completed';
  }

  get isFailed(): boolean {
    return this.status === 'failed';
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
      case 'in_progress': return '진행중';
      case 'completed': return '완료됨';
      case 'failed': return '실패함';
      default: return this.status;
    }
  }

  // Validation
  validateForStart(): { valid: boolean; error?: string } {
    if (this.status !== 'pending') {
      return { valid: false, error: 'Mission is not in pending status' };
    }
    return { valid: true };
  }

  validateForComplete(): { valid: boolean; error?: string } {
    if (this.status !== 'in_progress') {
      return { valid: false, error: 'Mission is not in progress' };
    }
    if (!this.externalTransactionId) {
      return { valid: false, error: 'External transaction ID is required' };
    }
    return { valid: true };
  }
}
