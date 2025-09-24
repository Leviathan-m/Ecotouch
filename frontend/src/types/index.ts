// User types
export interface User {
  id: string;
  telegramId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  languageCode?: string;
  walletAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mission types
export type MissionType = 'carbon_offset' | 'donation' | 'petition';

export interface Mission {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  impact: number; // Impact score (0-100)
  cost: number; // Cost in KRW or USD
  currency: 'KRW' | 'USD';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export interface MissionProgress {
  missionId: string;
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  logs: WorkLog[];
  transactionId?: string;
  receiptId?: string;
  sbtTokenId?: string;
  startedAt?: Date;
  completedAt?: Date;
}

// Transaction types
export interface Transaction {
  id: string;
  userId: string;
  missionId: string;
  type: MissionType;
  amount: number;
  currency: 'KRW' | 'USD';
  status: 'pending' | 'completed' | 'failed';
  blockchainTxHash?: string;
  externalTxId?: string; // External API transaction ID
  createdAt: Date;
  updatedAt: Date;
}

// Receipt types
export interface Receipt {
  id: string;
  userId: string;
  transactionId: string;
  type: 'donation' | 'carbon_offset';
  amount: number;
  currency: 'KRW' | 'USD';
  receiptNumber: string;
  issuedAt: Date;
  issuedBy: string; // Organization name
  taxDeductible: boolean;
  pdfUrl?: string;
}

// SBT Badge types
export interface SBTBadge {
  tokenId: string;
  userId: string;
  missionType: MissionType;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  impact: number;
  mintedAt: Date;
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes: {
      trait_type: string;
      value: string | number;
    }[];
  };
}

// Work log types
export interface WorkLog {
  id: string;
  missionId: string;
  userId: string;
  action: string;
  status: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Telegram WebApp types (extended)
export interface TelegramUser {
  id: number;
  is_bot?: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: TelegramUser;
    receiver?: TelegramUser;
    chat?: any;
    start_param?: string;
    can_send_after?: number;
    auth_date: number;
    hash: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  bottomBarColor: string;
  openLink(url: string): void;
  openTelegramLink(url: string): void;
  openInvoice(url: string, callback?: (status: string) => void): void;
  showPopup(params: {
    title?: string;
    message: string;
    buttons?: Array<{
      id: string;
      type: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
      text: string;
    }>;
  }, callback?: (buttonId: string) => void): void;
  showAlert(message: string, callback?: () => void): void;
  showConfirm(message: string, callback?: (confirmed: boolean) => void): void;
  enableClosingConfirmation(): void;
  disableClosingConfirmation(): void;
  onEvent(eventType: string, eventHandler: Function): void;
  offEvent(eventType: string, eventHandler: Function): void;
  sendData(data: string): void;
  expand(): void;
  close(): void;
}

// Blockchain types
export interface WalletInfo {
  address: string;
  chainId: number;
  isConnected: boolean;
  balance?: string;
}

export interface ERC4337UserOp {
  sender: string;
  nonce: string;
  initCode: string;
  callData: string;
  callGasLimit: string;
  verificationGasLimit: string;
  preVerificationGas: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  paymasterAndData: string;
  signature: string;
}

// UI State types
export interface UIState {
  isLoading: boolean;
  error?: string;
  success?: string;
}

// Mission progress calculation
export interface ProgressStats {
  totalMissions: number;
  completedMissions: number;
  totalImpact: number;
  weeklyGoal: number;
  weeklyProgress: number;
  nextMilestone: number;
}
