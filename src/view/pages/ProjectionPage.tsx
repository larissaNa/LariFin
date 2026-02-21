import { useState } from 'react';
import { useProjection } from '../../viewmodel/ProjectionViewModel';
import { formatCurrency } from '../../lib/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { AlertTriangle, TrendingDown, Calculator } from 'lucide-react';
import { cn } from '../../lib/utils';

export function ProjectionPage() {
  const vm = useProjection();
  const [simValue, setSimValue] = useState('');

  const historyData = vm.history.map(h => ({
    name: h.label,
    receitas: Math.round(h.projectedIncome),
    despesas: Math.round(h.projectedExpenses),
    saldo: Math.round(h.projectedBalance),
    isFuture: h.projectedIncome === 0 && h.projectedExpenses === 0,
  }));

  const projectionData = vm.projections.map(p => ({
    name: p.label,
    receitas: Math.round(p.projectedIncome),
    despesas: Math.round(p.projectedExpenses),
    saldo: Math.round(p.projectedBalance),
    isNegative: p.isNegative,
    isTight: p.isTight,
  }));

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simValue) return;
    vm.simulate(parseFloat(simValue));
  };

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-display font-bold">Planejamento Futuro</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Projeções e análises financeiras</p>
      </div>

      {/* Risk months */}
      {(vm.negativeMonths.length > 0 || vm.tightMonths.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {vm.negativeMonths.length > 0 && (
            <div className="p-4 rounded-xl border border-expense/30 bg-expense-subtle flex gap-3">
              <TrendingDown className="w-5 h-5 text-expense flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-expense">Meses com saldo negativo</p>
                <p className="text-xs text-muted-foreground mt-1">{vm.negativeMonths.map(m => m.label).join(', ')}</p>
              </div>
            </div>
          )}
          {vm.tightMonths.length > 0 && (
            <div className="p-4 rounded-xl border border-warning/30 bg-warning-subtle flex gap-3">
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-warning">Meses apertados (&lt;10% margem)</p>
                <p className="text-xs text-muted-foreground mt-1">{vm.tightMonths.map(m => m.label).join(', ')}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Projeção 6 meses */}
      <div className="p-5 rounded-xl border border-border bg-card gradient-card">
        <h3 className="font-display font-semibold mb-4">Projeção — Próximos 6 Meses</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
          {projectionData.map((p, i) => (
            <div key={i} className={cn('p-3 rounded-lg text-center border', p.isNegative ? 'border-expense/30 bg-expense-subtle' : p.isTight ? 'border-warning/30 bg-warning-subtle' : 'border-border bg-card-elevated')}>
              <p className="text-xs text-muted-foreground capitalize">{p.name}</p>
              <p className={cn('font-display font-bold text-sm mt-1', p.isNegative ? 'text-expense' : p.isTight ? 'text-warning' : 'text-income')}>
                {formatCurrency(p.saldo)}
              </p>
              {p.isNegative && <p className="text-xs text-expense mt-0.5">⚠ Negativo</p>}
              {p.isTight && !p.isNegative && <p className="text-xs text-warning mt-0.5">⚡ Apertado</p>}
            </div>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={projectionData} margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 15%)" />
            <XAxis dataKey="name" tick={{ fill: 'hsl(215, 20%, 50%)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'hsl(215, 20%, 50%)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ background: 'hsl(222, 40%, 8%)', border: '1px solid hsl(222, 30%, 15%)', borderRadius: '8px', fontSize: '12px' }} formatter={(val: number) => formatCurrency(val)} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
            <ReferenceLine y={0} stroke="hsl(215, 20%, 50%)" strokeDasharray="4 4" />
            <Bar dataKey="receitas" name="Receitas" fill="hsl(152, 76%, 48%)" radius={[4, 4, 0, 0]} opacity={0.8} />
            <Bar dataKey="despesas" name="Despesas" fill="hsl(350, 89%, 60%)" radius={[4, 4, 0, 0]} opacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Histórico */}
      <div className="p-5 rounded-xl border border-border bg-card gradient-card">
        <h3 className="font-display font-semibold mb-4">Histórico — Últimos 12 Meses</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={historyData} margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 15%)" />
            <XAxis dataKey="name" tick={{ fill: 'hsl(215, 20%, 50%)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'hsl(215, 20%, 50%)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ background: 'hsl(222, 40%, 8%)', border: '1px solid hsl(222, 30%, 15%)', borderRadius: '8px', fontSize: '12px' }} formatter={(val: number) => formatCurrency(val)} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
            <ReferenceLine y={0} stroke="hsl(215, 20%, 50%)" strokeDasharray="4 4" />
            <Bar dataKey="receitas" name="Receitas" fill="hsl(152, 76%, 48%)" radius={[4, 4, 0, 0]} opacity={0.7} />
            <Bar dataKey="despesas" name="Despesas" fill="hsl(350, 89%, 60%)" radius={[4, 4, 0, 0]} opacity={0.7} />
            <Bar dataKey="saldo" name="Saldo" fill="hsl(200, 90%, 55%)" radius={[4, 4, 0, 0]} opacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Simulator */}
      <div className="p-5 rounded-xl border border-border bg-card gradient-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-primary-subtle flex items-center justify-center">
            <Calculator className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-semibold">Simulador: "E se eu gastar X?"</h3>
            <p className="text-xs text-muted-foreground">Veja o impacto de um gasto no mês atual</p>
          </div>
        </div>
        <form onSubmit={handleSimulate} className="flex items-end gap-3 flex-wrap">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Valor do Gasto (R$)</label>
            <input type="number" step="0.01" min="0" value={simValue} onChange={e => setSimValue(e.target.value)}
              className="w-48 px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Ex: 500,00" />
          </div>
          <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-glow transition-colors">Simular</button>
          {vm.simulatorResult && (
            <button type="button" onClick={vm.clearSimulation} className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium">Limpar</button>
          )}
        </form>
        {vm.simulatorResult && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in">
            <div className="bg-card-elevated rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Saldo Atual</p>
              <p className="font-display font-bold text-foreground">{formatCurrency(vm.simulatorResult.originalBalance)}</p>
            </div>
            <div className="bg-card-elevated rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Impacto</p>
              <p className="font-display font-bold text-expense">{formatCurrency(vm.simulatorResult.difference)}</p>
            </div>
            <div className={cn('rounded-lg p-4 text-center border', vm.simulatorResult.isStillPositive ? 'bg-income-subtle border-income/20' : 'bg-expense-subtle border-expense/20')}>
              <p className="text-xs text-muted-foreground mb-1">Novo Saldo</p>
              <p className={cn('font-display font-bold', vm.simulatorResult.isStillPositive ? 'text-income' : 'text-expense')}>
                {formatCurrency(vm.simulatorResult.newBalance)}
              </p>
              <p className={cn('text-xs mt-1', vm.simulatorResult.isStillPositive ? 'text-income' : 'text-expense')}>
                {vm.simulatorResult.isStillPositive ? '✓ Saldo positivo' : '⚠ Saldo negativo!'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
