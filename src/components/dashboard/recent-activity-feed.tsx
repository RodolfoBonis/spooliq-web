'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TableSkeleton } from './metric-skeleton';
import { DashboardErrorState } from './error-state';
import { DashboardEmptyState } from './empty-state';
import { useRecentActivity } from '@/hooks/dashboard/use-recent-activity';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import {
  formatRelativeDate,
  formatCurrency,
} from '@/lib/dashboard/formatters';
import { cn } from '@/lib/utils';
import {
  FileText,
  Send,
  CheckCircle,
  XCircle,
  Printer,
  User,
  Circle,
  Edit,
  Trash,
  Package,
} from 'lucide-react';

// Map backend action strings to icons
const actionIcons: Record<string, React.ElementType> = {
  created: FileText,
  updated: Edit,
  deleted: Trash,
  sent: Send,
  approved: CheckCircle,
  rejected: XCircle,
  printing: Printer,
  completed: CheckCircle,
};

// Map entity types to icons
const entityIcons: Record<string, React.ElementType> = {
  budget: FileText,
  customer: User,
  filament: Package,
};

// Map actions to colors
const actionColors: Record<string, string> = {
  created: 'text-blue-500 bg-blue-500/10',
  updated: 'text-yellow-500 bg-yellow-500/10',
  deleted: 'text-red-500 bg-red-500/10',
  sent: 'text-purple-500 bg-purple-500/10',
  approved: 'text-green-500 bg-green-500/10',
  rejected: 'text-red-500 bg-red-500/10',
  printing: 'text-orange-500 bg-orange-500/10',
  completed: 'text-green-600 bg-green-600/10',
};

function getActivityIcon(action: string, entityType: string): React.ElementType {
  if (actionIcons[action]) {
    return actionIcons[action];
  }
  if (entityIcons[entityType]) {
    return entityIcons[entityType];
  }
  return Circle;
}

function getActivityColor(action: string): string {
  return actionColors[action] || 'text-gray-500 bg-gray-500/10';
}

export function RecentActivityFeed() {
  const prefersReducedMotion = useReducedMotion();
  const { data, isLoading, error, refetch } = useRecentActivity();

  if (isLoading) {
    return <TableSkeleton rows={8} />;
  }

  if (error) {
    return (
      <DashboardErrorState
        title="Erro ao carregar atividades"
        message="Não foi possível carregar as atividades recentes."
        onRetry={() => refetch()}
      />
    );
  }

  if (!data || data.activities.length === 0) {
    return (
      <DashboardEmptyState
        type="activity"
        title="Nenhuma atividade recente"
        description="As ações realizadas no sistema aparecerão aqui conforme você utiliza a plataforma."
      />
    );
  }

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
          <CardDescription>Últimas ações e eventos do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="space-y-4 max-h-[400px] overflow-y-auto"
            role="feed"
            aria-label="Feed de atividades recentes"
          >
            {data.activities.map((activity, index) => {
              const Icon = getActivityIcon(activity.action, activity.entity_type);
              const colorClass = getActivityColor(activity.action);
              const budgetValue = activity.metadata?.total_value as number | undefined;

              return (
                <motion.article
                  key={activity.id}
                  initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: prefersReducedMotion ? 0 : index * 0.05 }}
                  className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0"
                  aria-label={activity.description || `${activity.action} ${activity.entity_type}: ${activity.entity_name}`}
                >
                  {/* Icon */}
                  <div className={cn('p-2 rounded-lg flex-shrink-0', colorClass)}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-1 min-w-0">
                    <p className="text-sm font-medium leading-none truncate">
                      {activity.description || `${activity.action} ${activity.entity_type}: ${activity.entity_name}`}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs text-muted-foreground">
                        <time dateTime={activity.created_at}>
                          {formatRelativeDate(activity.created_at)}
                        </time>
                      </p>
                      {budgetValue && budgetValue > 0 && (
                        <>
                          <Circle className="h-1 w-1 fill-muted-foreground flex-shrink-0" aria-hidden="true" />
                          <p className="text-xs font-semibold text-foreground">
                            {formatCurrency(budgetValue, { compact: true })}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
