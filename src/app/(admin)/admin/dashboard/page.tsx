'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Building2, 
  Users, 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical
} from 'lucide-react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { adminService } from '@/services/admin-service'

export default function AdminDashboardPage() {
  // Fetch dashboard metrics
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminService.getDashboardMetrics(),
  })

  const formatCurrency = (cents: number) => {
    return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`
  }

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
      pro: 'Profissional',
      enterprise: 'Enterprise',
    }
    return labels[plan as keyof typeof labels] || plan
  }

  if (isLoading) {
    return (
      <div className="container max-w-6xl py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
            <p className="text-neutral-600 mt-1">Visão geral do sistema</p>
          </div>
        </div>

        {/* Loading Skeletons */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-16 mb-1" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded" />
                      <div>
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const stats = dashboardData?.stats
  const recentCompanies = dashboardData?.recentCompanies || []
  const overdueCompanies = dashboardData?.overdueCompanies || []

  return (
    <div className="container max-w-6xl py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary-500" />
            Dashboard Administrativo
          </h1>
          <p className="text-neutral-600 mt-1">
            Visão geral do sistema e métricas importantes
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/companies">
              Ver Empresas
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/subscriptions">
              Ver Assinaturas
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Empresas</CardTitle>
            <Building2 className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_companies || 0}</div>
            <p className="text-xs text-neutral-500">
              Empresas cadastradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.active_subscriptions || 0}</div>
            <p className="text-xs text-neutral-500">
              {stats?.trial_subscriptions || 0} em trial
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.total_mrr || 0)}
            </div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              Receita mensal recorrente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Churn</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats?.churn_rate || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-neutral-500">
              {stats?.overdue_subscriptions || 0} em atraso
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Companies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Empresas Recentes
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/companies" className="flex items-center gap-1">
                  Ver todas
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </Button>
            </CardTitle>
            <CardDescription>
              Últimas empresas cadastradas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentCompanies.length > 0 ? (
              <div className="space-y-4">
                {recentCompanies.map((company) => (
                  <div key={company.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-neutral-100">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{company.name}</p>
                        <p className="text-xs text-neutral-500">
                          {company.current_plan?.name || 'Sem plano'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(company.subscription_status)}
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                      >
                        <Link href={`/admin/companies/${company.organization_id}`}>
                          <MoreVertical className="h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-500">
                <Building2 className="mx-auto h-8 w-8 text-neutral-300 mb-2" />
                <p className="text-sm">Nenhuma empresa encontrada</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Overdue Subscriptions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Pagamentos em Atraso
              </span>
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/subscriptions?status=overdue" className="flex items-center gap-1">
                  Ver todos
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </Button>
            </CardTitle>
            <CardDescription>
              Assinaturas que precisam de atenção
            </CardDescription>
          </CardHeader>
          <CardContent>
            {overdueCompanies.length > 0 ? (
              <div className="space-y-4">
                {overdueCompanies.map((company) => (
                  <div key={company.organization_id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{company.name}</p>
                      <p className="text-xs text-neutral-500">
                        Status: {company.subscription_status}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-orange-100 text-orange-700 text-xs">
                        {company.current_plan?.name || 'Sem plano'}
                      </Badge>
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                      >
                        <Link href={`/admin/companies`}>
                          <MoreVertical className="h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-500">
                <CheckCircle className="mx-auto h-8 w-8 text-green-300 mb-2" />
                <p className="text-sm">Nenhum pagamento em atraso</p>
                <p className="text-xs mt-1">Parabéns! Todos os pagamentos estão em dia</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Acesso rápido às principais funcionalidades administrativas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <Link href="/admin/companies">
                <Building2 className="h-6 w-6" />
                <span>Gerenciar Empresas</span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <Link href="/admin/subscriptions">
                <Users className="h-6 w-6" />
                <span>Ver Assinaturas</span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <Link href="/admin/plans">
                <DollarSign className="h-6 w-6" />
                <span>Gerenciar Planos</span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <Link href="/admin/webhooks">
                <Calendar className="h-6 w-6" />
                <span>Logs de Webhook</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}