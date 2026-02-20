'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartSkeleton } from './metric-skeleton';
import { DashboardErrorState } from './error-state';
import { DashboardEmptyState } from './empty-state';
import { useRevenueTrend } from '@/hooks/dashboard/use-revenue-trend';
import { useDashboardStore } from '@/stores/dashboard-store';
import { formatCurrency, formatChartDate } from '@/lib/dashboard/formatters';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export function RevenueChart() {
  const prefersReducedMotion = useReducedMotion();
  const period = useDashboardStore((state) => state.period);
  const { data, isLoading, error, refetch } = useRevenueTrend(period);

  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (error) {
    return (
      <DashboardErrorState
        title="Erro ao carregar gráfico"
        message="Não foi possível carregar os dados de receita, custo e lucro."
        onRetry={() => refetch()}
      />
    );
  }

  if (!data || !data.points?.length) {
    return (
      <DashboardEmptyState
        type="revenue"
        title="Nenhum dado no período"
        description="Não há dados de receita registrados no período selecionado. Aprove orçamentos para começar a ver a evolução."
      />
    );
  }

  const chartData = data.points.map((item) => ({
    date: formatChartDate(item.date),
    revenue: item.revenue / 100,
    cost: item.cost / 100,
    profit: item.profit / 100,
  }));

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Receita, Custo e Lucro</CardTitle>
          <CardDescription>
            Receita realizada vs custos e margem de lucro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div role="img" aria-label="Gráfico de área mostrando receita, custo e lucro ao longo do tempo">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) =>
                    formatCurrency(value * 100, { compact: true })
                  }
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;

                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-sm">
                        <div className="grid gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              {payload[0].payload.date}
                            </span>
                          </div>
                          {payload.map((entry, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: entry.color }}
                                aria-hidden="true"
                              />
                              <span className="text-sm font-medium">
                                {entry.name}:
                              </span>
                              <span className="text-sm font-bold">
                                {formatCurrency((entry.value as number) * 100)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => (
                    <span className="text-sm text-muted-foreground">{value}</span>
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Receita"
                  stroke="hsl(var(--chart-1))"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="cost"
                  name="Custo"
                  stroke="hsl(var(--chart-2))"
                  fillOpacity={1}
                  fill="url(#colorCost)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  name="Lucro"
                  stroke="hsl(var(--chart-3))"
                  fillOpacity={1}
                  fill="url(#colorProfit)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
