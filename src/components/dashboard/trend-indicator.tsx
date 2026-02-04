'use client';

import { getTrendColor, getTrendIcon, formatPercentage } from '@/lib/dashboard/formatters';
import { cn } from '@/lib/utils';

interface TrendIndicatorProps {
  value: number;
  isPositiveGood?: boolean;
  showPercentage?: boolean;
  className?: string;
}

export function TrendIndicator({
  value,
  isPositiveGood = true,
  showPercentage = true,
  className,
}: TrendIndicatorProps) {
  const color = getTrendColor(value, isPositiveGood);
  const icon = getTrendIcon(value);

  const trendDirection = value > 0 ? 'aumento' : value < 0 ? 'diminuição' : 'sem variação';
  const ariaLabel = `${trendDirection} de ${formatPercentage(Math.abs(value), { showSign: false })}`;

  return (
    <span
      className={cn('inline-flex items-center gap-1 text-sm font-medium', color, className)}
      aria-label={ariaLabel}
      role="status"
    >
      <span aria-hidden="true">{icon}</span>
      {showPercentage && (
        <span>{formatPercentage(Math.abs(value), { showSign: false })}</span>
      )}
    </span>
  );
}
