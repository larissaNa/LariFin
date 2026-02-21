export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatMonth(month: number, year: number): string {
  const date = new Date(year, month - 1, 1);
  return date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
}

export function formatShortMonth(month: number, year: number): string {
  const date = new Date(year, month - 1, 1);
  return date.toLocaleString('pt-BR', { month: 'short', year: '2-digit' });
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('pt-BR');
}

export function formatDateInput(date: Date): string {
  return date.toISOString().split('T')[0];
}

export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];
