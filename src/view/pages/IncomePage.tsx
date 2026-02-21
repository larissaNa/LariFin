import { useState } from 'react';
import { useIncome } from '../../viewmodel/IncomeViewModel';
import { MonthSelector } from '../components/MonthSelector';
import { MetricCard } from '../components/MetricCard';
import { formatCurrency, formatDate } from '../../lib/formatters';
import { Plus, Pencil, Trash2, TrendingUp, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Income } from '../../model/entities';

export function IncomePage() {
  const vm = useIncome();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [convertId, setConvertId] = useState<string | null>(null);
  const [convertAmount, setConvertAmount] = useState('');

  const [form, setForm] = useState({
    description: '', amount: '', type: 'real' as 'real' | 'estimated',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.amount) return;
    if (editingId) {
      vm.updateIncome(editingId, { description: form.description, amount: parseFloat(form.amount), type: form.type });
      setEditingId(null);
    } else {
      vm.addIncome({ description: form.description, amount: parseFloat(form.amount), type: form.type, month: vm.currentMonth, year: vm.currentYear });
    }
    setForm({ description: '', amount: '', type: 'real' });
    setShowForm(false);
  };

  const handleEdit = (income: Income) => {
    setForm({ description: income.description, amount: String(income.amount), type: income.type });
    setEditingId(income.id);
    setShowForm(true);
  };

  const handleConvert = (id: string) => {
    if (!convertAmount) return;
    vm.convertToReal(id, parseFloat(convertAmount));
    setConvertId(null);
    setConvertAmount('');
  };

  return (
    <div className="space-y-6 page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Receitas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gerencie suas entradas mensais</p>
        </div>
        <div className="flex items-center gap-3">
          <MonthSelector month={vm.currentMonth} year={vm.currentYear} onChange={vm.setMonth} />
          <button
            onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ description: '', amount: '', type: 'real' }); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-glow transition-colors shadow-primary"
          >
            <Plus className="w-4 h-4" />
            Nova Receita
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard title="Total Confirmado" value={vm.totalReal} variant="income" icon={<CheckCircle2 className="w-4 h-4" />} />
        <MetricCard title="Total Estimado" value={vm.totalEstimated} variant="warning" icon={<Clock className="w-4 h-4" />} />
        <MetricCard title="Total do Mês" value={vm.total} variant="income" icon={<TrendingUp className="w-4 h-4" />} />
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="p-5 rounded-xl border border-border bg-card gradient-card animate-scale-in space-y-4">
          <h3 className="font-display font-semibold">{editingId ? 'Editar Receita' : 'Nova Receita'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Descrição</label>
              <input
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Ex: Salário, Freelance..."
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Valor (R$)</label>
              <input
                type="number" step="0.01" min="0"
                value={form.amount}
                onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="0,00"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Tipo</label>
              <select
                value={form.type}
                onChange={e => setForm(p => ({ ...p, type: e.target.value as 'real' | 'estimated' }))}
                className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="real">Confirmado</option>
                <option value="estimated">Estimado</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-glow transition-colors">
              {editingId ? 'Salvar' : 'Adicionar'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-muted transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="rounded-xl border border-border bg-card gradient-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-display font-semibold">Lançamentos do Mês</h3>
        </div>
        {vm.incomes.length === 0 ? (
          <div className="py-12 text-center">
            <TrendingUp className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">Nenhuma receita registrada</p>
            <button onClick={() => setShowForm(true)} className="mt-3 text-primary text-sm hover:underline">Adicionar receita</button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {vm.incomes.map(income => (
              <div key={income.id} className="flex items-center justify-between p-4 hover:bg-card-elevated transition-colors">
                <div className="flex items-center gap-3">
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', income.type === 'real' ? 'bg-income-subtle' : 'bg-warning-subtle')}>
                    {income.type === 'real' ? <CheckCircle2 className="w-4 h-4 text-income" /> : <Clock className="w-4 h-4 text-warning" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{income.description}</p>
                    <div className="flex items-center gap-2">
                      <span className={cn('text-xs px-1.5 py-0.5 rounded-full font-medium', income.type === 'real' ? 'bg-income-subtle text-income' : 'bg-warning-subtle text-warning')}>
                        {income.type === 'real' ? 'Confirmado' : 'Estimado'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display font-bold text-income">{formatCurrency(income.amount)}</span>
                  <div className="flex gap-1">
                    {income.type === 'estimated' && (
                      <div className="flex items-center gap-1">
                        {convertId === income.id ? (
                          <>
                            <input
                              type="number" step="0.01" min="0"
                              value={convertAmount}
                              onChange={e => setConvertAmount(e.target.value)}
                              className="w-24 px-2 py-1 rounded bg-muted border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                              placeholder="Valor real"
                            />
                            <button onClick={() => handleConvert(income.id)} className="px-2 py-1 rounded bg-income text-income-foreground text-xs font-medium hover:bg-income/80 transition-colors">OK</button>
                            <button onClick={() => setConvertId(null)} className="px-2 py-1 rounded bg-secondary text-xs transition-colors">✕</button>
                          </>
                        ) : (
                          <button onClick={() => setConvertId(income.id)} className="px-2 py-1 rounded bg-income-subtle text-income text-xs font-medium hover:bg-income/20 transition-colors">
                            Confirmar
                          </button>
                        )}
                      </div>
                    )}
                    <button onClick={() => handleEdit(income)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => vm.deleteIncome(income.id)} className="p-1.5 rounded-lg hover:bg-expense-subtle text-muted-foreground hover:text-expense transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
