'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import Link from 'next/link';

export type StatCardVariant = 'profit' | 'approval' | 'budgets' | 'customers' | 'default';

const variantIconColors: Record<StatCardVariant, string> = {
  profit: 'text-emerald-600 dark:text-emerald-400',
  approval: 'text-blue-600 dark:text-blue-400',
  budgets: 'text-amber-600 dark:text-amber-400',
  customers: 'text-violet-600 dark:text-violet-400',
  default: 'text-muted-foreground',
};

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  isPositiveGood?: boolean;
  subtitle?: string;
  className?: string;
  href?: string;
  onClick?: () => void;
  variant?: StatCardVariant;
  'aria-describedby'?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  isPositiveGood = true,
  subtitle,
  className,
  href,
  onClick,
  variant = 'default',
  'aria-describedby': ariaDescribedBy,
}: StatCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const iconColor = variantIconColors[variant];

  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isGoodTrend = isPositiveGood ? isPositive : isNegative;
  const isBadTrend = isPositiveGood ? isNegative : isPositive;

  const isInteractive = !!href || !!onClick;

  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  const cardContent = (
    <Card
      className={cn(
        'transition-all duration-150 h-full',
        isInteractive && [
          'cursor-pointer',
          'hover:shadow-md',
          'hover:border-primary/30',
          'focus-visible:outline-none',
          'focus-visible:ring-2',
          'focus-visible:ring-primary',
          'focus-visible:ring-offset-2',
        ],
        !isInteractive && 'hover:shadow-sm',
      )}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive && !href ? 0 : undefined}
      onClick={!href ? onClick : undefined}
      onKeyDown={
        !href && onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      aria-describedby={ariaDescribedBy}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground leading-tight">
          {title}
        </CardTitle>
        {Icon && (
          <Icon
            className={cn('h-4 w-4 shrink-0 ml-2', iconColor)}
            aria-hidden="true"
          />
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <motion.div
          className="text-2xl font-bold tracking-tight"
          initial={prefersReducedMotion ? {} : { scale: 0.95, opacity: 0 }}
          animate={prefersReducedMotion ? {} : { scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {value}
        </motion.div>

        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}

        {change !== undefined && (
          <p className="text-xs text-muted-foreground mt-1">
            <span
              className={cn(
                'inline-flex items-center gap-0.5 font-medium',
                isGoodTrend && 'text-emerald-600 dark:text-emerald-400',
                isBadTrend && 'text-red-600 dark:text-red-400',
                !isGoodTrend && !isBadTrend && 'text-muted-foreground'
              )}
            >
              <TrendIcon className="h-3 w-3" aria-hidden="true" />
              {change > 0 ? '+' : ''}{change.toFixed(1)}%
            </span>
            {changeLabel && (
              <span className="ml-1">{changeLabel}</span>
            )}
          </p>
        )}
      </CardContent>
    </Card>
  );

  const wrappedContent = href ? (
    <Link href={href} className="block focus:outline-none h-full">
      {cardContent}
    </Link>
  ) : (
    cardContent
  );

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('h-full', className)}
    >
      {wrappedContent}
    </motion.div>
  );
}
