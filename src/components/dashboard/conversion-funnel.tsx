'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartSkeleton } from './metric-skeleton';
import { DashboardErrorState } from './error-state';
import { DashboardEmptyState } from './empty-state';
import { useConversionFunnel } from '@/hooks/dashboard/use-conversion-funnel';
import { formatBudgetStatus } from '@/lib/dashboard/formatters';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';

// Status colors for the funnel bars
const statusColors: Record<string, string> = {
  draft: 'bg-slate-400 dark:bg-slate-500',
  sent: 'bg-blue-500 dark:bg-blue-400',
  approved: 'bg-green-500 dark:bg-green-400',
  printing: 'bg-amber-500 dark:bg-amber-400',
  completed: 'bg-emerald-500 dark:bg-emerald-400',
  rejected: 'bg-red-500 dark:bg-red-400',
};

// Order of the main funnel flow (excluding rejected)
const mainFlowOrder = ['draft', 'sent', 'approved', 'printing', 'completed'];

export function ConversionFunnel() {
  const prefersReducedMotion = useReducedMotion();
  const { data, isLoading, error, refetch } = useConversionFunnel();

  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (error) {
    return (
      <DashboardErrorState
        title="Erro ao carregar funil"
        message="Não foi possível carregar os dados do funil de conversão."
        onRetry={() => refetch()}
      />
    );
  }

  if (!data || !data.steps?.length) {
    return (
      <DashboardEmptyState
        type="budgets"
        title="Nenhum orçamento no período"
        description="Crie orçamentos para visualizar o funil de conversão e acompanhar suas taxas."
      />
    );
  }

  // Separate main flow from rejected
  const mainFlowSteps = data.steps
    .filter((step) => step.status !== 'rejected')
    .sort((a, b) => mainFlowOrder.indexOf(a.status) - mainFlowOrder.indexOf(b.status));

  const rejectedStep = data.steps.find((step) => step.status === 'rejected');

  // Total across all steps (including rejected) for percentage calculation
  const totalCount = data.steps.reduce((sum, s) => sum + s.count, 0);
  // Max among all steps for bar width proportions
  const maxCount = Math.max(...data.steps.map(s => s.count), 1);

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Funil de Conversão</CardTitle>
          <CardDescription>
            Taxa de conversão geral:{' '}
            <span className="font-semibold text-foreground">
              {data.overall_conversion.toFixed(1)}%
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Horizontal funnel visualization */}
          <div
            className="space-y-3"
            role="list"
            aria-label="Funil de conversão de orçamentos"
          >
            {mainFlowSteps.map((stage, index) => {
              const widthPercentage = maxCount > 0
                ? Math.max(15, (stage.count / maxCount) * 100)
                : 15;
              const barColor = statusColors[stage.status] || statusColors.draft;
              const nextStage = mainFlowSteps[index + 1];

              return (
                <div key={stage.status} role="listitem" className="space-y-1">
                  {/* Stage row */}
                  <div className="flex items-center gap-4">
                    {/* Label */}
                    <div className="w-24 shrink-0 text-right">
                      <span className="text-sm font-medium text-muted-foreground">
                        {formatBudgetStatus(stage.status)}
                      </span>
                    </div>

                    {/* Bar container */}
                    <div className="flex-1 relative">
                      <motion.div
                        className={cn(
                          'h-10 rounded-md flex items-center justify-end pr-3 transition-all',
                          barColor
                        )}
                        style={{ width: `${widthPercentage}%` }}
                        initial={prefersReducedMotion ? {} : { width: 0 }}
                        animate={{ width: `${widthPercentage}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
                      >
                        <span className="text-sm font-bold text-white drop-shadow-sm">
                          {stage.count}
                        </span>
                      </motion.div>
                    </div>

                    {/* Percentage of total */}
                    <div className="w-16 shrink-0 text-right">
                      <span className="text-sm font-medium text-muted-foreground">
                        {totalCount > 0 ? ((stage.count / totalCount) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </div>

                  {/* Conversion rate to next stage (only if this stage has budgets) */}
                  {nextStage && stage.count > 0 && (
                    <div className="flex items-center gap-4 pl-28">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M12 5v14M5 12l7 7 7-7" />
                        </svg>
                        <span>
                          {nextStage.conversion_rate.toFixed(0)}% convertem para{' '}
                          {formatBudgetStatus(nextStage.status).toLowerCase()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Rejected section */}
          {rejectedStep && rejectedStep.count > 0 && (
            <div className="pt-4 border-t">
              <div className="flex items-center gap-4">
                {/* Label */}
                <div className="w-24 shrink-0 text-right">
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    {formatBudgetStatus('rejected')}
                  </span>
                </div>

                {/* Bar */}
                <div className="flex-1 relative">
                  <motion.div
                    className={cn(
                      'h-10 rounded-md flex items-center justify-end pr-3',
                      statusColors.rejected
                    )}
                    style={{ width: `${Math.max(15, (rejectedStep.count / maxCount) * 100)}%` }}
                    initial={prefersReducedMotion ? {} : { width: 0 }}
                    animate={{ width: `${Math.max(15, (rejectedStep.count / maxCount) * 100)}%` }}
                    transition={{ duration: 0.5, delay: 0.5, ease: 'easeOut' }}
                  >
                    <span className="text-sm font-bold text-white drop-shadow-sm">
                      {rejectedStep.count}
                    </span>
                  </motion.div>
                </div>

                {/* Rejection rate */}
                <div className="w-16 shrink-0 text-right">
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    {totalCount > 0 ? ((rejectedStep.count / totalCount) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1 pl-28">
                do total de orçamentos
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
