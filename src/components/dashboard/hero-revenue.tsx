'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardOverview } from '@/hooks/dashboard/use-dashboard-overview';
import { useRevenueTrend } from '@/hooks/dashboard/use-revenue-trend';
import { useDashboardStore } from '@/stores/dashboard-store';
import { formatCurrency, getTrendColor, getTrendIcon } from '@/lib/dashboard/formatters';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';
import { DashboardErrorState } from './error-state';
import { DashboardEmptyState } from './empty-state';
import { TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  YAxis,
} from 'recharts';

function HeroSkeleton() {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="pt-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-12 w-48" />
            <Skeleton className="h-5 w-40" />
          </div>
          <div className="w-full lg:w-64 h-24">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MiniSparkline({ data }: { data: { revenue: number }[] }) {
  if (data.length < 2) return null;

  return (
    <div className="w-full lg:w-64 h-20" role="img" aria-label="Gráfico de tendência de receita">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <defs>
            <linearGradient id="heroRevenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis hide domain={['dataMin', 'dataMax']} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="url(#heroRevenueGradient)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function HeroRevenue() {
  const prefersReducedMotion = useReducedMotion();
  const period = useDashboardStore((state) => state.period);
  const { data: overview, isLoading: overviewLoading, error: overviewError, refetch: refetchOverview } = useDashboardOverview();
  const { data: trend, isLoading: trendLoading, error: trendError, refetch: refetchTrend } = useRevenueTrend(period);

  const isLoading = overviewLoading || trendLoading;
  const error = overviewError || trendError;

  if (isLoading) {
    return <HeroSkeleton />;
  }

  if (error) {
    return (
      <DashboardErrorState
        title="Erro ao carregar receita"
        message="Não foi possível carregar os dados de receita."
        onRetry={() => {
          refetchOverview();
          refetchTrend();
        }}
      />
    );
  }

  if (!overview) {
    return (
      <DashboardEmptyState
        type="revenue"
        title="Sem dados de receita"
        description="Nenhum orçamento aprovado foi registrado neste período."
      />
    );
  }

  const revenue = overview.total_revenue;
  const change = overview.revenue_change;
  const trendColor = getTrendColor(change, true);
  const trendIcon = getTrendIcon(change);

  const TrendIcon = change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus;

  // Prepare sparkline data (last 7 points or all available)
  const sparklineData = trend?.points?.slice(-7).map((point) => ({
    revenue: point.revenue / 100,
  })) ?? [];

  const periodLabels: Record<string, string> = {
    '7d': 'últimos 7 dias',
    '30d': 'últimos 30 dias',
    '3m': 'últimos 3 meses',
    '6m': 'últimos 6 meses',
    '1y': 'último ano',
    'all': 'todo o período',
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Link
        href="/budgets?status=approved"
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
      >
        <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-[1.01] cursor-pointer group">
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Main revenue display */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Receita Total ({periodLabels[period] ?? period})
                </p>
                <motion.p
                  className="text-4xl lg:text-5xl font-bold tracking-tight"
                  initial={prefersReducedMotion ? {} : { scale: 0.9, opacity: 0 }}
                  animate={prefersReducedMotion ? {} : { scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  {formatCurrency(revenue)}
                </motion.p>

                {/* Trend indicator */}
                <div className="flex items-center gap-2">
                  <motion.div
                    className={cn(
                      'flex items-center gap-1.5 px-2 py-1 rounded-full text-sm font-medium',
                      change > 0 && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                      change < 0 && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                      change === 0 && 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    )}
                    initial={prefersReducedMotion ? {} : { x: -10, opacity: 0 }}
                    animate={prefersReducedMotion ? {} : { x: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <TrendIcon className="h-4 w-4" aria-hidden="true" />
                    <span>{Math.abs(change).toFixed(1)}%</span>
                  </motion.div>
                  <span className="text-sm text-muted-foreground">
                    vs período anterior
                  </span>
                </div>
              </div>

              {/* Sparkline chart */}
              <div className="flex items-center gap-4">
                <MiniSparkline data={sparklineData} />
                <ArrowRight
                  className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-hidden="true"
                />
              </div>
            </div>
          </CardContent>

          {/* Decorative gradient bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/80 via-primary to-primary/80" />
        </Card>
      </Link>
    </motion.div>
  );
}
