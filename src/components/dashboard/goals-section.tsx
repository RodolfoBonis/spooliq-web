'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ChartSkeleton } from './metric-skeleton';
import { DashboardErrorState } from './error-state';
import { DashboardEmptyState } from './empty-state';
import { useGoalsAlerts } from '@/hooks/dashboard/use-goals-alerts';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { formatCurrency } from '@/lib/dashboard/formatters';
import { Target, AlertCircle, AlertTriangle, Info, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

function getGoalStatus(progress: number): 'on_track' | 'at_risk' | 'behind' {
  if (progress >= 90) return 'on_track';
  if (progress >= 60) return 'at_risk';
  return 'behind';
}

function getGoalType(name: string): 'revenue' | 'customers' | 'conversion' | 'other' {
  const nameLower = name.toLowerCase();
  if (nameLower.includes('receita') || nameLower.includes('revenue')) return 'revenue';
  if (nameLower.includes('cliente') || nameLower.includes('customer')) return 'customers';
  if (nameLower.includes('convers') || nameLower.includes('aprovacao')) return 'conversion';
  return 'other';
}

function getAlertActionUrl(entityType?: string): string | undefined {
  if (!entityType) return undefined;
  const entityTypeLower = entityType.toLowerCase();
  if (entityTypeLower === 'budget') return '/budgets';
  if (entityTypeLower === 'customer') return '/customers';
  if (entityTypeLower === 'filament') return '/catalog/filaments';
  return undefined;
}

function getAlertTitle(type: string, message: string): string {
  const typeTitles: Record<string, string> = {
    pending_budgets: 'Orçamentos Pendentes',
    inactive_customers: 'Clientes Inativos',
    low_stock: 'Estoque Baixo',
    low_conversion: 'Taxa de Conversão Baixa',
  };
  return typeTitles[type] || message.split('.')[0].slice(0, 30);
}

export function GoalsSection() {
  const prefersReducedMotion = useReducedMotion();
  const { data, isLoading, error, refetch } = useGoalsAlerts();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <DashboardErrorState
        title="Erro ao carregar metas"
        message="Não foi possível carregar as metas e alertas."
        onRetry={() => refetch()}
      />
    );
  }

  if (!data) {
    return (
      <DashboardEmptyState
        type="goals"
        title="Nenhuma meta configurada"
        description="Configure metas mensais para acompanhar o progresso do seu negócio."
      />
    );
  }

  const goalStatusConfig = {
    on_track: {
      label: 'No prazo',
      color: 'bg-green-500',
      badgeVariant: 'default' as const,
    },
    at_risk: {
      label: 'Em risco',
      color: 'bg-yellow-500',
      badgeVariant: 'secondary' as const,
    },
    behind: {
      label: 'Atrasado',
      color: 'bg-red-500',
      badgeVariant: 'destructive' as const,
    },
  };

  const alertConfig = {
    warning: {
      icon: AlertTriangle,
      className: 'border-yellow-500/50 text-yellow-600 dark:text-yellow-500',
    },
    danger: {
      icon: AlertCircle,
      className: 'border-red-500/50 text-red-600 dark:text-red-500',
    },
    info: {
      icon: Info,
      className: 'border-blue-500/50 text-blue-600 dark:text-blue-500',
    },
  };

  return (
    <div className="grid gap-4 md:grid-cols-2" role="region" aria-label="Metas e alertas">
      {/* Goals */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" aria-hidden="true" />
              Metas do Mês
            </CardTitle>
            <CardDescription>Acompanhe o progresso das suas metas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {data.goals.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-10 w-10 text-muted-foreground mx-auto mb-3" aria-hidden="true" />
                  <p className="text-sm text-muted-foreground">
                    Nenhuma meta definida.
                  </p>
                  <Link
                    href="/settings/goals"
                    className="text-sm text-primary hover:underline mt-2 inline-block"
                  >
                    Configurar metas
                  </Link>
                </div>
              ) : (
                data.goals.map((goal, index) => {
                  const status = getGoalStatus(goal.progress);
                  const config = goalStatusConfig[status];
                  const goalType = getGoalType(goal.name);

                  return (
                    <motion.div
                      key={`goal-${index}`}
                      initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
                      animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: prefersReducedMotion ? 0 : 0.8 + index * 0.1 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {goal.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {goalType === 'revenue'
                              ? `${formatCurrency(goal.current * 100)} de ${formatCurrency(goal.target * 100)}`
                              : goalType === 'conversion'
                              ? `${goal.current.toFixed(1)}% de ${goal.target}%`
                              : `${goal.current} de ${goal.target}${goal.unit ? ` ${goal.unit}` : ''}`}
                          </p>
                        </div>
                        <Badge variant={config.badgeVariant}>{config.label}</Badge>
                      </div>
                      <Progress
                        value={goal.progress}
                        className="h-2"
                        indicatorClassName={config.color}
                        aria-label={`Progresso da meta ${goal.name}: ${goal.progress.toFixed(0)}%`}
                      />
                      <p className="text-xs text-right text-muted-foreground">
                        {goal.progress.toFixed(0)}% concluído
                      </p>
                    </motion.div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Alerts */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.9 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" aria-hidden="true" />
              Alertas e Avisos
            </CardTitle>
            <CardDescription>Itens que precisam de atenção</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.alerts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 mx-auto mb-3 flex items-center justify-center">
                    <Info className="h-5 w-5 text-green-600 dark:text-green-400" aria-hidden="true" />
                  </div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">
                    Tudo tranquilo!
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Nenhum alerta no momento.
                  </p>
                </div>
              ) : (
                data.alerts.map((alert, index) => {
                  const config = alertConfig[alert.severity] || alertConfig.info;
                  const Icon = config.icon;
                  const title = getAlertTitle(alert.type, alert.message);
                  const actionUrl = getAlertActionUrl(alert.entity_type);

                  return (
                    <motion.div
                      key={`alert-${index}`}
                      initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
                      animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: prefersReducedMotion ? 0 : 0.9 + index * 0.1 }}
                    >
                      <Alert className={cn(config.className)}>
                        <Icon className="h-4 w-4" aria-hidden="true" />
                        <AlertTitle className="flex items-center justify-between">
                          {title}
                          {alert.count && (
                            <Badge variant="outline" className="ml-2">
                              {alert.count}
                            </Badge>
                          )}
                        </AlertTitle>
                        <AlertDescription className="mt-2 space-y-2">
                          <p className="text-sm">{alert.message}</p>
                          {actionUrl && (
                            <Link
                              href={actionUrl}
                              className="inline-flex items-center gap-1 text-sm font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                            >
                              Ver detalhes
                              <ArrowRight className="h-3 w-3" aria-hidden="true" />
                            </Link>
                          )}
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
