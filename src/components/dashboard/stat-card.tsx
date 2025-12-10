'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getTrendColor, getTrendIcon } from '@/lib/dashboard/formatters';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  isPositiveGood?: boolean;
  subtitle?: string;
  className?: string;
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
}: StatCardProps) {
  const trendColor = change !== undefined ? getTrendColor(change, isPositiveGood) : undefined;
  const trendIcon = change !== undefined ? getTrendIcon(change) : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={className}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          {Icon && (
            <Icon className="h-4 w-4 text-muted-foreground" />
          )}
        </CardHeader>
        <CardContent>
          <motion.div
            className="text-2xl font-bold"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {value}
          </motion.div>

          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}

          {change !== undefined && (
            <p className={cn('text-xs mt-1 flex items-center gap-1', trendColor)}>
              <span className="font-semibold">{trendIcon}</span>
              <span>
                {Math.abs(change).toFixed(1)}%
                {changeLabel && ` ${changeLabel}`}
              </span>
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
