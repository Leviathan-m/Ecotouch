import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

export type ReceiptType = 'donation' | 'carbon_offset';

@Entity('receipts')
export class Receipt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'transaction_id' })
  transactionId: string;

  @Column({ type: 'enum', enum: ['donation', 'carbon_offset'] })
  type: ReceiptType;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ default: 'KRW' })
  currency: 'KRW' | 'USD';

  @Column({ name: 'receipt_number' })
  receiptNumber: string; // Unique receipt number

  @Column({ name: 'issued_at' })
  issuedAt: Date;

  @Column({ name: 'issued_by' })
  issuedBy: string; // Organization name

  @Column({ name: 'tax_deductible', default: false })
  taxDeductible: boolean;

  @Column({ name: 'tax_year', nullable: true })
  taxYear: number; // Tax year for deduction

  @Column({ name: 'pdf_url', nullable: true })
  pdfUrl: string;

  @Column({ name: 'email_sent', default: false })
  emailSent: boolean;

  @Column({ name: 'email_sent_at', nullable: true })
  emailSentAt: Date;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>; // Store receipt-specific data

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, user => user.receipts)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Methods
  markEmailSent() {
    this.emailSent = true;
    this.emailSentAt = new Date();
  }

  setPdfUrl(url: string) {
    this.pdfUrl = url;
  }

  addNote(note: string) {
    if (!this.notes) {
      this.notes = note;
    } else {
      this.notes += `\n[${new Date().toISOString()}] ${note}`;
    }
  }

  // Computed properties
  get isForCurrentTaxYear(): boolean {
    const currentYear = new Date().getFullYear();
    return this.taxYear === currentYear;
  }

  get canBeDownloaded(): boolean {
    return !!this.pdfUrl;
  }

  // Helper methods
  getTypeDisplayName(): string {
    switch (this.type) {
      case 'donation': return '기부금영수증';
      case 'carbon_offset': return '탄소상쇄영수증';
      default: return this.type;
    }
  }

  // Korean tax law compliance
  isValidForTaxDeduction(): boolean {
    if (!this.taxDeductible) return false;

    // Check if receipt is within 5 years (Korean tax law)
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

    return this.issuedAt > fiveYearsAgo;
  }

  // Generate receipt number (format: IMP-YYYY-NNNNNN)
  static generateReceiptNumber(): string {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `IMP-${year}-${randomNum}`;
  }

  // Validation
  validateForTaxDeduction(): { valid: boolean; error?: string } {
    if (!this.taxDeductible) {
      return { valid: false, error: 'Receipt is not tax deductible' };
    }

    if (!this.receiptNumber) {
      return { valid: false, error: 'Receipt number is required' };
    }

    if (!this.issuedBy) {
      return { valid: false, error: 'Issuer information is required' };
    }

    if (this.amount <= 0) {
      return { valid: false, error: 'Amount must be greater than 0' };
    }

    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

    if (this.issuedAt < fiveYearsAgo) {
      return { valid: false, error: 'Receipt is too old for tax deduction (max 5 years)' };
    }

    return { valid: true };
  }

  // Tax calculation helpers (Korean tax law)
  getDeductibleAmount(income: number): number {
    if (!this.isValidForTaxDeduction()) return 0;

    // Korean tax deduction rules (simplified)
    // Up to 30% of income can be deducted for donations
    const maxDeduction = income * 0.3;
    return Math.min(this.amount, maxDeduction);
  }

  // Utility methods
  toJSON() {
    return {
      ...this,
      typeDisplayName: this.getTypeDisplayName(),
      isValidForTaxDeduction: this.isValidForTaxDeduction(),
      canBeDownloaded: this.canBeDownloaded,
    };
  }

  // PDF generation data
  getPdfData() {
    return {
      receiptNumber: this.receiptNumber,
      issuedAt: this.issuedAt,
      issuedBy: this.issuedBy,
      type: this.getTypeDisplayName(),
      amount: this.amount,
      currency: this.currency,
      taxDeductible: this.taxDeductible,
      user: {
        name: this.user.displayName,
        id: this.user.telegramId,
      },
      metadata: this.metadata,
    };
  }
}
