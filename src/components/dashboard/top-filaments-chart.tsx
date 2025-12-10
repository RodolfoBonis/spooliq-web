'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartSkeleton } from './metric-skeleton';
import { useTopFilaments } from '@/hooks/dashboard/use-top-filaments';
import { formatCurrency, formatWeight } from '@/lib/dashboard/formatters';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Package } from 'lucide-react';

export function TopFilamentsChart() {
  const { data, isLoading } = useTopFilaments();

  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (!data || data.filaments.length === 0) return null;

  const chartData = data.filaments.map((filament) => ({
    name: `${filament.brand} ${filament.name}`,
    shortName: filament.name,
    usage: filament.total_grams,
    value: filament.total_value / 100, // Convert to reais
    count: filament.usage_count,
    color: filament.color,
    colorPreview: filament.color_preview,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Top Filamentos
          </CardTitle>
          <CardDescription>
            Filamentos mais utilizados por quantidade e valor
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Legend with color previews */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {chartData.map((filament, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
              >
                <div
                  className="h-4 w-4 rounded-full border-2 border-background shadow-sm flex-shrink-0"
                  style={{
                    background: filament.colorPreview,
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{filament.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatWeight(filament.usage)} • {filament.count}x usado
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Bar Chart */}
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="shortName"
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => formatWeight(value)}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;

                  const data = payload[0].payload;

                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-lg">
                      <div className="grid gap-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ background: data.colorPreview }}
                          />
                          <span className="font-semibold text-sm">{data.name}</span>
                        </div>
                        <div className="grid gap-1 text-sm">
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Quantidade:</span>
                            <span className="font-medium">{formatWeight(data.usage)}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Valor:</span>
                            <span className="font-medium">
                              {formatCurrency(data.value * 100)}
                            </span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Vezes usado:</span>
                            <span className="font-medium">{data.count}x</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="usage"
                radius={[8, 8, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.colorPreview}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
