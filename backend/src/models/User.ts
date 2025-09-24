import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Mission } from './Mission';
import { Transaction } from './Transaction';
import { Receipt } from './Receipt';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'telegram_id', unique: true })
  telegramId: number;

  @Column({ nullable: true })
  username: string;

  @Column({ name: 'first_name', nullable: true })
  firstName: string;

  @Column({ name: 'last_name', nullable: true })
  lastName: string;

  @Column({ name: 'language_code', nullable: true })
  languageCode: string;

  @Column({ name: 'wallet_address', nullable: true })
  walletAddress: string;

  @Column({ name: 'is_premium', default: false })
  isPremium: boolean;

  @Column({ name: 'total_impact', default: 0 })
  totalImpact: number;

  @Column({ name: 'missions_completed', default: 0 })
  missionsCompleted: number;

  @Column({ name: 'badges_earned', default: 0 })
  badgesEarned: number;

  @Column({ name: 'last_active_at', nullable: true })
  lastActiveAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => Mission, mission => mission.user)
  missions: Mission[];

  @OneToMany(() => Transaction, transaction => transaction.user)
  transactions: Transaction[];

  @OneToMany(() => Receipt, receipt => receipt.user)
  receipts: Receipt[];

  // Methods
  updateActivity() {
    this.lastActiveAt = new Date();
  }

  incrementImpact(points: number) {
    this.totalImpact += points;
  }

  incrementMissionsCompleted() {
    this.missionsCompleted += 1;
  }

  incrementBadgesEarned() {
    this.badgesEarned += 1;
  }

  // Computed properties
  get fullName(): string {
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`;
    }
    return this.firstName || this.username || `User ${this.telegramId}`;
  }

  get displayName(): string {
    return this.username || this.firstName || `User ${this.telegramId}`;
  }

  // Helper methods
  hasWallet(): boolean {
    return !!this.walletAddress;
  }

  isActiveRecently(): boolean {
    if (!this.lastActiveAt) return false;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return this.lastActiveAt > oneWeekAgo;
  }
}
