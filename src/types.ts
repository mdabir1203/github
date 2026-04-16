export type TransactionType = 'CREDIT' | 'PAYMENT';

export interface Transaction {
  id: string;
  customerId: string;
  amount: number;
  type: TransactionType;
  timestamp: number;
  note?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  nid?: string;
  bkashNumber?: string;
  totalBalance: number; // Positive means they owe us (Credit), Negative means we owe them (rare but possible) or overpaid
  lastTransactionAt: number;
  createdAt: number;
  isVerified?: boolean;
}

export interface UserStats {
  creditScore: number;
  streakDays: number;
  totalCollections: number;
  lastActiveDate: string; // YYYY-MM-DD
  badges: string[];
}

export interface AppState {
  customers: Customer[];
  transactions: Transaction[];
  stats: UserStats;
}
