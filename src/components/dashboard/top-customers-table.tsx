'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TableSkeleton } from './metric-skeleton';
import { DashboardErrorState } from './error-state';
import { DashboardEmptyState } from './empty-state';
import { useTopCustomers } from '@/hooks/dashboard/use-top-customers';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { formatCurrency } from '@/lib/dashboard/formatters';
import { Trophy, Medal } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function TopCustomersTable() {
  const prefersReducedMotion = useReducedMotion();
  const { data, isLoading, error, refetch } = useTopCustomers();

  if (isLoading) {
    return <TableSkeleton />;
  }

  if (error) {
    return (
      <DashboardErrorState
        title="Erro ao carregar clientes"
        message="Não foi possível carregar o ranking de clientes."
        onRetry={() => refetch()}
      />
    );
  }

  if (!data || data.customers.length === 0) {
    return (
      <DashboardEmptyState
        type="customers"
        title="Nenhum cliente ainda"
        description="Crie seu primeiro orçamento para começar a rastrear seus melhores clientes."
      />
    );
  }

  const medalColors = [
    'text-yellow-500', // Gold
    'text-gray-400',   // Silver
    'text-amber-600',  // Bronze
  ];

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" aria-hidden="true" />
                Top Clientes
              </CardTitle>
              <CardDescription>
                Seus {data.customers.length} melhores clientes por receita
              </CardDescription>
            </div>
            <Link
              href="/customers"
              className="text-sm text-primary hover:underline"
            >
              Ver todos
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12" aria-label="Posição">#</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Receita Total</TableHead>
                <TableHead className="text-right">Orçamentos</TableHead>
                <TableHead className="text-right">Ticket Médio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.customers.map((customer, index) => (
                <TableRow
                  key={customer.id}
                  className="hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <TableCell className="font-medium">
                    {index < 3 ? (
                      <Medal
                        className={cn('h-5 w-5', medalColors[index])}
                        aria-label={`${index + 1}º lugar`}
                      />
                    ) : (
                      <span className="text-muted-foreground">{index + 1}.</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/customers/${customer.id}`}
                      className="font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                    >
                      {customer.name}
                    </Link>
                    {customer.email && (
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {customer.email}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(customer.total_revenue)}
                  </TableCell>
                  <TableCell className="text-right">
                    {customer.budget_count}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatCurrency(customer.avg_ticket)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
