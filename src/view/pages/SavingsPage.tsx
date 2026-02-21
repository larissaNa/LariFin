import { useState } from 'react';
import { useSavings } from '../../viewmodel/SavingsViewModel';
import { MetricCard } from '../components/MetricCard';
import { formatCurrency, formatDate } from '../../lib/formatters';
import { Plus, PiggyBank, TrendingUp, ArrowUpCircle, ArrowDownCircle, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function SavingsPage() {
  const vm = useSavings();
  const [showForm, setShowForm] = useState(false);
  const [txForm, setTxForm] = useState<{ accountId: string; type: 'deposit' | 'withdraw'; amount: string } | null>(null);
  const [form, setForm] = useState({ name: '', currentAmount: '', annualYieldRate: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    vm.addAccount({ name: form.name, currentAmount: parseFloat(form.currentAmount), annualYieldRate: parseFloat(form.annualYieldRate) });
    setForm({ name: '', currentAmount: '', annualYieldRate: '' });
    setShowForm(false);
  };

  const handleTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txForm || !txForm.amount) return;
    if (txForm.type === 'deposit') vm.deposit(txForm.accountId, parseFloat(txForm.amount));
    else vm.withdraw(txForm.accountId, parseFloat(txForm.amount));
    setTxForm(null);
  };

  return (
    <div className="space-y-6 page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Reservas Financeiras</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gerencie suas poupanças e investimentos</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-glow transition-colors shadow-primary">
          <Plus className="w-4 h-4" /> Nova Reserva
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard title="Total em Reservas" value={vm.totalSavings} variant="savings" icon={<PiggyBank className="w-4 h-4" />} />
        <MetricCard title="Rendimento Mensal" value={vm.totalMonthlyYield} variant="income" icon={<TrendingUp className="w-4 h-4" />} />
        <MetricCard title="Rendimento Anual" value={vm.totalAnnualYield} subtitle="Projetado" variant="income" icon={<TrendingUp className="w-4 h-4" />} />
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-5 rounded-xl border border-border bg-card gradient-card animate-scale-in space-y-4">
          <h3 className="font-display font-semibold">Nova Reserva</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Nome</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Ex: Reserva de Emergência" required />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Valor Atual (R$)</label>
              <input type="number" step="0.01" min="0" value={form.currentAmount} onChange={e => setForm(p => ({ ...p, currentAmount: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="0,00" required />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Taxa Anual (%)</label>
              <input type="number" step="0.01" min="0" value={form.annualYieldRate} onChange={e => setForm(p => ({ ...p, annualYieldRate: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="12.75" required />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-glow transition-colors">Criar</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-muted transition-colors">Cancelar</button>
          </div>
        </form>
      )}

      {txForm && (
        <form onSubmit={handleTx} className="p-4 rounded-xl border border-border bg-card animate-scale-in flex items-end gap-3 flex-wrap">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
              {txForm.type === 'deposit' ? 'Valor do Depósito (R$)' : 'Valor do Saque (R$)'}
            </label>
            <input type="number" step="0.01" min="0" value={txForm.amount} onChange={e => setTxForm(p => p ? { ...p, amount: e.target.value } : null)}
              className="w-40 px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="0,00" autoFocus required />
          </div>
          <button type="submit" className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-colors', txForm.type === 'deposit' ? 'bg-income text-income-foreground hover:bg-income/80' : 'bg-expense text-expense-foreground hover:bg-expense/80')}>
            {txForm.type === 'deposit' ? 'Depositar' : 'Sacar'}
          </button>
          <button type="button" onClick={() => setTxForm(null)} className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium">Cancelar</button>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {vm.accounts.map(account => {
          const projection = vm.getProjection(account.id, 12);
          const chartData = projection.map(p => ({ name: p.label, valor: Math.round(p.amount) }));
          return (
            <div key={account.id} className="rounded-xl border border-savings/20 bg-card gradient-card overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-savings-subtle flex items-center justify-center">
                      <PiggyBank className="w-4 h-4 text-savings" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold">{account.name}</h3>
                      <p className="text-xs text-muted-foreground">{account.annualYieldRate}% a.a.</p>
                    </div>
                  </div>
                  <button onClick={() => vm.deleteAccount(account.id)} className="p-1.5 rounded-lg hover:bg-expense-subtle text-muted-foreground hover:text-expense transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-card-elevated rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Saldo Atual</p>
                    <p className="font-display font-bold text-savings text-sm">{formatCurrency(account.currentAmount)}</p>
                  </div>
                  <div className="bg-card-elevated rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Rend. Mensal</p>
                    <p className="font-display font-bold text-income text-sm">{formatCurrency(account.currentAmount * account.monthlyYieldRate)}</p>
                  </div>
                  <div className="bg-card-elevated rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Rend. Anual</p>
                    <p className="font-display font-bold text-income text-sm">{formatCurrency(account.currentAmount * account.annualYieldRate / 100)}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-2">Projeção 12 meses (juros compostos)</p>
                  <ResponsiveContainer width="100%" height={80}>
                    <LineChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                      <XAxis dataKey="name" hide />
                      <YAxis hide />
                      <Tooltip contentStyle={{ background: 'hsl(222, 40%, 8%)', border: '1px solid hsl(222, 30%, 15%)', borderRadius: '8px', fontSize: '11px' }} formatter={(v: number) => formatCurrency(v)} />
                      <Line type="monotone" dataKey="valor" stroke="hsl(200, 90%, 55%)" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setTxForm({ accountId: account.id, type: 'deposit', amount: '' })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-income-subtle text-income text-xs font-medium hover:bg-income/20 transition-colors flex-1 justify-center">
                    <ArrowUpCircle className="w-3.5 h-3.5" /> Depositar
                  </button>
                  <button onClick={() => setTxForm({ accountId: account.id, type: 'withdraw', amount: '' })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-expense-subtle text-expense text-xs font-medium hover:bg-expense/20 transition-colors flex-1 justify-center">
                    <ArrowDownCircle className="w-3.5 h-3.5" /> Sacar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
