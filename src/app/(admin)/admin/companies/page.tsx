'use client'

import { useState } from 'react'
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminCompanies, useUpdateCompanyStatus, useAdminStats } from '@/lib/hooks/use-admin'
import { formatDate, formatCurrencyFromReais } from '@/lib/utils/format'
import { Building2, Search, MoreVertical, DollarSign, TrendingUp } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { CompanyAdmin } from '@/services/admin-service'

export default function AdminCompaniesPage() {
  const { data: companiesData, isLoading: isLoadingCompanies } = useAdminCompanies()
  const { data: stats, isLoading: isLoadingStats } = useAdminStats()
  const { mutate: updateStatus } = useUpdateCompanyStatus()
  const [search, setSearch] = useState('')
  
  const companies = companiesData?.companies || []

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'trial':
        return <Badge className="bg-blue-100 text-blue-700">Trial</Badge>
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-700">Ativo</Badge>
      case 'overdue':
        return <Badge className="bg-orange-100 text-orange-700">Atrasado</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelado</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPlanBadge = (company: CompanyAdmin) => {
    const planName = company.current_plan?.name
    
    // Se está em trial, mostra "Trial"
    if (company.subscription_status === 'trial') {
      return <Badge className="bg-blue-100 text-blue-700">Trial</Badge>
    }
    
    // Se não tem plano definido
    if (!planName) {
      return <Badge variant="secondary">Não definido</Badge>
    }
    
    return <Badge variant="outline">{planName}</Badge>
  }

  const getCompanyMRR = (company: CompanyAdmin): number => {
    // Se tem plano ativo, retorna o preço do plano
    if (company.subscription_status === 'ACTIVE' && company.current_plan?.price) {
      return company.current_plan.price
    }
    return 0
  }

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(search.toLowerCase()) ||
    company.email?.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoadingCompanies || isLoadingStats) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Card>
          <CardContent className="p-6 space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-2">
          <Building2 className="h-8 w-8 text-purple-600" />
          Empresas & Assinaturas
        </h1>
        <p className="text-neutral-600 mt-1">
          Visualize e gerencie empresas, assinaturas e métricas da plataforma
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total de Empresas</CardDescription>
            <CardTitle className="text-3xl">{stats?.total_companies || companies.length || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Assinaturas Ativas</CardDescription>
            </div>
            <CardTitle className="text-3xl text-green-600">
              {stats?.active_subscriptions || companies?.filter((c) => c.subscription_status === 'ACTIVE').length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Em Trial</CardDescription>
            <CardTitle className="text-3xl text-blue-600">
              {stats?.trial_subscriptions || companies?.filter((c) => c.subscription_status === 'trial').length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Atrasados</CardDescription>
            <CardTitle className="text-3xl text-orange-600">
              {stats?.overdue_subscriptions || companies?.filter((c) => c.subscription_status === 'overdue').length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>MRR Total</CardDescription>
              <DollarSign className="h-4 w-4 text-neutral-400" />
            </div>
            <CardTitle className="text-3xl text-green-600">
              {formatCurrencyFromReais(stats?.total_mrr || 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Taxa de Churn</CardDescription>
              <TrendingUp className="h-4 w-4 text-neutral-400" />
            </div>
            <CardTitle className="text-3xl text-orange-600">
              {stats?.churn_rate?.toFixed(1) || '0.0'}%
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>MRR</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies && filteredCompanies.length > 0 ? (
                filteredCompanies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{company.name}</p>
                        {company.trade_name && (
                          <p className="text-sm text-neutral-500">{company.trade_name}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-neutral-600">{company.email || '—'}</TableCell>
                    <TableCell>{getStatusBadge(company.subscription_status)}</TableCell>
                    <TableCell>{getPlanBadge(company)}</TableCell>
                    <TableCell className="text-green-600 font-medium">
                      {formatCurrencyFromReais(getCompanyMRR(company))}
                    </TableCell>
                    <TableCell className="text-neutral-600">
                      {formatDate(company.created_at, 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              updateStatus({ 
                                organizationId: company.organization_id, 
                                request: { status: 'active' } 
                              })
                            }
                          >
                            Ativar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              updateStatus({ 
                                organizationId: company.organization_id, 
                                request: { status: 'overdue' } 
                              })
                            }
                          >
                            Marcar Atrasado
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() =>
                              updateStatus({ 
                                organizationId: company.organization_id, 
                                request: { status: 'cancelled' } 
                              })
                            }
                          >
                            Cancelar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-neutral-500">
                    {search ? 'Nenhuma empresa encontrada' : 'Nenhuma empresa cadastrada'}
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

