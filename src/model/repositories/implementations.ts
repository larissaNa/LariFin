import { Income, Expense, Category, Debt, SavingsAccount, SavingsTransaction } from '../entities';
import { supabase } from '@/integrations/supabase/client';

// ===== INCOME REPOSITORY =====
export class IncomeRepository {
  async findByMonth(userId: string, month: number, year: number): Promise<Income[]> {
    const { data } = await supabase.from('incomes').select('*').eq('user_id', userId).eq('month', month).eq('year', year);
    return (data || []).map(this.mapRow);
  }

  async findByUser(userId: string): Promise<Income[]> {
    const { data } = await supabase.from('incomes').select('*').eq('user_id', userId);
    return (data || []).map(this.mapRow);
  }

  async findByYear(userId: string, year: number): Promise<Income[]> {
    const { data } = await supabase.from('incomes').select('*').eq('user_id', userId).eq('year', year);
    return (data || []).map(this.mapRow);
  }

  async create(data: Omit<Income, 'id' | 'createdAt'>): Promise<Income> {
    const { data: row, error } = await supabase.from('incomes').insert({
      user_id: data.userId, description: data.description, amount: data.amount,
      month: data.month, year: data.year, type: data.type,
    }).select().single();
    if (error) throw error;
    return this.mapRow(row);
  }

  async update(id: string, partial: Partial<Income>): Promise<Income | undefined> {
    const mapped: Record<string, unknown> = {};
    if (partial.description !== undefined) mapped.description = partial.description;
    if (partial.amount !== undefined) mapped.amount = partial.amount;
    if (partial.type !== undefined) mapped.type = partial.type;
    if (partial.month !== undefined) mapped.month = partial.month;
    if (partial.year !== undefined) mapped.year = partial.year;
    const { data } = await supabase.from('incomes').update(mapped).eq('id', id).select().single();
    return data ? this.mapRow(data) : undefined;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from('incomes').delete().eq('id', id);
    return !error;
  }

  private mapRow(row: any): Income {
    return { id: row.id, userId: row.user_id, description: row.description, amount: Number(row.amount), month: row.month, year: row.year, type: row.type, createdAt: new Date(row.created_at) };
  }
}

// ===== EXPENSE REPOSITORY =====
export class ExpenseRepository {
  async findByMonth(userId: string, month: number, year: number): Promise<Expense[]> {
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];
    const { data } = await supabase.from('expenses').select('*').eq('user_id', userId).gte('date', startDate).lte('date', endDate);
    return (data || []).map(this.mapRow);
  }

  async findByUser(userId: string): Promise<Expense[]> {
    const { data } = await supabase.from('expenses').select('*').eq('user_id', userId);
    return (data || []).map(this.mapRow);
  }

  async findByCategory(userId: string, categoryId: string): Promise<Expense[]> {
    const { data } = await supabase.from('expenses').select('*').eq('user_id', userId).eq('category_id', categoryId);
    return (data || []).map(this.mapRow);
  }

  async findByYear(userId: string, year: number): Promise<Expense[]> {
    const startDate = new Date(year, 0, 1).toISOString().split('T')[0];
    const endDate = new Date(year, 11, 31).toISOString().split('T')[0];
    const { data } = await supabase.from('expenses').select('*').eq('user_id', userId).gte('date', startDate).lte('date', endDate);
    return (data || []).map(this.mapRow);
  }

  async create(data: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> {
    const { data: row, error } = await supabase.from('expenses').insert({
      user_id: data.userId, description: data.description, amount: data.amount,
      category_id: data.categoryId, date: new Date(data.date).toISOString().split('T')[0], is_fixed: data.isFixed,
    }).select().single();
    if (error) throw error;
    return this.mapRow(row);
  }

  async update(id: string, partial: Partial<Expense>): Promise<Expense | undefined> {
    const mapped: Record<string, unknown> = {};
    if (partial.description !== undefined) mapped.description = partial.description;
    if (partial.amount !== undefined) mapped.amount = partial.amount;
    if (partial.categoryId !== undefined) mapped.category_id = partial.categoryId;
    if (partial.date !== undefined) mapped.date = new Date(partial.date).toISOString().split('T')[0];
    if (partial.isFixed !== undefined) mapped.is_fixed = partial.isFixed;
    const { data } = await supabase.from('expenses').update(mapped).eq('id', id).select().single();
    return data ? this.mapRow(data) : undefined;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    return !error;
  }

  private mapRow(row: any): Expense {
    return { id: row.id, userId: row.user_id, description: row.description, amount: Number(row.amount), categoryId: row.category_id, date: new Date(row.date), isFixed: row.is_fixed, createdAt: new Date(row.created_at) };
  }
}

