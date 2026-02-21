import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MonthlySummary, FinancialAlert } from '../model/entities';
import { FinanceService, AlertService } from '../model/services';
import { CategoryRepository } from '../model/repositories/implementations';

interface DashboardState {
  currentMonth: number;
  currentYear: number;
  summary: MonthlySummary | null;
  alerts: FinancialAlert[];
  freedomIndex: number;
  categoryBreakdown: { name: string; value: number; color: string }[];
  isLoading: boolean;
}

interface DashboardViewModel extends DashboardState {
  setMonth: (month: number, year: number) => void;
  refresh: () => void;
}

const DashboardContext = createContext<DashboardViewModel | null>(null);

export function DashboardProvider({ children, userId }: { children: React.ReactNode; userId: string }) {
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [state, setState] = useState<DashboardState>({
    currentMonth: now.getMonth() + 1, currentYear: now.getFullYear(),
    summary: null, alerts: [], freedomIndex: 0, categoryBreakdown: [], isLoading: true,
  });

  const loadData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    const financeService = new FinanceService();
    const alertService = new AlertService();
    const categoryRepo = new CategoryRepository();

    const [summary, alerts, freedomIndex, categoryBreakdownRaw, allCategories] = await Promise.all([
      financeService.getMonthlySummary(userId, currentMonth, currentYear),
      alertService.generateAlerts(userId, currentMonth, currentYear),
      alertService.getFinancialFreedomIndex(userId, currentMonth, currentYear),
      financeService.getExpensesByCategory(userId, currentMonth, currentYear),
      categoryRepo.findByUser(userId),
    ]);

    const categoryBreakdown = categoryBreakdownRaw.map(({ categoryId, total }) => {
      const cat = allCategories.find(c => c.id === categoryId);
      return { name: cat?.name || 'Outros', value: total, color: cat?.color || '#6b7280' };
    }).sort((a, b) => b.value - a.value);

    setState({ currentMonth, currentYear, summary, alerts, freedomIndex, categoryBreakdown, isLoading: false });
  }, [userId, currentMonth, currentYear]);

  useEffect(() => { loadData(); }, [loadData]);

  const setMonth = useCallback((month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);
  }, []);

  return (
    <DashboardContext.Provider value={{ ...state, setMonth, refresh: loadData }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider');
  return ctx;
}
