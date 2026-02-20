'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartSkeleton } from './metric-skeleton';
import { DashboardErrorState } from './error-state';
import { DashboardEmptyState } from './empty-state';
import { useTopFilaments } from '@/hooks/dashboard/use-top-filaments';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { formatWeight } from '@/lib/dashboard/formatters';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Package } from 'lucide-react';

// Default colors for filaments without color_hex
const defaultColors = [
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#EF4444', // red
  '#F97316', // orange
  '#22C55E', // green
];

export function TopFilamentsChart() {
  const prefersReducedMotion = useReducedMotion();
  const { data, isLoading, error, refetch } = useTopFilaments();

  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (error) {
    return (
      <DashboardErrorState
        title="Erro ao carregar filamentos"
        message="Não foi possível carregar os dados de uso de filamentos."
        onRetry={() => refetch()}
      />
    );
  }

  if (!data || data.filaments.length === 0) {
    return (
      <DashboardEmptyState
        type="filaments"
        title="Nenhum filamento usado"
        description="Os filamentos utilizados nos orçamentos aparecerão aqui."
      />
    );
  }

  const chartData = data.filaments.map((filament, index) => ({
    name: `${filament.brand_name} ${filament.name}`,
    shortName: filament.name,
    usage: filament.total_grams,
    count: filament.usage_count,
    material: filament.material_name,
    colorHex: filament.color_hex || defaultColors[index % defaultColors.length],
  }));

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" aria-hidden="true" />
            Top Filamentos
          </CardTitle>
          <CardDescription>
            Filamentos mais utilizados por quantidade
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
                    background: filament.colorHex,
                  }}
                  aria-hidden="true"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{filament.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatWeight(filament.usage)} · {filament.count}x usado
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Bar Chart */}
          <div role="img" aria-label="Gráfico de barras mostrando os filamentos mais utilizados">
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

                    const item = payload[0].payload;

                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-lg">
                        <div className="grid gap-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ background: item.colorHex }}
                              aria-hidden="true"
                            />
                            <span className="font-semibold text-sm">{item.name}</span>
                          </div>
                          <div className="grid gap-1 text-sm">
                            <div className="flex justify-between gap-4">
                              <span className="text-muted-foreground">Material:</span>
                              <span className="font-medium">{item.material}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-muted-foreground">Quantidade:</span>
                              <span className="font-medium">{formatWeight(item.usage)}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-muted-foreground">Vezes usado:</span>
                              <span className="font-medium">{item.count}x</span>
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
                      fill={entry.colorHex}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
