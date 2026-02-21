import { useState } from 'react';
import { useExpenses } from '../../viewmodel/ExpenseViewModel';
import { MonthSelector } from '../components/MonthSelector';
import { MetricCard } from '../components/MetricCard';
import { formatCurrency, formatDate } from '../../lib/formatters';
import { Plus, Pencil, Trash2, Receipt, Filter, SlidersHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Expense } from '../../model/entities';

export function ExpensePage() {
  const vm = useExpenses();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [form, setForm] = useState({
    description: '', amount: '', categoryId: '', date: new Date().toISOString().split('T')[0], isFixed: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.amount || !form.categoryId) return;
    if (editingId) {
      vm.updateExpense(editingId, { description: form.description, amount: parseFloat(form.amount), categoryId: form.categoryId, date: new Date(form.date), isFixed: form.isFixed });
      setEditingId(null);
    } else {
      vm.addExpense({ description: form.description, amount: parseFloat(form.amount), categoryId: form.categoryId, date: new Date(form.date + 'T12:00:00'), isFixed: form.isFixed });
    }
    setForm({ description: '', amount: '', categoryId: '', date: new Date().toISOString().split('T')[0], isFixed: false });
    setShowForm(false);
  };

  const handleEdit = (expense: Expense) => {
    setForm({ description: expense.description, amount: String(expense.amount), categoryId: expense.categoryId, date: new Date(expense.date).toISOString().split('T')[0], isFixed: expense.isFixed });
    setEditingId(expense.id);
    setShowForm(true);
  };

  const getCategoryName = (id: string) => vm.categories.find(c => c.id === id)?.name ?? '—';
  const getCategoryColor = (id: string) => vm.categories.find(c => c.id === id)?.color ?? '#6b7280';

  return (
    <div className="space-y-6 page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Despesas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Controle seus gastos mensais</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <MonthSelector month={vm.currentMonth} year={vm.currentYear} onChange={vm.setMonth} />
          <button onClick={() => setShowFilters(!showFilters)} className={cn('p-2 rounded-lg border transition-colors', showFilters ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border text-muted-foreground hover:text-foreground')}>
            <Filter className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ description: '', amount: '', categoryId: vm.categories[0]?.id ?? '', date: new Date().toISOString().split('T')[0], isFixed: false }); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-glow transition-colors shadow-primary"
          >
            <Plus className="w-4 h-4" />
            Nova Despesa
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard title="Total de Despesas" value={vm.total} variant="expense" icon={<Receipt className="w-4 h-4" />} />
        <MetricCard title="Gastos Fixos" value={vm.fixedTotal} subtitle="Recorrentes" variant="debt" icon={<SlidersHorizontal className="w-4 h-4" />} />
        <MetricCard title="Gastos Variáveis" value={vm.variableTotal} variant="warning" icon={<Receipt className="w-4 h-4" />} />
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-4 rounded-xl border border-border bg-card gradient-card animate-scale-in flex flex-wrap gap-3 items-center">
          <span className="text-sm font-medium text-muted-foreground">Filtros:</span>
          <select
            value={vm.filterCategory ?? ''}
            onChange={e => vm.setFilterCategory(e.target.value || null)}
            className="px-3 py-1.5 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Todas as categorias</option>
            {vm.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select
            value={vm.filterFixed === null ? '' : String(vm.filterFixed)}
            onChange={e => vm.setFilterFixed(e.target.value === '' ? null : e.target.value === 'true')}
            className="px-3 py-1.5 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Fixo e variável</option>
            <option value="true">Somente fixos</option>
            <option value="false">Somente variáveis</option>
          </select>
          <button onClick={() => { vm.setFilterCategory(null); vm.setFilterFixed(null); }} className="text-xs text-muted-foreground hover:text-foreground underline">Limpar</button>
          <span className="text-xs text-muted-foreground ml-auto">{vm.filteredExpenses.length} resultado(s)</span>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="p-5 rounded-xl border border-border bg-card gradient-card animate-scale-in space-y-4">
          <h3 className="font-display font-semibold">{editingId ? 'Editar Despesa' : 'Nova Despesa'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Descrição</label>
              <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Ex: Supermercado..." required />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Valor (R$)</label>
              <input type="number" step="0.01" min="0" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="0,00" required />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Categoria</label>
              <select value={form.categoryId} onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary" required>
                <option value="">Selecionar...</option>
                {vm.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Data</label>
              <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isFixed} onChange={e => setForm(p => ({ ...p, isFixed: e.target.checked }))} className="w-4 h-4 accent-primary" />
            <span className="text-sm text-muted-foreground">Gasto fixo (recorrente)</span>
          </label>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-glow transition-colors">{editingId ? 'Salvar' : 'Adicionar'}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-muted transition-colors">Cancelar</button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="rounded-xl border border-border bg-card gradient-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-display font-semibold">Lançamentos</h3>
          <span className="text-xs text-muted-foreground">{vm.filteredExpenses.length} item(ns)</span>
        </div>
        {vm.filteredExpenses.length === 0 ? (
          <div className="py-12 text-center">
            <Receipt className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">Nenhuma despesa encontrada</p>
            <button onClick={() => setShowForm(true)} className="mt-3 text-primary text-sm hover:underline">Adicionar despesa</button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {vm.filteredExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(expense => (
              <div key={expense.id} className="flex items-center justify-between p-4 hover:bg-card-elevated transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${getCategoryColor(expense.categoryId)}20` }}>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getCategoryColor(expense.categoryId) }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{expense.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{formatDate(expense.date)}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-card-elevated" style={{ color: getCategoryColor(expense.categoryId) }}>
                        {getCategoryName(expense.categoryId)}
                      </span>
                      {expense.isFixed && <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary-subtle text-primary">Fixo</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display font-bold text-expense">{formatCurrency(expense.amount)}</span>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(expense)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => vm.deleteExpense(expense.id)} className="p-1.5 rounded-lg hover:bg-expense-subtle text-muted-foreground hover:text-expense transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
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
