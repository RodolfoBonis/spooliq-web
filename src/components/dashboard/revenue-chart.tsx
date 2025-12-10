'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartSkeleton } from './metric-skeleton';
import { useRevenueTrend } from '@/hooks/dashboard/use-revenue-trend';
import { useDashboardStore } from '@/stores/dashboard-store';
import { formatCurrency, formatChartDate } from '@/lib/dashboard/formatters';
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
  const period = useDashboardStore((state) => state.period);
  const { data, isLoading } = useRevenueTrend(period);

  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (!data) return null;

  const chartData = data.data.map((item) => ({
    month: formatChartDate(item.month),
    revenue: item.revenue / 100, // Convert cents to reais
    pipeline: item.pipeline / 100,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Receita e Pipeline</CardTitle>
          <CardDescription>
            Receita realizada vs orçamentos em negociação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorPipeline" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="month"
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
                            {payload[0].payload.month}
                          </span>
                        </div>
                        {payload.map((entry, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: entry.color }}
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
                dataKey="pipeline"
                name="Pipeline"
                stroke="hsl(var(--chart-2))"
                fillOpacity={1}
                fill="url(#colorPipeline)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
