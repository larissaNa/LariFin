import {
  User, Income, Expense, Category, Debt,
  SavingsAccount, SavingsTransaction
} from '../entities';

// ===== BASE REPOSITORY INTERFACE (ASYNC) =====
export interface IRepository<T> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | undefined>;
  save(entity: T): Promise<T>;
  update(id: string, partial: Partial<T>): Promise<T | undefined>;
  delete(id: string): Promise<boolean>;
}

// ===== INCOME REPOSITORY =====
export interface IIncomeRepository extends IRepository<Income> {
  findByMonth(userId: string, month: number, year: number): Promise<Income[]>;
  findByUser(userId: string): Promise<Income[]>;
  findByYear(userId: string, year: number): Promise<Income[]>;
}

// ===== EXPENSE REPOSITORY =====
export interface IExpenseRepository extends IRepository<Expense> {
  findByMonth(userId: string, month: number, year: number): Promise<Expense[]>;
  findByUser(userId: string): Promise<Expense[]>;
  findByCategory(userId: string, categoryId: string): Promise<Expense[]>;
  findByYear(userId: string, year: number): Promise<Expense[]>;
}

// ===== CATEGORY REPOSITORY =====
export interface ICategoryRepository extends IRepository<Category> {
  findByUser(userId: string): Promise<Category[]>;
}

// ===== DEBT REPOSITORY =====
export interface IDebtRepository extends IRepository<Debt> {
  findByUser(userId: string): Promise<Debt[]>;
  findActive(userId: string): Promise<Debt[]>;
}

// ===== SAVINGS REPOSITORY =====
export interface ISavingsRepository extends IRepository<SavingsAccount> {
  findByUser(userId: string): Promise<SavingsAccount[]>;
}

// ===== SAVINGS TRANSACTION REPOSITORY =====
export interface ISavingsTransactionRepository extends IRepository<SavingsTransaction> {
  findByAccount(savingsAccountId: string): Promise<SavingsTransaction[]>;
}
