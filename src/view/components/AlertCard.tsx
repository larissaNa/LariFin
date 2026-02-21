import { FinancialAlert } from '../../model/entities';
import { cn } from '../../lib/utils';
import { AlertTriangle, Info, XCircle } from 'lucide-react';

interface AlertCardProps {
  alert: FinancialAlert;
}

export function AlertCard({ alert }: AlertCardProps) {
  const config = {
    warning: {
      border: 'border-warning/30',
      bg: 'bg-warning-subtle',
      icon: <AlertTriangle className="w-4 h-4 text-warning" />,
      titleColor: 'text-warning',
    },
    danger: {
      border: 'border-expense/30',
      bg: 'bg-expense-subtle',
      icon: <XCircle className="w-4 h-4 text-expense" />,
      titleColor: 'text-expense',
    },
    info: {
      border: 'border-savings/30',
      bg: 'bg-savings-subtle',
      icon: <Info className="w-4 h-4 text-savings" />,
      titleColor: 'text-savings',
    },
  };

  const c = config[alert.type];

  return (
    <div className={cn('flex gap-3 p-3 rounded-lg border', c.border, c.bg)}>
      <div className="mt-0.5 flex-shrink-0">{c.icon}</div>
      <div>
        <p className={cn('text-xs font-semibold', c.titleColor)}>{alert.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
      </div>
    </div>
  );
}
