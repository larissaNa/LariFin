import { Income, Expense, Debt, MonthlySummary } from '../entities';
import { IncomeRepository, ExpenseRepository, DebtRepository } from '../repositories/implementations';

export class FinanceService {
  private incomeRepo = new IncomeRepository();
  private expenseRepo = new ExpenseRepository();
  private debtRepo = new DebtRepository();

  async totalRealIncome(userId: string, month: number, year: number): Promise<number> {
    const incomes = await this.incomeRepo.findByMonth(userId, month, year);
    return incomes.filter(i => i.type === 'real').reduce((sum, i) => sum + i.amount, 0);
  }

  async totalEstimatedIncome(userId: string, month: number, year: number): Promise<number> {
    const incomes = await this.incomeRepo.findByMonth(userId, month, year);
    return incomes.filter(i => i.type === 'estimated').reduce((sum, i) => sum + i.amount, 0);
  }

  async totalIncome(userId: string, month: number, year: number): Promise<number> {
    const incomes = await this.incomeRepo.findByMonth(userId, month, year);
    return incomes.reduce((sum, i) => sum + i.amount, 0);
  }

  async totalExpenses(userId: string, month: number, year: number): Promise<number> {
    const expenses = await this.expenseRepo.findByMonth(userId, month, year);
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }

  async totalDebtImpact(userId: string, month: number, year: number): Promise<number> {
    const debts = await this.debtRepo.findActive(userId);
    return debts
      .filter(d => {
        const start = new Date(d.startDate);
        const end = new Date(d.endDate);
        const current = new Date(year, month - 1, 1);
        return start <= current && current <= end;
      })
      .reduce((sum, d) => sum + d.installmentValue, 0);
  }

  async projectedBalance(userId: string, month: number, year: number): Promise<number> {
    const [realIncome, estimatedIncome, expenses, debtImpact] = await Promise.all([
      this.totalRealIncome(userId, month, year),
      this.totalEstimatedIncome(userId, month, year),
      this.totalExpenses(userId, month, year),
      this.totalDebtImpact(userId, month, year),
    ]);
    return realIncome + estimatedIncome - expenses - debtImpact;
  }

  async getMonthlySummary(userId: string, month: number, year: number): Promise<MonthlySummary> {
    const [totalIncome, totalEstimatedIncome, totalExpenses, totalDebtImpact] = await Promise.all([
      this.totalIncome(userId, month, year),
      this.totalEstimatedIncome(userId, month, year),
      this.totalExpenses(userId, month, year),
      this.totalDebtImpact(userId, month, year),
    ]);
    const balance = totalIncome - totalExpenses;
    const projectedBalance = totalIncome - totalExpenses - totalDebtImpact;
    const debtRatio = totalIncome > 0 ? (totalDebtImpact / totalIncome) * 100 : 0;
    const expenseRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

    return {
      month, year, totalIncome, totalEstimatedIncome, totalExpenses, totalDebtImpact,
      balance, projectedBalance,
      savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0,
      debtRatio, expenseRatio,
    };
  }

  async getExpensesByCategory(userId: string, month: number, year: number): Promise<{ categoryId: string; total: number }[]> {
    const expenses = await this.expenseRepo.findByMonth(userId, month, year);
    const map = new Map<string, number>();
    expenses.forEach(e => {
      map.set(e.categoryId, (map.get(e.categoryId) || 0) + e.amount);
    });
    return Array.from(map.entries()).map(([categoryId, total]) => ({ categoryId, total }));
  }
}
