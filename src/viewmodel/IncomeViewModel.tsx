import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Income } from '../model/entities';
import { IncomeRepository } from '../model/repositories/implementations';

interface IncomeState {
  incomes: Income[];
  currentMonth: number;
  currentYear: number;
  totalReal: number;
  totalEstimated: number;
  total: number;
  isLoading: boolean;
}

interface IncomeViewModel extends IncomeState {
  setMonth: (month: number, year: number) => void;
  addIncome: (data: Omit<Income, 'id' | 'createdAt' | 'userId'>) => void;
  updateIncome: (id: string, data: Partial<Income>) => void;
  deleteIncome: (id: string) => void;
  convertToReal: (id: string, actualAmount: number) => void;
  refresh: () => void;
}

const IncomeContext = createContext<IncomeViewModel | null>(null);

export function IncomeProvider({ children, userId }: { children: React.ReactNode; userId: string }) {
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [state, setState] = useState<IncomeState>({
    incomes: [], currentMonth: now.getMonth() + 1, currentYear: now.getFullYear(),
    totalReal: 0, totalEstimated: 0, total: 0, isLoading: true,
  });

  const repo = new IncomeRepository();

  const loadData = useCallback(async () => {
    const incomes = await repo.findByMonth(userId, currentMonth, currentYear);
    const totalReal = incomes.filter(i => i.type === 'real').reduce((s, i) => s + i.amount, 0);
    const totalEstimated = incomes.filter(i => i.type === 'estimated').reduce((s, i) => s + i.amount, 0);
    setState({ incomes, currentMonth, currentYear, totalReal, totalEstimated, total: totalReal + totalEstimated, isLoading: false });
  }, [userId, currentMonth, currentYear]);

  useEffect(() => { loadData(); }, [loadData]);

  const addIncome = useCallback(async (data: Omit<Income, 'id' | 'createdAt' | 'userId'>) => {
    await repo.create({ ...data, userId });
    loadData();
  }, [userId, loadData]);

  const updateIncome = useCallback(async (id: string, data: Partial<Income>) => {
    await repo.update(id, data);
    loadData();
  }, [loadData]);

  const deleteIncome = useCallback(async (id: string) => {
    await repo.delete(id);
    loadData();
  }, [loadData]);

  const convertToReal = useCallback(async (id: string, actualAmount: number) => {
    await repo.update(id, { type: 'real', amount: actualAmount });
    loadData();
  }, [loadData]);

  const setMonth = useCallback((month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);
  }, []);

  return (
    <IncomeContext.Provider value={{ ...state, setMonth, addIncome, updateIncome, deleteIncome, convertToReal, refresh: loadData }}>
      {children}
    </IncomeContext.Provider>
  );
}

export function useIncome() {
  const ctx = useContext(IncomeContext);
  if (!ctx) throw new Error('useIncome must be used within IncomeProvider');
  return ctx;
}
