import { useEffect, useState } from 'react';
import { useDashboard } from '../../viewmodel/DashboardViewModel';
import { useAuth } from '@/contexts/AuthContext';
import { MetricCard } from '../components/MetricCard';
import { AlertCard } from '../components/AlertCard';
import { MonthSelector } from '../components/MonthSelector';
import { formatCurrency, formatPercent } from '../../lib/formatters';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { TrendingUp, TrendingDown, Wallet, AlertTriangle, Target } from 'lucide-react';
import { ProjectionService } from '../../model/services';
import { MonthlyProjection } from '../../model/entities';

export function DashboardPage() {
  const { summary, alerts, categoryBreakdown, freedomIndex, currentMonth, currentYear, setMonth, isLoading } = useDashboard();
  const { user } = useAuth();
  const [history, setHistory] = useState<MonthlyProjection[]>([]);

  useEffect(() => {
    if (!user) return;
    const service = new ProjectionService();
    service.getLast12MonthsHistory(user.id).then(h => setHistory(h.slice(-6)));
  }, [user, currentMonth, currentYear]);

  const chartData = history.map(h => ({
    name: h.label, receitas: h.projectedIncome, despesas: h.projectedExpenses, saldo: h.projectedBalance,
  }));

  const RADIAN = Math.PI / 180;
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>{`${(percent * 100).toFixed(0)}%`}</text>;
  };

  const freedomColor = freedomIndex >= 70 ? 'text-income' : freedomIndex >= 40 ? 'text-warning' : 'text-expense';

  return (
    <div className="space-y-6 page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Visão geral das suas finanças</p>
        </div>
        <MonthSelector month={currentMonth} year={currentYear} onChange={setMonth} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Receita Total" value={summary?.totalIncome ?? 0} subtitle={`Estimado: ${formatCurrency(summary?.totalEstimatedIncome ?? 0)}`} variant="income" loading={isLoading} icon={<TrendingUp className="w-4 h-4" />} />
        <MetricCard title="Total de Gastos" value={summary?.totalExpenses ?? 0} subtitle={`${formatPercent(summary?.expenseRatio ?? 0)} da renda`} variant="expense" loading={isLoading} icon={<TrendingDown className="w-4 h-4" />} />
        <MetricCard title="Saldo do Mês" value={summary?.balance ?? 0} subtitle={`Projetado: ${formatCurrency(summary?.projectedBalance ?? 0)}`} variant={summary && summary.balance >= 0 ? 'default' : 'expense'} loading={isLoading} icon={<Wallet className="w-4 h-4" />} />
        <MetricCard title="Impacto de Dívidas" value={summary?.totalDebtImpact ?? 0} subtitle={`${formatPercent(summary?.debtRatio ?? 0)} da renda`} variant="debt" loading={isLoading} icon={<AlertTriangle className="w-4 h-4" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 p-5 rounded-xl border border-border bg-card gradient-card">
          <h3 className="font-display font-semibold text-foreground mb-4">Histórico Financeiro (6 meses)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(152, 76%, 48%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(152, 76%, 48%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(350, 89%, 60%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(350, 89%, 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 15%)" />
              <XAxis dataKey="name" tick={{ fill: 'hsl(215, 20%, 50%)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(215, 20%, 50%)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: 'hsl(222, 40%, 8%)', border: '1px solid hsl(222, 30%, 15%)', borderRadius: '8px', fontSize: '12px' }} labelStyle={{ color: 'hsl(210, 40%, 96%)', fontWeight: 600 }} formatter={(val: number) => formatCurrency(val)} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Area type="monotone" dataKey="receitas" name="Receitas" stroke="hsl(152, 76%, 48%)" fill="url(#incomeGrad)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="despesas" name="Despesas" stroke="hsl(350, 89%, 60%)" fill="url(#expenseGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card gradient-card">
          <h3 className="font-display font-semibold text-foreground mb-4">Despesas por Categoria</h3>
          {categoryBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={categoryBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={renderCustomLabel}>
                  {categoryBreakdown.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(222, 40%, 8%)', border: '1px solid hsl(222, 30%, 15%)', borderRadius: '8px', fontSize: '12px' }} formatter={(val: number) => formatCurrency(val)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center">
              <p className="text-muted-foreground text-sm">Sem despesas neste mês</p>
            </div>
          )}
          <div className="space-y-1 mt-2">
            {categoryBreakdown.slice(0, 4).map((c, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                  <span className="text-muted-foreground">{c.name}</span>
                </div>
                <span className="font-medium text-foreground">{formatCurrency(c.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 p-5 rounded-xl border border-border bg-card gradient-card">
          <h3 className="font-display font-semibold text-foreground mb-4">
            Alertas Financeiros
            {alerts.length > 0 && <span className="ml-2 px-1.5 py-0.5 rounded-full bg-expense-subtle text-expense text-xs">{alerts.length}</span>}
          </h3>
          {alerts.length > 0 ? (
            <div className="space-y-2">{alerts.map(alert => <AlertCard key={alert.id} alert={alert} />)}</div>
          ) : (
            <div className="text-center py-8">
              <div className="w-10 h-10 rounded-full bg-income-subtle flex items-center justify-center mx-auto mb-2"><Target className="w-5 h-5 text-income" /></div>
              <p className="text-sm text-muted-foreground">Nenhum alerta ativo. Ótimo trabalho!</p>
            </div>
          )}
        </div>

        <div className="p-5 rounded-xl border border-border bg-card gradient-card flex flex-col items-center justify-center text-center">
          <h3 className="font-display font-semibold text-foreground mb-4">Índice de Liberdade</h3>
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(222, 35%, 14%)" strokeWidth="10" />
              <circle cx="50" cy="50" r="42" fill="none"
                stroke={freedomIndex >= 70 ? 'hsl(152, 76%, 48%)' : freedomIndex >= 40 ? 'hsl(38, 92%, 50%)' : 'hsl(350, 89%, 60%)'}
                strokeWidth="10" strokeDasharray={`${2 * Math.PI * 42 * freedomIndex / 100} ${2 * Math.PI * 42}`}
                strokeLinecap="round" className="transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-display font-bold ${freedomColor}`}>{freedomIndex}</span>
              <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 max-w-[140px]">
            {freedomIndex >= 70 ? 'Excelente saúde financeira!' : freedomIndex >= 40 ? 'Há espaço para melhorar' : 'Atenção necessária'}
          </p>
          <div className="mt-4 w-full space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-muted-foreground">Taxa de poupança</span><span className="text-foreground font-medium">{formatPercent(summary?.savingsRate ?? 0)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Comprometimento</span><span className="text-foreground font-medium">{formatPercent(summary?.expenseRatio ?? 0)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
