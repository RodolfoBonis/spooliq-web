'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
  ArrowLeft,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Crown,
  Star,
  Zap,
  Users,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Building2,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import subscriptionPlansService from '@/services/subscription-plans-service'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api/errors'
import type { SubscriptionPlanModel, PlanFeature } from '@/types/models'
import type { PlanStats, PlanCompaniesResponse, FinancialReport, CanDeleteResponse } from '@/services/subscription-plans-service'
import { formatDate } from '@/lib/utils/format'

export default function PlanDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const planId = params.id as string
  const queryClient = useQueryClient()

  const [isEditing, setIsEditing] = useState(false)
  const [editedPlan, setEditedPlan] = useState<Partial<SubscriptionPlanModel>>({})
  const [newFeature, setNewFeature] = useState({ name: '', description: '' })
  const [showFinancialReport, setShowFinancialReport] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  // Check if there are unsaved changes
  const hasUnsavedChanges = Object.keys(editedPlan).length > 0

  // Fetch plan details
  const { data: planData, isLoading, refetch } = useQuery({
    queryKey: ['admin-plan', planId],
    queryFn: () => subscriptionPlansService.getPlanById(planId),
    enabled: !!planId,
  })

  // Fetch plan statistics
  const { data: planStats } = useQuery({
    queryKey: ['admin-plan-stats', planId],
    queryFn: () => subscriptionPlansService.getPlanStats(planId),
    enabled: !!planId,
  })

  // Fetch plan companies
  const { data: planCompanies } = useQuery({
    queryKey: ['admin-plan-companies', planId],
    queryFn: () => subscriptionPlansService.getPlanCompanies(planId),
    enabled: !!planId,
  })

  // Fetch financial report (only when requested)
  const { data: financialReport, isLoading: isLoadingReport } = useQuery({
    queryKey: ['admin-plan-financial-report', planId],
    queryFn: () => subscriptionPlansService.getFinancialReport(planId),
    enabled: !!planId && showFinancialReport,
  })

  // Fetch delete validation (only when requested)
  const { data: deleteValidation } = useQuery({
    queryKey: ['admin-plan-can-delete', planId],
    queryFn: () => subscriptionPlansService.canDeletePlan(planId),
    enabled: !!planId && showDeleteConfirm,
  })

  const formatCurrency = (reais: number) => {
    return `R$ ${reais.toFixed(2).replace('.', ',')}`
  }

  const getPlanIcon = (planName: string) => {
    const name = planName.toLowerCase()
    if (name.includes('enterprise')) return <Crown className="h-6 w-6 text-yellow-600" />
    if (name.includes('pro')) return <Star className="h-6 w-6 text-blue-600" />
    return <Zap className="h-6 w-6 text-green-600" />
  }

  const handleEdit = () => {
    setEditedPlan({ ...planData })
    setIsEditing(true)
  }

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmCancel = window.confirm(
        'Você tem alterações não salvas. Deseja realmente cancelar?'
      )
      if (!confirmCancel) return
    }
    
    setEditedPlan({})
    setIsEditing(false)
    setNewFeature({ name: '', description: '' })
  }

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<SubscriptionPlanModel>) => {
      if (!planData) throw new Error('Plan data not found')
      
      const updateData = {
        name: data.name,
        description: data.description,
        price: data.price,
        cycle: data.cycle,
        features: data.features?.map(f => ({ name: f.name, description: f.description })),
        is_active: data.is_active,
      }
      
      return subscriptionPlansService.updatePlan(planData.id, updateData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-plan', planId] })
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] })
      toast.success('Plano atualizado com sucesso!')
      setIsEditing(false)
      setEditedPlan({})
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Erro ao atualizar plano'))
    },
  })

  const validateForm = () => {
    const currentData = { ...planData, ...editedPlan }
    
    if (!currentData.name?.trim()) {
      toast.error('Nome do plano é obrigatório')
      return false
    }
    
    if (!currentData.description?.trim()) {
      toast.error('Descrição do plano é obrigatória')
      return false
    }
    
    if (currentData.price === undefined || currentData.price < 0) {
      toast.error('Preço deve ser um valor válido')
      return false
    }
    
    if (!currentData.features || currentData.features.length === 0) {
      toast.error('Pelo menos um recurso deve ser adicionado')
      return false
    }
    
    return true
  }

  const handleSave = async () => {
    if (!planData || !validateForm()) return
    
    const dataToUpdate = {
      ...planData,
      ...editedPlan,
    }
    
    updateMutation.mutate(dataToUpdate)
  }

  const addFeature = () => {
    if (!newFeature.name.trim()) {
      toast.error('Nome do recurso é obrigatório')
      return
    }
    
    if (!newFeature.description.trim()) {
      toast.error('Descrição do recurso é obrigatória')
      return
    }
    
    const currentFeatures = editedPlan.features || planData?.features || []
    
    // Check for duplicate feature names
    const isDuplicate = currentFeatures.some(f => 
      f.name.toLowerCase().trim() === newFeature.name.toLowerCase().trim()
    )
    
    if (isDuplicate) {
      toast.error('Já existe um recurso com este nome')
      return
    }
    
    setEditedPlan({
      ...editedPlan,
      features: [...currentFeatures, {
        id: `temp-${Date.now()}`,
        name: newFeature.name.trim(),
        description: newFeature.description.trim(),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }]
    })
    setNewFeature({ name: '', description: '' })
    toast.success('Recurso adicionado com sucesso!')
  }

  const removeFeature = (featureId: string) => {
    const currentFeatures = editedPlan.features || planData?.features || []
    setEditedPlan({
      ...editedPlan,
      features: currentFeatures.filter(f => f.id !== featureId)
    })
  }

  if (isLoading) {
    return (
      <div className="container max-w-6xl py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-20" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!planData) {
    return (
      <div className="container max-w-6xl py-6">
        <div className="text-center py-12">
          <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Plano não encontrado</h1>
          <p className="text-neutral-600 mb-6">O plano solicitado não existe ou foi removido.</p>
          <Button asChild>
            <Link href="/admin/plans">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Planos
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const currentPlan = isEditing ? { ...planData, ...editedPlan } : planData

  return (
    <div className="container max-w-6xl py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/admin/plans">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            {getPlanIcon(currentPlan.name)}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-neutral-900">{currentPlan.name}</h1>
                {isEditing && hasUnsavedChanges && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 rounded-md">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-xs text-orange-700 font-medium">Não salvo</span>
                  </div>
                )}
              </div>
              <p className="text-neutral-600">Detalhes do plano de assinatura</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={updateMutation.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </>
          ) : (
            <Button onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>Dados principais do plano</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-neutral-700">Nome</label>
                  {isEditing ? (
                    <Input
                      value={editedPlan.name ?? currentPlan.name}
                      onChange={(e) => setEditedPlan({ ...editedPlan, name: e.target.value })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-neutral-900">{currentPlan.name}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700">Preço</label>
                  {isEditing ? (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-neutral-500">R$</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={editedPlan.price ?? currentPlan.price}
                        onChange={(e) => setEditedPlan({ ...editedPlan, price: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  ) : (
                    <p className="mt-1 text-neutral-900">
                      {currentPlan.price === 0 ? 'Gratuito' : formatCurrency(currentPlan.price)}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-700">Descrição</label>
                {isEditing ? (
                  <Textarea
                    value={editedPlan.description ?? currentPlan.description}
                    onChange={(e) => setEditedPlan({ ...editedPlan, description: e.target.value })}
                    className="mt-1"
                    rows={3}
                  />
                ) : (
                  <p className="mt-1 text-neutral-900">{currentPlan.description}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recursos & Funcionalidades</CardTitle>
                  <CardDescription>Lista de recursos inclusos no plano</CardDescription>
                </div>
                {isEditing && (
                  <Button size="sm" onClick={addFeature} disabled={!newFeature.name || !newFeature.description}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditing && (
                <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-neutral-50 rounded-lg">
                  <Input
                    placeholder="Nome do recurso"
                    value={newFeature.name}
                    onChange={(e) => setNewFeature({ ...newFeature, name: e.target.value })}
                  />
                  <Input
                    placeholder="Descrição"
                    value={newFeature.description}
                    onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                  />
                </div>
              )}

              <div className="space-y-2">
                {currentPlan.features.map((feature) => (
                  <div key={feature.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="font-medium text-neutral-900">{feature.description}</p>
                        <p className="text-xs text-neutral-500">{feature.name}</p>
                      </div>
                    </div>
                    {isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFeature(feature.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Usage Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas de Uso</CardTitle>
              <CardDescription>Empresas e usuários utilizando este plano</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center h-12 w-12 bg-blue-100 rounded-lg mx-auto mb-2">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-neutral-900">
                    {planStats?.total_companies || 0}
                  </p>
                  <p className="text-sm text-neutral-600">Empresas</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center h-12 w-12 bg-green-100 rounded-lg mx-auto mb-2">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-neutral-900">
                    {planStats?.total_active_users || 0}
                  </p>
                  <p className="text-sm text-neutral-600">Usuários Ativos</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center h-12 w-12 bg-purple-100 rounded-lg mx-auto mb-2">
                    <DollarSign className="h-6 w-6 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-neutral-900">
                    {planStats ? formatCurrency(planStats.monthly_revenue / 100) : 'R$ 0,00'}
                  </p>
                  <p className="text-sm text-neutral-600">Receita Mensal</p>
                </div>
              </div>
              
              {/* Additional Statistics */}
              {planStats && (
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-neutral-50 rounded-lg">
                    <p className="text-lg font-bold text-neutral-900">
                      {planStats.active_companies}
                    </p>
                    <p className="text-xs text-neutral-600">Empresas Ativas</p>
                  </div>
                  <div className="text-center p-3 bg-neutral-50 rounded-lg">
                    <p className="text-lg font-bold text-neutral-900">
                      {planStats.trial_companies}
                    </p>
                    <p className="text-xs text-neutral-600">Em Teste</p>
                  </div>
                  <div className="text-center p-3 bg-neutral-50 rounded-lg">
                    <p className="text-lg font-bold text-neutral-900">
                      {(planStats.conversion_rate * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-neutral-600">Taxa de Conversão</p>
                  </div>
                  <div className="text-center p-3 bg-neutral-50 rounded-lg">
                    <p className="text-lg font-bold text-neutral-900">
                      {(planStats.churn_rate * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-neutral-600">Taxa de Churn</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Financial Report */}
          {showFinancialReport && financialReport && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Relatório Financeiro</CardTitle>
                    <CardDescription>Período: {financialReport.report_period}</CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowFinancialReport(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Revenue Section */}
                <div>
                  <h4 className="font-medium text-neutral-900 mb-3">Receita</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-700">Período Atual</p>
                      <p className="text-lg font-bold text-green-900">
                        {formatCurrency(financialReport.revenue.current_period / 100)}
                      </p>
                    </div>
                    <div className="p-3 bg-neutral-50 rounded-lg">
                      <p className="text-sm text-neutral-600">Período Anterior</p>
                      <p className="text-lg font-bold text-neutral-900">
                        {formatCurrency(financialReport.revenue.previous_period / 100)}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700">Crescimento</p>
                      <p className="text-lg font-bold text-blue-900">
                        {financialReport.revenue.growth_percentage.toFixed(1)}%
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm text-purple-700">Média/Usuário</p>
                      <p className="text-lg font-bold text-purple-900">
                        {formatCurrency(financialReport.revenue.average_per_user / 100)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Subscriptions Section */}
                <div>
                  <h4 className="font-medium text-neutral-900 mb-3">Assinaturas</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-neutral-50 rounded-lg">
                      <p className="text-sm text-neutral-600">Novas</p>
                      <p className="text-lg font-bold text-neutral-900">
                        {financialReport.subscriptions.new_subscriptions}
                      </p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-700">Canceladas</p>
                      <p className="text-lg font-bold text-red-900">
                        {financialReport.subscriptions.cancelled_subscriptions}
                      </p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <p className="text-sm text-orange-700">Taxa Churn</p>
                      <p className="text-lg font-bold text-orange-900">
                        {(financialReport.subscriptions.churn_rate * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-700">Retenção</p>
                      <p className="text-lg font-bold text-green-900">
                        {(financialReport.subscriptions.retention_rate * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Projections */}
                <div>
                  <h4 className="font-medium text-neutral-900 mb-3">Projeções</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-neutral-50 rounded-lg text-center">
                      <p className="text-sm text-neutral-600">Próximo Mês</p>
                      <p className="text-lg font-bold text-neutral-900">
                        {formatCurrency(financialReport.projections.next_month / 100)}
                      </p>
                    </div>
                    <div className="p-3 bg-neutral-50 rounded-lg text-center">
                      <p className="text-sm text-neutral-600">Próximo Trimestre</p>
                      <p className="text-lg font-bold text-neutral-900">
                        {formatCurrency(financialReport.projections.next_quarter / 100)}
                      </p>
                    </div>
                    <div className="p-3 bg-neutral-50 rounded-lg text-center">
                      <p className="text-sm text-neutral-600">Próximo Ano</p>
                      <p className="text-lg font-bold text-neutral-900">
                        {formatCurrency(financialReport.projections.next_year / 100)}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">
                    Metodologia: {financialReport.projections.methodology}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Status & Informações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-neutral-700">Status</label>
                <div className="mt-1">
                  <Badge className={currentPlan.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                    {currentPlan.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-700">Ciclo de Cobrança</label>
                <div className="mt-1">
                  <Badge variant="outline">
                    {currentPlan.cycle === 'MONTHLY' ? 'Mensal' : currentPlan.cycle === 'YEARLY' ? 'Anual' : 'Customizado'}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-700">Criado em</label>
                <p className="mt-1 text-sm text-neutral-900">
                  {formatDate(currentPlan.created_at, 'dd/MM/yyyy HH:mm')}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-700">Última atualização</label>
                <p className="mt-1 text-sm text-neutral-900">
                  {formatDate(currentPlan.updated_at, 'dd/MM/yyyy HH:mm')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push(`/admin/plans/${planId}/companies`)}
              >
                <Users className="mr-2 h-4 w-4" />
                Ver Empresas ({planCompanies?.total_count || 0})
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setShowFinancialReport(!showFinancialReport)}
                disabled={isLoadingReport}
              >
                <DollarSign className="mr-2 h-4 w-4" />
                {isLoadingReport ? 'Carregando...' : 'Relatório Financeiro'}
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-red-600 hover:text-red-700"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Deletar Plano
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center h-10 w-10 bg-red-100 rounded-lg">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">
                  Deletar Plano
                </h3>
                <p className="text-sm text-neutral-600">
                  Esta ação não pode ser desfeita
                </p>
              </div>
            </div>

            {deleteValidation && (
              <div className="mb-6">
                {deleteValidation.can_delete ? (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800 font-medium mb-1">
                      ✓ Plano pode ser deletado
                    </p>
                    <p className="text-xs text-green-700">
                      {deleteValidation.reason}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-800 font-medium mb-1">
                        ⚠ Não é possível deletar este plano
                      </p>
                      <p className="text-xs text-red-700 mb-2">
                        {deleteValidation.reason}
                      </p>
                      
                      {deleteValidation.blocking_issues.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs font-medium text-red-800 mb-1">Problemas:</p>
                          <ul className="text-xs text-red-700 space-y-1">
                            {deleteValidation.blocking_issues.map((issue, index) => (
                              <li key={index}>• {issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {deleteValidation.recommendations.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-red-800 mb-1">Recomendações:</p>
                          <ul className="text-xs text-red-700 space-y-1">
                            {deleteValidation.recommendations.map((rec, index) => (
                              <li key={index}>• {rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-neutral-600 space-y-1">
                      <p>• Empresas ativas: {deleteValidation.active_companies}</p>
                      <p>• Empresas em teste: {deleteValidation.trial_companies}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowDeleteConfirm(false)
                }}
              >
                Cancelar
              </Button>
              {deleteValidation?.can_delete && (
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={async () => {
                    try {
                      await subscriptionPlansService.deletePlan(planId)
                      toast.success('Plano deletado com sucesso!')
                      router.push('/admin/plans')
                    } catch (error: unknown) {
                      toast.error(getApiErrorMessage(error, 'Erro ao deletar plano'))
                    }
                  }}
                >
                  Deletar
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}