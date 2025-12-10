'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartSkeleton } from './metric-skeleton';
import { useTopMaterials } from '@/hooks/dashboard/use-top-materials';
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

export function TopMaterialsChart() {
  const { data, isLoading } = useTopMaterials();

  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (!data || data.materials.length === 0) return null;

  const chartData = data.materials.map((material) => ({
    name: material.material_type,
    usage: material.total_grams,
    percentage: material.percentage,
    filamentCount: material.filament_count,
    color: material.color,
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
            <Layers className="h-5 w-5" />
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
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{material.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {material.percentage}% • {material.filamentCount} filamentos
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Bar Chart */}
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

                  const data = payload[0].payload;

                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-lg">
                      <div className="grid gap-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-sm"
                            style={{ backgroundColor: data.color }}
                          />
                          <span className="font-semibold text-sm">{data.name}</span>
                        </div>
                        <div className="grid gap-1 text-sm">
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Quantidade:</span>
                            <span className="font-medium">{formatWeight(data.usage)}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Porcentagem:</span>
                            <span className="font-medium">{data.percentage}%</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Filamentos:</span>
                            <span className="font-medium">{data.filamentCount}</span>
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
        </CardContent>
      </Card>
    </motion.div>
  );
}
