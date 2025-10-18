'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminSubscriptions, useAdminStats } from '@/lib/hooks/use-admin'
import { formatDate, formatCurrency } from '@/lib/utils/format'
import { CreditCard, TrendingUp, Users, DollarSign } from 'lucide-react'

export default function AdminSubscriptionsPage() {
  const { data: subscriptions, isLoading: isLoadingSubscriptions } = useAdminSubscriptions()
  const { data: stats, isLoading: isLoadingStats } = useAdminStats()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'trial':
        return <Badge className="bg-blue-100 text-blue-700">Trial</Badge>
      case 'active':
        return <Badge className="bg-green-100 text-green-700">Ativo</Badge>
      case 'overdue':
        return <Badge className="bg-orange-100 text-orange-700">Atrasado</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelado</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPlanBadge = (plan: string) => {
    const labels = {
      basic: 'Básico',
      pro: 'Pro',
      enterprise: 'Enterprise',
    }
    return <Badge variant="outline">{labels[plan as keyof typeof labels] || plan}</Badge>
  }

  if (isLoadingSubscriptions || isLoadingStats) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-2">
          <CreditCard className="h-8 w-8 text-purple-600" />
          Assinaturas e Analytics
        </h1>
        <p className="text-neutral-600 mt-1">
          Acompanhe métricas e receita da plataforma
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>MRR Total</CardDescription>
              <DollarSign className="h-4 w-4 text-neutral-400" />
            </div>
            <CardTitle className="text-3xl text-green-600">
              {formatCurrency(stats?.total_mrr || 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Assinaturas Ativas</CardDescription>
              <Users className="h-4 w-4 text-neutral-400" />
            </div>
            <CardTitle className="text-3xl">{stats?.active_subscriptions || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Em Trial</CardDescription>
              <Users className="h-4 w-4 text-neutral-400" />
            </div>
            <CardTitle className="text-3xl text-blue-600">{stats?.trial_subscriptions || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Taxa de Churn</CardDescription>
              <TrendingUp className="h-4 w-4 text-neutral-400" />
            </div>
            <CardTitle className="text-3xl text-orange-600">
              {stats?.churn_rate.toFixed(1) || 0}%
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Todas as Assinaturas</CardTitle>
          <CardDescription>Lista completa de assinaturas da plataforma</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>MRR</TableHead>
                <TableHead>Início</TableHead>
                <TableHead>Próximo Pagamento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions && subscriptions.length > 0 ? (
                subscriptions.map((sub) => (
                  <TableRow key={sub.organization_id}>
                    <TableCell className="font-medium">{sub.company_name}</TableCell>
                    <TableCell>{getStatusBadge(sub.status)}</TableCell>
                    <TableCell>{getPlanBadge(sub.plan)}</TableCell>
                    <TableCell className="text-green-600 font-medium">
                      {formatCurrency(sub.mrr)}
                    </TableCell>
                    <TableCell className="text-neutral-600">
                      {sub.subscription_started_at
                        ? formatDate(sub.subscription_started_at, 'dd/MM/yyyy')
                        : '—'}
                    </TableCell>
                    <TableCell className="text-neutral-600">
                      {sub.next_payment_due ? formatDate(sub.next_payment_due, 'dd/MM/yyyy') : '—'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-neutral-500">
                    Nenhuma assinatura encontrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