// ===== CATEGORY REPOSITORY =====
export class CategoryRepository {
  async findByUser(userId: string): Promise<Category[]> {
    const { data } = await supabase.from('categories').select('*').eq('user_id', userId);
    return (data || []).map(this.mapRow);
  }

  async create(data: Omit<Category, 'id'>): Promise<Category> {
    const { data: row, error } = await supabase.from('categories').insert({
      user_id: data.userId, name: data.name, type: data.type, color: data.color, icon: data.icon,
    }).select().single();
    if (error) throw error;
    return this.mapRow(row);
  }

  private mapRow(row: any): Category {
    return { id: row.id, userId: row.user_id, name: row.name, type: row.type, color: row.color, icon: row.icon };
  }
}

// ===== DEBT REPOSITORY =====
export class DebtRepository {
  async findByUser(userId: string): Promise<Debt[]> {
    const { data } = await supabase.from('debts').select('*').eq('user_id', userId);
    return (data || []).map(this.mapRow);
  }

  async findActive(userId: string): Promise<Debt[]> {
    const { data } = await supabase.from('debts').select('*').eq('user_id', userId).eq('status', 'active');
    return (data || []).map(this.mapRow);
  }

  async findById(id: string): Promise<Debt | undefined> {
    const { data } = await supabase.from('debts').select('*').eq('id', id).single();
    return data ? this.mapRow(data) : undefined;
  }

  async create(data: Omit<Debt, 'id' | 'createdAt' | 'endDate'>): Promise<Debt> {
    const endDate = new Date(data.startDate);
    endDate.setMonth(endDate.getMonth() + data.totalInstallments);
    const { data: row, error } = await supabase.from('debts').insert({
      user_id: data.userId, description: data.description, total_amount: data.totalAmount,
      installment_value: data.installmentValue, total_installments: data.totalInstallments,
      remaining_installments: data.remainingInstallments,
      start_date: new Date(data.startDate).toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0], status: data.status,
    }).select().single();
    if (error) throw error;
    return this.mapRow(row);
  }

  async update(id: string, partial: Partial<Debt>): Promise<Debt | undefined> {
    const mapped: Record<string, unknown> = {};
    if (partial.description !== undefined) mapped.description = partial.description;
    if (partial.totalAmount !== undefined) mapped.total_amount = partial.totalAmount;
    if (partial.installmentValue !== undefined) mapped.installment_value = partial.installmentValue;
    if (partial.totalInstallments !== undefined) mapped.total_installments = partial.totalInstallments;
    if (partial.remainingInstallments !== undefined) mapped.remaining_installments = partial.remainingInstallments;
    if (partial.status !== undefined) mapped.status = partial.status;
    const { data } = await supabase.from('debts').update(mapped).eq('id', id).select().single();
    return data ? this.mapRow(data) : undefined;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from('debts').delete().eq('id', id);
    return !error;
  }

  private mapRow(row: any): Debt {
    return {
      id: row.id, userId: row.user_id, description: row.description,
      totalAmount: Number(row.total_amount), installmentValue: Number(row.installment_value),
      totalInstallments: row.total_installments, remainingInstallments: row.remaining_installments,
      startDate: new Date(row.start_date), endDate: new Date(row.end_date),
      status: row.status, createdAt: new Date(row.created_at),
    };
  }
}

