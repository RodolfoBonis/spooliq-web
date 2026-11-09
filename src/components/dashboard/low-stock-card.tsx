'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { AlertTriangle, PackageCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartSkeleton } from './metric-skeleton';
import { DashboardErrorState } from './error-state';
import { useLowStock } from '@/hooks/dashboard/use-low-stock';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { formatGrams } from '@/lib/utils/format';

export function LowStockCard() {
  const prefersReducedMotion = useReducedMotion();
  const { data, isLoading, error, refetch } = useLowStock();

  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (error) {
    return (
      <DashboardErrorState
        title="Erro ao carregar estoque"
        message="Não foi possível carregar os filamentos com estoque baixo."
        onRetry={() => refetch()}
      />
    );
  }

  const items = data?.data ?? [];

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden="true" />
            Estoque baixo
          </CardTitle>
          <CardDescription>Filamentos abaixo do limite de alerta</CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8">
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 mx-auto mb-3 flex items-center justify-center">
                <PackageCheck className="h-5 w-5 text-green-600 dark:text-green-400" aria-hidden="true" />
              </div>
              <p className="text-sm font-medium text-green-700 dark:text-green-400">
                Tudo em ordem!
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Nenhum filamento com estoque baixo.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {items.map((filament) => (
                <li key={filament.id}>
                  <Link
                    href="/catalog/filaments"
                    className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span
                      className="h-4 w-4 flex-shrink-0 rounded-full border border-background shadow-sm"
                      style={{ background: filament.color_hex || '#cccccc' }}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{filament.name}</p>
                      {(filament.brand_name || filament.material_name) && (
                        <p className="truncate text-xs text-muted-foreground">
                          {[filament.brand_name, filament.material_name].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-sm font-semibold text-amber-600">
                        {formatGrams(filament.stock_grams)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        limite {formatGrams(filament.low_stock_threshold_grams)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
