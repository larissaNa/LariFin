import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Debt } from '../model/entities';
import { DebtRepository } from '../model/repositories/implementations';
import { FinanceService } from '../model/services';

interface DebtState {
  debts: Debt[];
  activeDebts: Debt[];
  paidDebts: Debt[];
  totalRemaining: number;
  totalMonthlyImpact: number;
  isLoading: boolean;
}

interface DebtViewModel extends DebtState {
  addDebt: (data: Omit<Debt, 'id' | 'createdAt' | 'userId' | 'endDate'>) => void;
  updateDebt: (id: string, data: Partial<Debt>) => void;
  markAsPaid: (id: string) => void;
  deleteDebt: (id: string) => void;
  payInstallment: (id: string) => void;
  refresh: () => void;
}

const DebtContext = createContext<DebtViewModel | null>(null);

export function DebtProvider({ children, userId }: { children: React.ReactNode; userId: string }) {
  const [state, setState] = useState<DebtState>({
    debts: [], activeDebts: [], paidDebts: [], totalRemaining: 0, totalMonthlyImpact: 0, isLoading: true,
  });

  const repo = new DebtRepository();
  const financeService = new FinanceService();
  const now = new Date();

  const loadData = useCallback(async () => {
    const debts = await repo.findByUser(userId);
    const activeDebts = debts.filter(d => d.status === 'active');
    const paidDebts = debts.filter(d => d.status === 'paid');
    const totalRemaining = activeDebts.reduce((s, d) => s + d.remainingInstallments * d.installmentValue, 0);
    const totalMonthlyImpact = await financeService.totalDebtImpact(userId, now.getMonth() + 1, now.getFullYear());
    setState({ debts, activeDebts, paidDebts, totalRemaining, totalMonthlyImpact, isLoading: false });
  }, [userId]);

  useEffect(() => { loadData(); }, [loadData]);

  const addDebt = useCallback(async (data: Omit<Debt, 'id' | 'createdAt' | 'userId' | 'endDate'>) => {
    await repo.create({ ...data, userId });
    loadData();
  }, [userId, loadData]);

  const updateDebt = useCallback(async (id: string, data: Partial<Debt>) => {
    await repo.update(id, data);
    loadData();
  }, [loadData]);

  const markAsPaid = useCallback(async (id: string) => {
    await repo.update(id, { status: 'paid', remainingInstallments: 0 });
    loadData();
  }, [loadData]);

  const deleteDebt = useCallback(async (id: string) => {
    await repo.delete(id);
    loadData();
  }, [loadData]);

  const payInstallment = useCallback(async (id: string) => {
    const debt = await repo.findById(id);
    if (!debt) return;
    const remaining = debt.remainingInstallments - 1;
    await repo.update(id, { remainingInstallments: remaining, status: remaining <= 0 ? 'paid' : 'active' });
    loadData();
  }, [loadData]);

  return (
    <DebtContext.Provider value={{ ...state, addDebt, updateDebt, markAsPaid, deleteDebt, payInstallment, refresh: loadData }}>
      {children}
    </DebtContext.Provider>
  );
}

export function useDebts() {
  const ctx = useContext(DebtContext);
  if (!ctx) throw new Error('useDebts must be used within DebtProvider');
  return ctx;
}
