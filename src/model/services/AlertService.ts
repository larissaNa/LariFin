import { FinancialAlert } from '../entities';
import { FinanceService } from './FinanceService';
import { SavingsService } from './SavingsService';
import { ProjectionService } from './ProjectionService';

export class AlertService {
  private financeService = new FinanceService();
  private savingsService = new SavingsService();
  private projectionService = new ProjectionService();

  async generateAlerts(userId: string, month: number, year: number): Promise<FinancialAlert[]> {
    const alerts: FinancialAlert[] = [];
    const summary = await this.financeService.getMonthlySummary(userId, month, year);

    if (summary.expenseRatio > 80) {
      alerts.push({ id: 'high-expense', type: 'danger', title: 'Gastos Elevados', message: `Você comprometeu ${summary.expenseRatio.toFixed(0)}% da sua renda com gastos este mês.`, createdAt: new Date() });
    } else if (summary.expenseRatio > 60) {
      alerts.push({ id: 'moderate-expense', type: 'warning', title: 'Atenção com os Gastos', message: `${summary.expenseRatio.toFixed(0)}% da renda já foi comprometida com despesas.`, createdAt: new Date() });
    }

    const projection = await this.projectionService.projectMonth(userId, month, year);
    if (projection.projectedBalance < 0) {
      alerts.push({ id: 'negative-balance', type: 'danger', title: 'Saldo Negativo Projetado', message: `A projeção para este mês indica saldo negativo de R$ ${Math.abs(projection.projectedBalance).toFixed(2)}.`, createdAt: new Date() });
    }

    if (summary.debtRatio > 30) {
      alerts.push({ id: 'high-debt', type: 'danger', title: 'Dívidas Acima do Limite', message: `Suas dívidas comprometem ${summary.debtRatio.toFixed(0)}% da renda (limite recomendado: 30%).`, createdAt: new Date() });
    }

    const totalSavings = await this.savingsService.getTotalSavings(userId);
    if (summary.totalExpenses > 0 && totalSavings < summary.totalExpenses * 3) {
      const monthsCovered = totalSavings / summary.totalExpenses;
      alerts.push({ id: 'low-emergency-fund', type: 'warning', title: 'Reserva de Emergência Insuficiente', message: `Sua reserva cobre apenas ${monthsCovered.toFixed(1)} mês(es). Recomendado: mínimo 3 meses.`, createdAt: new Date() });
    }

    const futureNegative = await this.projectionService.getNegativeMonths(userId, 3);
    if (futureNegative.length > 0) {
      alerts.push({ id: 'future-negative', type: 'warning', title: 'Meses Futuros em Risco', message: `${futureNegative.length} mês(es) próximo(s) com saldo projetado negativo.`, createdAt: new Date() });
    }

    if (summary.savingsRate >= 20) {
      alerts.push({ id: 'good-savings', type: 'info', title: 'Ótima Taxa de Poupança!', message: `Você está economizando ${summary.savingsRate.toFixed(0)}% da renda. Continue assim!`, createdAt: new Date() });
    }

    return alerts;
  }

  async getFinancialFreedomIndex(userId: string, month: number, year: number): Promise<number> {
    const summary = await this.financeService.getMonthlySummary(userId, month, year);
    const totalSavings = await this.savingsService.getTotalSavings(userId);
    if (summary.totalIncome === 0) return 0;
    const savingsScore = Math.min(summary.savingsRate / 30, 1) * 40;
    const debtScore = Math.max(0, (1 - summary.debtRatio / 50)) * 30;
    const reserveMonths = summary.totalExpenses > 0 ? totalSavings / summary.totalExpenses : 0;
    const reserveScore = Math.min(reserveMonths / 6, 1) * 30;
    return Math.round(savingsScore + debtScore + reserveScore);
  }
}
