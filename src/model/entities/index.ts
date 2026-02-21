// ===== USER ENTITY =====
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

// ===== INCOME ENTITY =====
export type IncomeType = 'real' | 'estimated';

export interface Income {
  id: string;
  userId: string;
  description: string;
  amount: number;
  month: number; // 1-12
  year: number;
  type: IncomeType;
  createdAt: Date;
}

// ===== CATEGORY ENTITY =====
export type CategoryType = 'fixed' | 'variable' | 'investment' | 'debt';

export interface Category {
  id: string;
  userId: string;
  name: string;
  type: CategoryType;
  color?: string;
  icon?: string;
}

// ===== EXPENSE ENTITY =====
export interface Expense {
  id: string;
  userId: string;
  description: string;
  amount: number;
  categoryId: string;
  date: Date;
  isFixed: boolean;
  createdAt: Date;
}

// ===== DEBT ENTITY =====
export type DebtStatus = 'active' | 'paid';

export interface Debt {
  id: string;
  userId: string;
  description: string;
  totalAmount: number;
  installmentValue: number;
  totalInstallments: number;
  remainingInstallments: number;
  startDate: Date;
  endDate: Date; // calculated
  status: DebtStatus;
  createdAt: Date;
}

// ===== SAVINGS ACCOUNT ENTITY =====
export interface SavingsAccount {
  id: string;
  userId: string;
  name: string;
  currentAmount: number;
  annualYieldRate: number; // percentage (e.g. 12 = 12%)
  monthlyYieldRate: number; // calculated
  dailyYieldRate: number; // calculated
  createdAt: Date;
}

// ===== SAVINGS TRANSACTION ENTITY =====
export type SavingsTransactionType = 'deposit' | 'withdraw';

export interface SavingsTransaction {
  id: string;
  savingsAccountId: string;
  amount: number;
  type: SavingsTransactionType;
  date: Date;
  description?: string;
}

// ===== ALERT ENTITY =====
export type AlertType = 'warning' | 'danger' | 'info';

export interface FinancialAlert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  createdAt: Date;
}

// ===== MONTHLY SUMMARY =====
export interface MonthlySummary {
  month: number;
  year: number;
  totalIncome: number;
  totalEstimatedIncome: number;
  totalExpenses: number;
  totalDebtImpact: number;
  balance: number;
  projectedBalance: number;
  savingsRate: number;
  debtRatio: number;
  expenseRatio: number;
}

// ===== PROJECTION =====
export interface MonthlyProjection {
  month: number;
  year: number;
  label: string;
  projectedIncome: number;
  projectedExpenses: number;
  projectedBalance: number;
  isNegative: boolean;
  isTight: boolean; // < 10% margin
}
