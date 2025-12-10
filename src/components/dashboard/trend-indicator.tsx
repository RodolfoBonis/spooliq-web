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

  return (
    <span className={cn('inline-flex items-center gap-1 text-sm font-medium', color, className)}>
      <span>{icon}</span>
      {showPercentage && <span>{formatPercentage(Math.abs(value), { showSign: false })}</span>}
    </span>
  );
}
