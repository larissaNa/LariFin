import { MonthlyProjection } from '../entities';
import { FinanceService } from './FinanceService';

export class ProjectionService {
  private financeService = new FinanceService();

  async projectMonth(userId: string, month: number, year: number): Promise<MonthlyProjection> {
    const now = new Date();
    const isPast = year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1);
    const isCurrent = year === now.getFullYear() && month === now.getMonth() + 1;

    let projectedIncome: number;
    let projectedExpenses: number;

    if (isPast || isCurrent) {
      [projectedIncome, projectedExpenses] = await Promise.all([
        this.financeService.totalIncome(userId, month, year),
        this.financeService.totalExpenses(userId, month, year),
      ]);
    } else {
      [projectedIncome, projectedExpenses] = await Promise.all([
        this.getAverageIncome(userId, now.getMonth() + 1, now.getFullYear(), 3),
        this.getAverageExpenses(userId, now.getMonth() + 1, now.getFullYear(), 3),
      ]);
    }

    const debtImpact = await this.financeService.totalDebtImpact(userId, month, year);
    const projectedBalance = projectedIncome - projectedExpenses - debtImpact;
    const isTight = projectedIncome > 0 && projectedBalance / projectedIncome < 0.1;

    const date = new Date(year, month - 1, 1);
    return {
      month, year,
      label: date.toLocaleString('pt-BR', { month: 'short', year: '2-digit' }),
      projectedIncome, projectedExpenses, projectedBalance,
      isNegative: projectedBalance < 0, isTight,
    };
  }

  private async getAverageIncome(userId: string, currentMonth: number, currentYear: number, months: number): Promise<number> {
    let total = 0, count = 0;
    for (let i = 1; i <= months; i++) {
      const d = new Date(currentYear, currentMonth - 1 - i, 1);
      const income = await this.financeService.totalIncome(userId, d.getMonth() + 1, d.getFullYear());
      if (income > 0) { total += income; count++; }
    }
    return count > 0 ? total / count : 0;
  }

  private async getAverageExpenses(userId: string, currentMonth: number, currentYear: number, months: number): Promise<number> {
    let total = 0, count = 0;
    for (let i = 1; i <= months; i++) {
      const d = new Date(currentYear, currentMonth - 1 - i, 1);
      const expenses = await this.financeService.totalExpenses(userId, d.getMonth() + 1, d.getFullYear());
      if (expenses > 0) { total += expenses; count++; }
    }
    return count > 0 ? total / count : 0;
  }

  async projectNextMonths(userId: string, months: number = 6): Promise<MonthlyProjection[]> {
    const now = new Date();
    const projections: MonthlyProjection[] = [];
    for (let i = 0; i < months; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      projections.push(await this.projectMonth(userId, d.getMonth() + 1, d.getFullYear()));
    }
    return projections;
  }

  async getNegativeMonths(userId: string, months: number = 6): Promise<MonthlyProjection[]> {
    return (await this.projectNextMonths(userId, months)).filter(p => p.isNegative);
  }

  async getTightMonths(userId: string, months: number = 6): Promise<MonthlyProjection[]> {
    return (await this.projectNextMonths(userId, months)).filter(p => p.isTight && !p.isNegative);
  }

  async simulateExpense(userId: string, month: number, year: number, additionalExpense: number) {
    const originalBalance = await this.financeService.projectedBalance(userId, month, year);
    const newBalance = originalBalance - additionalExpense;
    return { originalBalance, newBalance, difference: -additionalExpense, isStillPositive: newBalance >= 0 };
  }

  async getLast12MonthsHistory(userId: string): Promise<MonthlyProjection[]> {
    const now = new Date();
    const history: MonthlyProjection[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      history.push(await this.projectMonth(userId, d.getMonth() + 1, d.getFullYear()));
    }
    return history;
  }
}
