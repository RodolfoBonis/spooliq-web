'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TableSkeleton } from './metric-skeleton';
import { useRecentActivity } from '@/hooks/dashboard/use-recent-activity';
import {
  formatRelativeDate,
  formatCurrency,
  formatActivityType,
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
} from 'lucide-react';
import type { ActivityType } from '@/types/dashboard';

const activityIcons: Record<ActivityType, React.ElementType> = {
  budget_created: FileText,
  budget_sent: Send,
  budget_approved: CheckCircle,
  budget_rejected: XCircle,
  budget_printing: Printer,
  budget_completed: CheckCircle,
  customer_created: User,
};

const activityColors: Record<ActivityType, string> = {
  budget_created: 'text-blue-500 bg-blue-500/10',
  budget_sent: 'text-purple-500 bg-purple-500/10',
  budget_approved: 'text-green-500 bg-green-500/10',
  budget_rejected: 'text-red-500 bg-red-500/10',
  budget_printing: 'text-orange-500 bg-orange-500/10',
  budget_completed: 'text-green-600 bg-green-600/10',
  customer_created: 'text-cyan-500 bg-cyan-500/10',
};

export function RecentActivityFeed() {
  const { data, isLoading } = useRecentActivity();

  if (isLoading) {
    return <TableSkeleton rows={8} />;
  }

  if (!data || data.activities.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
          <CardDescription>Últimas ações e eventos do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.activities.map((activity, index) => {
              const Icon = activityIcons[activity.type];
              const colorClass = activityColors[activity.type];

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0"
                >
                  {/* Icon */}
                  <div className={cn('p-2 rounded-lg', colorClass)}>
                    <Icon className="h-4 w-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeDate(activity.timestamp)}
                      </p>
                      {activity.value && (
                        <>
                          <Circle className="h-1 w-1 fill-muted-foreground" />
                          <p className="text-xs font-semibold text-foreground">
                            {formatCurrency(activity.value, { compact: true })}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