// ===== SAVINGS ACCOUNT REPOSITORY =====
export class SavingsRepository {
  async findByUser(userId: string): Promise<SavingsAccount[]> {
    const { data } = await supabase.from('savings_accounts').select('*').eq('user_id', userId);
    return (data || []).map(this.mapRow);
  }

  async findById(id: string): Promise<SavingsAccount | undefined> {
    const { data } = await supabase.from('savings_accounts').select('*').eq('id', id).single();
    return data ? this.mapRow(data) : undefined;
  }

  async create(data: Omit<SavingsAccount, 'id' | 'createdAt' | 'monthlyYieldRate' | 'dailyYieldRate'>): Promise<SavingsAccount> {
    const monthlyYieldRate = Math.pow(1 + data.annualYieldRate / 100, 1 / 12) - 1;
    const dailyYieldRate = Math.pow(1 + data.annualYieldRate / 100, 1 / 365) - 1;
    const { data: row, error } = await supabase.from('savings_accounts').insert({
      user_id: data.userId, name: data.name, current_amount: data.currentAmount,
      annual_yield_rate: data.annualYieldRate, monthly_yield_rate: monthlyYieldRate, daily_yield_rate: dailyYieldRate,
    }).select().single();
    if (error) throw error;
    return this.mapRow(row);
  }

  async update(id: string, partial: Partial<SavingsAccount>): Promise<SavingsAccount | undefined> {
    const mapped: Record<string, unknown> = {};
    if (partial.name !== undefined) mapped.name = partial.name;
    if (partial.currentAmount !== undefined) mapped.current_amount = partial.currentAmount;
    if (partial.annualYieldRate !== undefined) {
      mapped.annual_yield_rate = partial.annualYieldRate;
      mapped.monthly_yield_rate = Math.pow(1 + partial.annualYieldRate / 100, 1 / 12) - 1;
      mapped.daily_yield_rate = Math.pow(1 + partial.annualYieldRate / 100, 1 / 365) - 1;
    }
    if (partial.monthlyYieldRate !== undefined) mapped.monthly_yield_rate = partial.monthlyYieldRate;
    if (partial.dailyYieldRate !== undefined) mapped.daily_yield_rate = partial.dailyYieldRate;
    const { data } = await supabase.from('savings_accounts').update(mapped).eq('id', id).select().single();
    return data ? this.mapRow(data) : undefined;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from('savings_accounts').delete().eq('id', id);
    return !error;
  }

  private mapRow(row: any): SavingsAccount {
    return {
      id: row.id, userId: row.user_id, name: row.name,
      currentAmount: Number(row.current_amount), annualYieldRate: Number(row.annual_yield_rate),
      monthlyYieldRate: Number(row.monthly_yield_rate), dailyYieldRate: Number(row.daily_yield_rate),
      createdAt: new Date(row.created_at),
    };
  }
}

// ===== SAVINGS TRANSACTION REPOSITORY =====
export class SavingsTransactionRepository {
  async findByAccount(savingsAccountId: string): Promise<SavingsTransaction[]> {
    const { data } = await supabase.from('savings_transactions').select('*').eq('savings_account_id', savingsAccountId).order('date', { ascending: false });
    return (data || []).map(this.mapRow);
  }

  async create(data: Omit<SavingsTransaction, 'id'> & { userId: string }): Promise<SavingsTransaction> {
    const { data: row, error } = await supabase.from('savings_transactions').insert({
      savings_account_id: data.savingsAccountId, amount: data.amount, type: data.type,
      date: new Date(data.date).toISOString().split('T')[0], description: data.description,
      user_id: data.userId,
    }).select().single();
    if (error) throw error;
    return this.mapRow(row);
  }

  private mapRow(row: any): SavingsTransaction {
    return { id: row.id, savingsAccountId: row.savings_account_id, amount: Number(row.amount), type: row.type, date: new Date(row.date), description: row.description };
  }
}
