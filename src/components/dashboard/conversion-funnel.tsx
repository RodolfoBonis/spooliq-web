'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartSkeleton } from './metric-skeleton';
import { useConversionFunnel } from '@/hooks/dashboard/use-conversion-funnel';
import { formatBudgetStatus, formatCurrency } from '@/lib/dashboard/formatters';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

export function ConversionFunnel() {
  const { data, isLoading } = useConversionFunnel();

  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Funil de Conversão</CardTitle>
          <CardDescription>
            Taxa de conversão geral: {data.overall_conversion_rate.toFixed(1)}%
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.stages.map((stage, index) => {
              const isLast = index === data.stages.length - 1;
              const nextStage = !isLast ? data.stages[index + 1] : null;

              // Calculate width percentage (narrowing funnel)
              const maxCount = data.stages[0].count;
              const widthPercentage = (stage.count / maxCount) * 100;

              return (
                <div key={stage.status} className="space-y-2">
                  {/* Stage bar */}
                  <div className="relative">
                    <div
                      className="relative h-16 rounded-lg bg-gradient-to-r from-blue-500/20 to-blue-600/20 dark:from-blue-400/20 dark:to-blue-500/20 border border-blue-200 dark:border-blue-800 transition-all hover:shadow-md flex items-center justify-between px-4"
                      style={{
                        width: `${Math.max(widthPercentage, 30)}%`,
                      }}
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">
                          {formatBudgetStatus(stage.status)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {stage.count} orçamentos
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">
                          {formatCurrency(stage.total_value, { compact: true })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {stage.average_time_in_stage.toFixed(0)}h médio
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Conversion rate to next stage */}
                  {nextStage && (
                    <div className="flex items-center gap-2 pl-4 text-xs text-muted-foreground">
                      <ArrowRight className="h-3 w-3" />
                      <span>
                        Taxa de conversão: <span className="font-semibold text-foreground">{stage.conversion_rate.toFixed(1)}%</span>
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
