'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ChartSkeleton } from './metric-skeleton';
import { useGoalsAlerts } from '@/hooks/dashboard/use-goals-alerts';
import { formatCurrency, formatRelativeDate } from '@/lib/dashboard/formatters';
import { Target, AlertCircle, AlertTriangle, Info, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function GoalsSection() {
  const { data, isLoading } = useGoalsAlerts();

  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (!data) return null;

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
    <div className="grid gap-4 md:grid-cols-2">
      {/* Goals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Metas do Mês
            </CardTitle>
            <CardDescription>Acompanhe o progresso das suas metas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {data.goals.map((goal, index) => {
                const config = goalStatusConfig[goal.status];

                return (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {goal.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {goal.type === 'revenue'
                            ? `${formatCurrency(goal.current)} de ${formatCurrency(goal.target)}`
                            : goal.type === 'conversion'
                            ? `${goal.current.toFixed(1)}% de ${goal.target}%`
                            : `${goal.current} de ${goal.target}`}
                        </p>
                      </div>
                      <Badge variant={config.badgeVariant}>{config.label}</Badge>
                    </div>
                    <Progress
                      value={goal.progress}
                      className="h-2"
                      indicatorClassName={config.color}
                    />
                    <p className="text-xs text-right text-muted-foreground">
                      {goal.progress.toFixed(0)}% concluído
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.9 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Alertas e Avisos
            </CardTitle>
            <CardDescription>Itens que precisam de atenção</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.alerts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    Tudo tranquilo! Nenhum alerta no momento.
                  </p>
                </div>
              ) : (
                data.alerts.map((alert, index) => {
                  const config = alertConfig[alert.type];
                  const Icon = config.icon;

                  return (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.9 + index * 0.1 }}
                    >
                      <Alert className={cn(config.className)}>
                        <Icon className="h-4 w-4" />
                        <AlertTitle className="flex items-center justify-between">
                          {alert.title}
                          {alert.count && (
                            <Badge variant="outline" className="ml-2">
                              {alert.count}
                            </Badge>
                          )}
                        </AlertTitle>
                        <AlertDescription className="mt-2 space-y-2">
                          <p className="text-sm">{alert.description}</p>
                          {alert.action_url && (
                            <Link
                              href={alert.action_url}
                              className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
                            >
                              Ver detalhes
                              <ArrowRight className="h-3 w-3" />
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
