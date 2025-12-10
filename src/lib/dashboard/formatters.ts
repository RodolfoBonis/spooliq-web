import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Format currency in Brazilian Real (BRL)
 * @param valueInCents - Value in cents
 * @param options - Formatting options
 */
export function formatCurrency(
  valueInCents: number,
  options: { showSymbol?: boolean; compact?: boolean } = {}
): string {
  const { showSymbol = true, compact = false } = options;

  const value = valueInCents / 100;

  if (compact) {
    if (value >= 1_000_000) {
      return `${showSymbol ? 'R$ ' : ''}${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
      return `${showSymbol ? 'R$ ' : ''}${(value / 1_000).toFixed(1)}K`;
    }
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value);
}

/**
 * Format percentage
 * @param value - Percentage value (0-100)
 * @param options - Formatting options
 */
export function formatPercentage(
  value: number,
  options: { decimals?: number; showSign?: boolean } = {}
): string {
  const { decimals = 1, showSign = false } = options;

  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Format number with thousands separator
 * @param value - Number to format
 * @param options - Formatting options
 */
export function formatNumber(
  value: number,
  options: { decimals?: number; compact?: boolean } = {}
): string {
  const { decimals = 0, compact = false } = options;

  if (compact) {
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(1)}K`;
    }
  }

  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format weight in grams/kilograms
 * @param grams - Weight in grams
 */
export function formatWeight(grams: number): string {
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(2)} kg`;
  }
  return `${grams.toFixed(0)} g`;
}

/**
 * Format hours
 * @param hours - Hours as decimal
 */
export function formatHours(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)} min`;
  }

  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);

  if (m === 0) {
    return `${h}h`;
  }

  return `${h}h ${m}min`;
}

/**
 * Format date relative to now
 * @param dateString - ISO date string
 */
export function formatRelativeDate(dateString: string): string {
  const date = parseISO(dateString);

  if (isToday(date)) {
    return `Hoje às ${format(date, 'HH:mm')}`;
  }

  if (isYesterday(date)) {
    return `Ontem às ${format(date, 'HH:mm')}`;
  }

  return formatDistanceToNow(date, {
    addSuffix: true,
    locale: ptBR,
  });
}

/**
 * Format date for charts and tables
 * @param dateString - ISO date string or month format (YYYY-MM)
 * @param format - Display format
 */
export function formatChartDate(
  dateString: string,
  formatType: 'month' | 'day' | 'full' = 'month'
): string {
  // If it's a month format (YYYY-MM)
  if (dateString.match(/^\d{4}-\d{2}$/)) {
    const [year, month] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return format(date, 'MMM/yy', { locale: ptBR });
  }

  const date = parseISO(dateString);

  switch (formatType) {
    case 'month':
      return format(date, 'MMM/yy', { locale: ptBR });
    case 'day':
      return format(date, 'dd/MM', { locale: ptBR });
    case 'full':
      return format(date, 'dd/MM/yyyy', { locale: ptBR });
    default:
      return format(date, 'dd/MM/yyyy', { locale: ptBR });
  }
}

/**
 * Format budget status to human-readable
 * @param status - Budget status
 */
export function formatBudgetStatus(status: string): string {
  const statusMap: Record<string, string> = {
    draft: 'Rascunho',
    sent: 'Enviado',
    approved: 'Aprovado',
    rejected: 'Rejeitado',
    printing: 'Imprimindo',
    completed: 'Concluído',
  };

  return statusMap[status] || status;
}

/**
 * Format activity type to human-readable
 * @param type - Activity type
 */
export function formatActivityType(type: string): string {
  const typeMap: Record<string, string> = {
    budget_created: 'Orçamento criado',
    budget_sent: 'Orçamento enviado',
    budget_approved: 'Orçamento aprovado',
    budget_rejected: 'Orçamento rejeitado',
    budget_printing: 'Impressão iniciada',
    budget_completed: 'Orçamento concluído',
    customer_created: 'Cliente cadastrado',
  };

  return typeMap[type] || type;
}

/**
 * Get status color class
 * @param status - Budget status
 */
export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    draft: 'text-gray-500',
    sent: 'text-blue-500',
    approved: 'text-green-500',
    rejected: 'text-red-500',
    printing: 'text-purple-500',
    completed: 'text-green-600',
  };

  return colorMap[status] || 'text-gray-500';
}

/**
 * Get trend color based on value and context
 * @param value - The change value
 * @param isPositiveGood - Whether positive change is good (default: true)
 */
export function getTrendColor(value: number, isPositiveGood: boolean = true): string {
  if (value === 0) return 'text-gray-500 dark:text-gray-400';

  const isPositive = value > 0;
  const isGood = isPositiveGood ? isPositive : !isPositive;

  return isGood
    ? 'text-green-600 dark:text-green-400'
    : 'text-red-600 dark:text-red-400';
}

/**
 * Get trend icon based on value
 * @param value - The change value
 */
export function getTrendIcon(value: number): '↑' | '↓' | '→' {
  if (value > 0) return '↑';
  if (value < 0) return '↓';
  return '→';
}
