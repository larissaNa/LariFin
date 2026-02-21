import { SavingsAccount, SavingsTransaction } from '../entities';
import { SavingsRepository, SavingsTransactionRepository } from '../repositories/implementations';

export interface SavingsProjection {
  month: number;
  year: number;
  label: string;
  amount: number;
  earnings: number;
  cumulativeEarnings: number;
}

export class SavingsService {
  private savingsRepo = new SavingsRepository();
  private transactionRepo = new SavingsTransactionRepository();

  calculateMonthlyYield(account: SavingsAccount): number {
    return account.currentAmount * account.monthlyYieldRate;
  }

  calculateDailyYield(account: SavingsAccount): number {
    return account.currentAmount * account.dailyYieldRate;
  }

  calculateAnnualYield(account: SavingsAccount): number {
    return account.currentAmount * (account.annualYieldRate / 100);
  }

  projectCompoundGrowth(initialAmount: number, monthlyDeposit: number, annualRate: number, months: number): SavingsProjection[] {
    const now = new Date();
    const monthlyRate = Math.pow(1 + annualRate / 100, 1 / 12) - 1;
    const projections: SavingsProjection[] = [];
    let currentAmount = initialAmount;
    let cumulativeEarnings = 0;

    for (let i = 0; i < months; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const earnings = currentAmount * monthlyRate;
      currentAmount = currentAmount * (1 + monthlyRate) + monthlyDeposit;
      cumulativeEarnings += earnings;
      projections.push({
        month: d.getMonth() + 1, year: d.getFullYear(),
        label: d.toLocaleString('pt-BR', { month: 'short', year: '2-digit' }),
        amount: currentAmount, earnings, cumulativeEarnings,
      });
    }
    return projections;
  }

  async getTotalSavings(userId: string): Promise<number> {
    const accounts = await this.savingsRepo.findByUser(userId);
    return accounts.reduce((sum, s) => sum + s.currentAmount, 0);
  }

  async getTotalMonthlyYield(userId: string): Promise<number> {
    const accounts = await this.savingsRepo.findByUser(userId);
    return accounts.reduce((sum, s) => sum + this.calculateMonthlyYield(s), 0);
  }
}
