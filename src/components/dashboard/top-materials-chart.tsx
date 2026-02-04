'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartSkeleton } from './metric-skeleton';
import { DashboardErrorState } from './error-state';
import { DashboardEmptyState } from './empty-state';
import { useTopMaterials } from '@/hooks/dashboard/use-top-materials';
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
import { Layers } from 'lucide-react';

// Standard colors for common material types
const materialColors: Record<string, string> = {
  PLA: '#3B82F6', // Blue
  PETG: '#8B5CF6', // Purple
  ABS: '#EF4444', // Red
  TPU: '#F97316', // Orange
  ASA: '#EAB308', // Yellow
  Nylon: '#22C55E', // Green
  PC: '#06B6D4', // Cyan
  HIPS: '#84CC16', // Lime
  PVA: '#EC4899', // Pink
};

const defaultColors = ['#6B7280', '#9CA3AF', '#D1D5DB', '#4B5563', '#374151'];

export function TopMaterialsChart() {
  const prefersReducedMotion = useReducedMotion();
  const { data, isLoading, error, refetch } = useTopMaterials();

  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (error) {
    return (
      <DashboardErrorState
        title="Erro ao carregar materiais"
        message="Não foi possível carregar os dados de uso de materiais."
        onRetry={() => refetch()}
      />
    );
  }

  if (!data || data.materials.length === 0) {
    return (
      <DashboardEmptyState
        type="materials"
        title="Nenhum material registrado"
        description="Cadastre materiais no catálogo para ver estatísticas de uso."
      />
    );
  }

  // Calculate total for percentage computation
  const totalGrams = data.materials.reduce((sum, m) => sum + m.total_grams, 0);

  const chartData = data.materials.map((material, index) => ({
    name: material.name,
    usage: material.total_grams,
    usageCount: material.usage_count,
    percentage: totalGrams > 0
      ? parseFloat(((material.total_grams / totalGrams) * 100).toFixed(1))
      : 0,
    color: materialColors[material.name] || defaultColors[index % defaultColors.length],
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
            <Layers className="h-5 w-5" aria-hidden="true" />
            Top Materiais
          </CardTitle>
          <CardDescription>
            Tipos de material mais utilizados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Legend with percentages */}
          <div className="mb-6 grid grid-cols-2 md:grid-cols-3 gap-3">
            {chartData.map((material, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
              >
                <div
                  className="h-4 w-4 rounded-sm flex-shrink-0"
                  style={{
                    backgroundColor: material.color,
                  }}
                  aria-hidden="true"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{material.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {material.percentage}% · {material.usageCount}x usado
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Bar Chart */}
          <div role="img" aria-label="Gráfico de barras horizontal mostrando os materiais mais utilizados">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  type="number"
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => formatWeight(value)}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  width={80}
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
                              className="h-3 w-3 rounded-sm"
                              style={{ backgroundColor: item.color }}
                              aria-hidden="true"
                            />
                            <span className="font-semibold text-sm">{item.name}</span>
                          </div>
                          <div className="grid gap-1 text-sm">
                            <div className="flex justify-between gap-4">
                              <span className="text-muted-foreground">Quantidade:</span>
                              <span className="font-medium">{formatWeight(item.usage)}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-muted-foreground">Porcentagem:</span>
                              <span className="font-medium">{item.percentage}%</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-muted-foreground">Vezes usado:</span>
                              <span className="font-medium">{item.usageCount}x</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="usage"
                  radius={[0, 8, 8, 0]}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
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
