import { useState } from 'react';
import { useDebts } from '../../viewmodel/DebtViewModel';
import { MetricCard } from '../components/MetricCard';
import { formatCurrency, formatDate } from '../../lib/formatters';
import { Plus, CreditCard, CheckCircle2, Trash2, ChevronDown, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Debt } from '../../model/entities';

export function DebtPage() {
  const vm = useDebts();
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    description: '', totalAmount: '', installmentValue: '', totalInstallments: '', remainingInstallments: '', startDate: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    vm.addDebt({
      description: form.description,
      totalAmount: parseFloat(form.totalAmount),
      installmentValue: parseFloat(form.installmentValue),
      totalInstallments: parseInt(form.totalInstallments),
      remainingInstallments: parseInt(form.remainingInstallments),
      startDate: new Date(form.startDate + 'T12:00:00'),
      status: 'active',
    });
    setForm({ description: '', totalAmount: '', installmentValue: '', totalInstallments: '', remainingInstallments: '', startDate: new Date().toISOString().split('T')[0] });
    setShowForm(false);
  };

  const getProgress = (debt: Debt) => {
    const paid = debt.totalInstallments - debt.remainingInstallments;
    return (paid / debt.totalInstallments) * 100;
  };

  return (
    <div className="space-y-6 page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Dívidas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Controle seus parcelamentos</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-glow transition-colors shadow-primary"
        >
          <Plus className="w-4 h-4" />
          Nova Dívida
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard title="Total Restante" value={vm.totalRemaining} variant="debt" icon={<CreditCard className="w-4 h-4" />} />
        <MetricCard title="Impacto Mensal" value={vm.totalMonthlyImpact} subtitle="Neste mês" variant="expense" icon={<Minus className="w-4 h-4" />} />
        <MetricCard title="Dívidas Ativas" value={vm.activeDebts.length} suffix="dívidas" variant="warning" icon={<CreditCard className="w-4 h-4" />} />
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="p-5 rounded-xl border border-border bg-card gradient-card animate-scale-in space-y-4">
          <h3 className="font-display font-semibold">Nova Dívida / Parcelamento</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Descrição</label>
              <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Ex: Celular, Cartão..." required />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Data de Início</label>
              <input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Valor Total (R$)</label>
              <input type="number" step="0.01" min="0" value={form.totalAmount} onChange={e => setForm(p => ({ ...p, totalAmount: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="0,00" required />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Valor da Parcela (R$)</label>
              <input type="number" step="0.01" min="0" value={form.installmentValue} onChange={e => setForm(p => ({ ...p, installmentValue: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="0,00" required />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Total de Parcelas</label>
              <input type="number" min="1" value={form.totalInstallments} onChange={e => setForm(p => ({ ...p, totalInstallments: e.target.value, remainingInstallments: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="12" required />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Parcelas Restantes</label>
              <input type="number" min="0" value={form.remainingInstallments} onChange={e => setForm(p => ({ ...p, remainingInstallments: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="12" required />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-glow transition-colors">Adicionar</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-muted transition-colors">Cancelar</button>
          </div>
        </form>
      )}

      {/* Active Debts */}
      <div className="space-y-3">
        <h3 className="font-display font-semibold text-foreground">Dívidas Ativas ({vm.activeDebts.length})</h3>
        {vm.activeDebts.length === 0 ? (
          <div className="py-10 text-center rounded-xl border border-border bg-card">
            <CheckCircle2 className="w-8 h-8 text-income mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">Sem dívidas ativas!</p>
          </div>
        ) : (
          vm.activeDebts.map(debt => {
            const progress = getProgress(debt);
            const remaining = debt.remainingInstallments * debt.installmentValue;
            const isExpanded = expandedId === debt.id;
            return (
              <div key={debt.id} className="rounded-xl border border-debt/20 bg-card gradient-card overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-debt-subtle flex items-center justify-center flex-shrink-0">
                        <CreditCard className="w-4 h-4 text-debt" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{debt.description}</p>
                        <p className="text-xs text-muted-foreground">Término: {formatDate(debt.endDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-sm font-bold text-debt">{formatCurrency(debt.installmentValue)}<span className="text-xs font-normal text-muted-foreground">/mês</span></p>
                        <p className="text-xs text-muted-foreground">Restam: {formatCurrency(remaining)}</p>
                      </div>
                      <button onClick={() => setExpandedId(isExpanded ? null : debt.id)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
                        <ChevronDown className={cn('w-4 h-4 transition-transform', isExpanded && 'rotate-180')} />
                      </button>
                    </div>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                      <span>{debt.totalInstallments - debt.remainingInstallments} de {debt.totalInstallments} parcelas pagas</span>
                      <span className="font-medium text-debt">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-debt rounded-full transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-border space-y-2 animate-fade-in">
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-card-elevated rounded-lg p-2 text-center">
                          <p className="text-muted-foreground">Valor Total</p>
                          <p className="font-bold text-foreground">{formatCurrency(debt.totalAmount)}</p>
                        </div>
                        <div className="bg-card-elevated rounded-lg p-2 text-center">
                          <p className="text-muted-foreground">Parcelas Rest.</p>
                          <p className="font-bold text-debt">{debt.remainingInstallments}</p>
                        </div>
                        <div className="bg-card-elevated rounded-lg p-2 text-center">
                          <p className="text-muted-foreground">Início</p>
                          <p className="font-bold text-foreground">{formatDate(debt.startDate)}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => vm.payInstallment(debt.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-income-subtle text-income text-xs font-medium hover:bg-income/20 transition-colors">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Pagar Parcela
                        </button>
                        <button onClick={() => vm.markAsPaid(debt.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-subtle text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Quitar Dívida
                        </button>
                        <button onClick={() => vm.deleteDebt(debt.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-expense-subtle text-expense text-xs font-medium hover:bg-expense/20 transition-colors ml-auto">
                          <Trash2 className="w-3.5 h-3.5" /> Excluir
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Paid Debts */}
      {vm.paidDebts.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-display font-semibold text-muted-foreground">Dívidas Quitadas ({vm.paidDebts.length})</h3>
          {vm.paidDebts.map(debt => (
            <div key={debt.id} className="rounded-xl border border-border bg-card p-4 opacity-60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-income" />
                <div>
                  <p className="text-sm font-medium line-through">{debt.description}</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(debt.totalAmount)}</p>
                </div>
              </div>
              <button onClick={() => vm.deleteDebt(debt.id)} className="p-1.5 rounded-lg hover:bg-expense-subtle text-muted-foreground hover:text-expense transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
