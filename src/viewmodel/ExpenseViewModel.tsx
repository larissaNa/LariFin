import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Expense, Category } from '../model/entities';
import { ExpenseRepository, CategoryRepository } from '../model/repositories/implementations';

interface ExpenseState {
  expenses: Expense[];
  categories: Category[];
  currentMonth: number;
  currentYear: number;
  total: number;
  fixedTotal: number;
  variableTotal: number;
  isLoading: boolean;
  filterCategory: string | null;
  filterFixed: boolean | null;
}

interface ExpenseViewModel extends ExpenseState {
  setMonth: (month: number, year: number) => void;
  setFilterCategory: (categoryId: string | null) => void;
  setFilterFixed: (isFixed: boolean | null) => void;
  addExpense: (data: Omit<Expense, 'id' | 'createdAt' | 'userId'>) => void;
  updateExpense: (id: string, data: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  addCategory: (data: Omit<Category, 'id' | 'userId'>) => void;
  filteredExpenses: Expense[];
  refresh: () => void;
}

const ExpenseContext = createContext<ExpenseViewModel | null>(null);

export function ExpenseProvider({ children, userId }: { children: React.ReactNode; userId: string }) {
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterFixed, setFilterFixed] = useState<boolean | null>(null);
  const [state, setState] = useState<Omit<ExpenseState, 'filterCategory' | 'filterFixed'>>({
    expenses: [], categories: [], currentMonth: now.getMonth() + 1, currentYear: now.getFullYear(),
    total: 0, fixedTotal: 0, variableTotal: 0, isLoading: true,
  });

  const expenseRepo = new ExpenseRepository();
  const categoryRepo = new CategoryRepository();

  const loadData = useCallback(async () => {
    const [expenses, categories] = await Promise.all([
      expenseRepo.findByMonth(userId, currentMonth, currentYear),
      categoryRepo.findByUser(userId),
    ]);
    const total = expenses.reduce((s, e) => s + e.amount, 0);
    const fixedTotal = expenses.filter(e => e.isFixed).reduce((s, e) => s + e.amount, 0);
    setState({ expenses, categories, currentMonth, currentYear, total, fixedTotal, variableTotal: total - fixedTotal, isLoading: false });
  }, [userId, currentMonth, currentYear]);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredExpenses = state.expenses.filter(e => {
    if (filterCategory && e.categoryId !== filterCategory) return false;
    if (filterFixed !== null && e.isFixed !== filterFixed) return false;
    return true;
  });

  const addExpense = useCallback(async (data: Omit<Expense, 'id' | 'createdAt' | 'userId'>) => {
    await expenseRepo.create({ ...data, userId });
    loadData();
  }, [userId, loadData]);

  const updateExpense = useCallback(async (id: string, data: Partial<Expense>) => {
    await expenseRepo.update(id, data);
    loadData();
  }, [loadData]);

  const deleteExpense = useCallback(async (id: string) => {
    await expenseRepo.delete(id);
    loadData();
  }, [loadData]);

  const addCategory = useCallback(async (data: Omit<Category, 'id' | 'userId'>) => {
    await categoryRepo.create({ ...data, userId });
    loadData();
  }, [userId, loadData]);

  const setMonth = useCallback((month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);
  }, []);

  return (
    <ExpenseContext.Provider value={{
      ...state, filterCategory, filterFixed,
      setMonth, setFilterCategory, setFilterFixed,
      addExpense, updateExpense, deleteExpense, addCategory,
      filteredExpenses, refresh: loadData,
    }}>
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error('useExpenses must be used within ExpenseProvider');
  return ctx;
}
