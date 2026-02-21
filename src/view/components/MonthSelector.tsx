import { cn } from '../../lib/utils';
import { MONTH_NAMES } from '../../lib/formatters';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthSelectorProps {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
  className?: string;
}

export function MonthSelector({ month, year, onChange, className }: MonthSelectorProps) {
  const prev = () => {
    if (month === 1) onChange(12, year - 1);
    else onChange(month - 1, year);
  };

  const next = () => {
    const now = new Date();
    const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear();
    if (!isCurrentMonth) {
      if (month === 12) onChange(1, year + 1);
      else onChange(month + 1, year);
    }
  };

  const now = new Date();
  const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear();

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <button
        onClick={prev}
        className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <span className="font-display font-semibold text-sm min-w-[140px] text-center capitalize">
        {MONTH_NAMES[month - 1]} {year}
      </span>
      <button
        onClick={next}
        disabled={isCurrentMonth}
        className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
