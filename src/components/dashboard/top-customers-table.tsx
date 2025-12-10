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
import { Badge } from '@/components/ui/badge';
import { TableSkeleton } from './metric-skeleton';
import { useTopCustomers } from '@/hooks/dashboard/use-top-customers';
import { formatCurrency, formatRelativeDate } from '@/lib/dashboard/formatters';
import { Trophy } from 'lucide-react';
import Link from 'next/link';

export function TopCustomersTable() {
  const { data, isLoading } = useTopCustomers();

  if (isLoading) {
    return <TableSkeleton />;
  }

  if (!data || data.customers.length === 0) return null;

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Top Clientes
              </CardTitle>
              <CardDescription>
                Seus {data.customers.length} melhores clientes por receita
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Receita Total</TableHead>
                <TableHead className="text-right">Orçamentos</TableHead>
                <TableHead className="text-right">Ticket Médio</TableHead>
                <TableHead className="text-right">Último Orçamento</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.customers.map((customer, index) => (
                <TableRow key={customer.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium text-lg">
                    {medals[index] || `${index + 1}.`}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/customers/${customer.id}`}
                      className="font-medium hover:underline"
                    >
                      {customer.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(customer.total_revenue)}
                  </TableCell>
                  <TableCell className="text-right">
                    {customer.budget_count}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatCurrency(customer.average_ticket)}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {formatRelativeDate(customer.last_budget_date)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={customer.status === 'active' ? 'default' : 'secondary'}
                    >
                      {customer.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
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
