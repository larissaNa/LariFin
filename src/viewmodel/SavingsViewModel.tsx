import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SavingsAccount, SavingsTransaction } from '../model/entities';
import { SavingsRepository, SavingsTransactionRepository } from '../model/repositories/implementations';
import { SavingsService } from '../model/services';

interface SavingsState {
  accounts: SavingsAccount[];
  selectedAccountId: string | null;
  transactions: SavingsTransaction[];
  totalSavings: number;
  totalMonthlyYield: number;
  totalAnnualYield: number;
  isLoading: boolean;
}

interface SavingsViewModel extends SavingsState {
  selectAccount: (id: string | null) => void;
  addAccount: (data: Omit<SavingsAccount, 'id' | 'createdAt' | 'userId' | 'monthlyYieldRate' | 'dailyYieldRate'>) => void;
  updateAccount: (id: string, data: Partial<SavingsAccount>) => void;
  deleteAccount: (id: string) => void;
  deposit: (accountId: string, amount: number, description?: string) => void;
  withdraw: (accountId: string, amount: number, description?: string) => void;
  getProjection: (accountId: string, months: number) => ReturnType<SavingsService['projectCompoundGrowth']>;
  refresh: () => void;
}

const SavingsContext = createContext<SavingsViewModel | null>(null);

export function SavingsProvider({ children, userId }: { children: React.ReactNode; userId: string }) {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<SavingsTransaction[]>([]);
  const [state, setState] = useState<Omit<SavingsState, 'selectedAccountId' | 'transactions'>>({
    accounts: [], totalSavings: 0, totalMonthlyYield: 0, totalAnnualYield: 0, isLoading: true,
  });

  const savingsRepo = new SavingsRepository();
  const txRepo = new SavingsTransactionRepository();
  const savingsService = new SavingsService();

  const loadData = useCallback(async () => {
    const accounts = await savingsRepo.findByUser(userId);
    const totalSavings = accounts.reduce((s, a) => s + a.currentAmount, 0);
    const totalMonthlyYield = accounts.reduce((s, a) => s + savingsService.calculateMonthlyYield(a), 0);
    const totalAnnualYield = accounts.reduce((s, a) => s + savingsService.calculateAnnualYield(a), 0);
    setState({ accounts, totalSavings, totalMonthlyYield, totalAnnualYield, isLoading: false });
  }, [userId]);

  const loadTransactions = useCallback(async () => {
    if (selectedAccountId) {
      setTransactions(await txRepo.findByAccount(selectedAccountId));
    } else {
      setTransactions([]);
    }
  }, [selectedAccountId]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { loadTransactions(); }, [loadTransactions]);

  const selectAccount = useCallback((id: string | null) => setSelectedAccountId(id), []);

  const addAccount = useCallback(async (data: Omit<SavingsAccount, 'id' | 'createdAt' | 'userId' | 'monthlyYieldRate' | 'dailyYieldRate'>) => {
    await savingsRepo.create({ ...data, userId });
    loadData();
  }, [userId, loadData]);

  const updateAccount = useCallback(async (id: string, data: Partial<SavingsAccount>) => {
    await savingsRepo.update(id, data);
    loadData();
  }, [loadData]);

  const deleteAccount = useCallback(async (id: string) => {
    await savingsRepo.delete(id);
    loadData();
  }, [loadData]);

  const deposit = useCallback(async (accountId: string, amount: number, description?: string) => {
    const account = await savingsRepo.findById(accountId);
    if (!account) return;
    await savingsRepo.update(accountId, { currentAmount: account.currentAmount + amount });
    await txRepo.create({ savingsAccountId: accountId, amount, type: 'deposit', date: new Date(), description, userId });
    loadData();
    loadTransactions();
  }, [userId, loadData, loadTransactions]);

  const withdraw = useCallback(async (accountId: string, amount: number, description?: string) => {
    const account = await savingsRepo.findById(accountId);
    if (!account || account.currentAmount < amount) return;
    await savingsRepo.update(accountId, { currentAmount: account.currentAmount - amount });
    await txRepo.create({ savingsAccountId: accountId, amount, type: 'withdraw', date: new Date(), description, userId });
    loadData();
    loadTransactions();
  }, [userId, loadData, loadTransactions]);

  const getProjection = useCallback((accountId: string, months: number) => {
    const account = state.accounts.find(a => a.id === accountId);
    if (!account) return [];
    return savingsService.projectCompoundGrowth(account.currentAmount, 0, account.annualYieldRate, months);
  }, [state.accounts]);

  return (
    <SavingsContext.Provider value={{
      ...state, selectedAccountId, transactions,
      selectAccount, addAccount, updateAccount, deleteAccount, deposit, withdraw, getProjection, refresh: loadData,
    }}>
      {children}
    </SavingsContext.Provider>
  );
}

export function useSavings() {
  const ctx = useContext(SavingsContext);
  if (!ctx) throw new Error('useSavings must be used within SavingsProvider');
  return ctx;
}
