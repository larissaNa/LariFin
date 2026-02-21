import { formatCurrency } from '../../lib/formatters';
import { cn } from '../../lib/utils';

interface MetricCardProps {
  title: string;
  value: number;
  subtitle?: string;
  variant?: 'default' | 'income' | 'expense' | 'debt' | 'savings' | 'warning';
  icon?: React.ReactNode;
  trend?: { value: number; label: string };
  className?: string;
  prefix?: string;
  suffix?: string;
  loading?: boolean;
}

export function MetricCard({
  title, value, subtitle, variant = 'default', icon, trend, className, prefix, suffix, loading
}: MetricCardProps) {
  const isPositive = value >= 0;
  const displayValue = prefix ? `${prefix}${formatCurrency(Math.abs(value))}` : formatCurrency(value);

  const variantConfig = {
    default: {
      container: 'border-border',
      iconBg: 'bg-primary-subtle',
      iconColor: 'text-primary',
      valueColor: 'text-foreground',
    },
    income: {
      container: 'border-income/20',
      iconBg: 'bg-income-subtle',
      iconColor: 'text-income',
      valueColor: 'text-income',
    },
    expense: {
      container: 'border-expense/20',
      iconBg: 'bg-expense-subtle',
      iconColor: 'text-expense',
      valueColor: 'text-expense',
    },
    debt: {
      container: 'border-debt/20',
      iconBg: 'bg-debt-subtle',
      iconColor: 'text-debt',
      valueColor: 'text-debt',
    },
    savings: {
      container: 'border-savings/20',
      iconBg: 'bg-savings-subtle',
      iconColor: 'text-savings',
      valueColor: 'text-savings',
    },
    warning: {
      container: 'border-warning/20',
      iconBg: 'bg-warning-subtle',
      iconColor: 'text-warning',
      valueColor: 'text-warning',
    },
  };

  const config = variantConfig[variant];

  return (
    <div className={cn(
      'relative p-5 rounded-xl border bg-card gradient-card overflow-hidden transition-all duration-200 hover:border-border/80',
      config.container, className
    )}>
      {loading && (
        <div className="absolute inset-0 bg-card/80 flex items-center justify-center rounded-xl">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {icon && (
          <div className={cn('p-2 rounded-lg', config.iconBg)}>
            <div className={cn('w-4 h-4', config.iconColor)}>{icon}</div>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className={cn('text-2xl font-bold font-display animate-count', config.valueColor)}>
          {!isPositive && variant === 'default' && <span className="text-expense">-</span>}
          {displayValue}
          {suffix && <span className="text-base font-normal text-muted-foreground ml-1">{suffix}</span>}
        </div>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <span className={cn('text-xs font-medium', trend.value >= 0 ? 'text-income' : 'text-expense')}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value).toFixed(1)}%
            </span>
            <span className="text-xs text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </div>
    </div>
  );
}
