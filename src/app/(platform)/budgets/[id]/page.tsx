'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge, STATUS_CONFIG } from '@/components/budgets/status-badge'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { EmptyState } from '@/components/common/empty-state'
import { Model3DBudgetItem } from '@/components/models3d'
import { CostBreakdownBar } from '@/components/budgets/cost-breakdown-bar'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  useBudget,
  useDeleteBudget,
  useUpdateBudgetStatus,
  useGeneratePDF,
  useDuplicateBudget,
} from '@/lib/hooks/use-budgets'
import {
  formatCurrency,
  formatDateShort,
  formatWeight,
  getColorPreviewStyle,
} from '@/lib/utils/format'
import { getAllowedTransitions, isShareable } from '@/lib/budgets/status'
import { ShareBudgetDialog } from '@/components/budgets/share-budget-dialog'
import { StockWarningsAlert } from '@/components/budgets/stock-warnings-alert'
import {
  ArrowLeft,
  Edit,
  Trash2,
  Download,
  MoreVertical,
  User,
  Clock,
  Sliders,
  Package,
  DollarSign,
  AlertCircle,
  Share2,
  CalendarClock,
  MessageSquare,
  Copy,
} from 'lucide-react'
import type { BudgetStatus, BudgetWithDetails } from '@/types/models'

type DetailItem = BudgetWithDetails['items'][number]

/** Budgets created before the labor breakdown existed lack these fields. */
function isLegacyItem(item: Partial<DetailItem>): boolean {
  return item.setup_time_minutes === undefined || item.manual_labor_minutes_total === undefined
}

export default function BudgetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: budget, isLoading, error } = useBudget(id)
  const { mutate: deleteBudget } = useDeleteBudget()
  const { mutate: updateStatus } = useUpdateBudgetStatus()
  const { mutate: generatePDF, isPending: isGeneratingPDF } = useGeneratePDF()
  const { mutate: duplicateBudget, isPending: isDuplicating } = useDuplicateBudget()

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)

  if (isLoading) {
    return (
      <div className="container max-w-6xl py-6">
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
          <Skeleton className="h-32" />
        </div>
      </div>
    )
  }

  if (error || !budget) {
    return (
      <div className="container max-w-6xl py-6">
        <EmptyState
          icon={AlertCircle}
          title="Orçamento não encontrado"
          description="O orçamento que você está procurando não existe ou foi deletado."
          action={
            <Button onClick={() => router.push('/budgets')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para orçamentos
            </Button>
          }
        />
      </div>
    )
  }

  // Effective cost preset (labor rate, overhead, margin). Budgets created before
  // v2.8.0 have no budget-level preset; the API then uses the first item's.
  const effectiveCostPreset = budget.cost_preset ?? budget.items[0]?.cost_preset ?? null
  // Only legacy items with a real per-item override differ from the effective preset.
  const itemCostPresetOverride = (item: DetailItem) =>
    item.cost_preset?.name && item.cost_preset.id !== effectiveCostPreset?.id ? item.cost_preset : null

  const handleDelete = () => {
    deleteBudget(id, {
      onSuccess: () => {
        router.push('/budgets')
      },
    })
  }

  const handleChangeStatus = (status: BudgetStatus) => {
    updateStatus({ id: id, data: { status } })
  }

  const handleDownloadPDF = (force = false) => {
    generatePDF({ id: id, name: budget.name, force })
  }

  const handleDuplicate = () => {
    duplicateBudget(id, {
      onSuccess: (created) => {
        router.push(`/budgets/${created.id}/edit`)
      },
    })
  }

  const customerInitials = budget.customer.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="container max-w-6xl py-6">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              {budget.quote_number != null && (
                <p className="text-sm font-mono text-neutral-400">
                  Orçamento nº {String(budget.quote_number).padStart(4, '0')}
                </p>
              )}
              <h1 className="text-3xl font-bold text-neutral-900">{budget.name}</h1>
              {budget.description && (
                <p className="text-neutral-600 mt-1">{budget.description}</p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {budget.status === 'draft' && (
                  <DropdownMenuItem asChild>
                    <Link href={`/budgets/${id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => handleDownloadPDF(false)}
                  disabled={isGeneratingPDF}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {isGeneratingPDF ? 'Gerando PDF...' : 'Baixar PDF'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDownloadPDF(true)}
                  disabled={isGeneratingPDF}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {isGeneratingPDF ? 'Gerando PDF...' : 'Gerar Novo PDF'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDuplicate} disabled={isDuplicating}>
                  <Copy className="mr-2 h-4 w-4" />
                  {isDuplicating ? 'Duplicando...' : 'Duplicar'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Deletar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <StatusBadge status={budget.status} />
            <span className="text-sm text-neutral-500">
              Criado em {formatDateShort(budget.created_at)}
            </span>
            {budget.valid_until && (
              <span className="flex items-center gap-1 text-sm text-neutral-500">
                <CalendarClock className="h-4 w-4" />
                Válido até {formatDateShort(budget.valid_until)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stock warnings (informational only) */}
          <StockWarningsAlert warnings={budget.stock_warnings} />

          {/* Customer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary-100 text-primary-700">
                    {customerInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-neutral-900">
                    {budget.customer.name}
                  </p>
                  <p className="text-sm text-neutral-600">{budget.customer.email}</p>
                  {budget.customer.phone && (
                    <p className="text-sm text-neutral-600">
                      {budget.customer.phone}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Items ({budget.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {budget.items.map((item, index) => (
                <div key={item.id}>
                  {index > 0 && <Separator className="mb-6" />}
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-neutral-900">
                          {item.product_name}
                        </h4>
                        {item.product_description && (
                          <p className="text-sm text-neutral-600 mt-1">
                            {item.product_description}
                          </p>
                        )}
                        {item.model_3d_id && (
                          <div className="mt-2">
                            <Model3DBudgetItem modelId={item.model_3d_id} />
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-primary-600">
                          {formatCurrency(item.sale_total ?? item.item_total_cost)}
                        </span>
                        {item.sale_total !== undefined && (
                          <p className="text-xs text-neutral-500">Total de venda</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                      <div>
                        <p className="text-neutral-500">Quantidade</p>
                        <p className="font-medium">{item.product_quantity} unidades</p>
                      </div>
                      {item.product_dimensions && (
                        <div>
                          <p className="text-neutral-500">Dimensões</p>
                          <p className="font-medium">{item.product_dimensions}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-neutral-500">Tempo de Impressão</p>
                        <p className="font-medium">{item.print_time_display}</p>
                      </div>
                      {item.sale_unit_price !== undefined && (
                        <div>
                          <p className="text-neutral-500">Preço de Venda Unitário</p>
                          <p className="font-medium">
                            {formatCurrency(item.sale_unit_price)}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-neutral-500">Custo Unitário</p>
                        <p className="font-medium">
                          {formatCurrency(item.unit_price)}
                        </p>
                      </div>
                      <div>
                        <p className="text-neutral-500">Custo do Item</p>
                        <p className="font-medium">
                          {formatCurrency(item.item_total_cost)}
                        </p>
                      </div>
                      {itemCostPresetOverride(item) && (
                        <div>
                          <p className="text-neutral-500">Preset de Custo do item</p>
                          <p className="font-medium">{itemCostPresetOverride(item)?.name}</p>
                        </div>
                      )}
                      {item.setup_time_minutes > 0 && (
                        <div>
                          <p className="text-neutral-500">Tempo de Setup</p>
                          <p className="font-medium">{item.setup_time_minutes} min</p>
                        </div>
                      )}
                      {item.manual_labor_minutes_total > 0 && (
                        <div>
                          <p className="text-neutral-500">Mão de Obra Manual</p>
                          <p className="font-medium">
                            {item.manual_labor_minutes_total} min (total)
                          </p>
                        </div>
                      )}
                      {!!item.post_processing_minutes && (
                        <div>
                          <p className="text-neutral-500">Pós-processamento</p>
                          <p className="font-medium">{item.post_processing_minutes} min (total)</p>
                        </div>
                      )}
                      {!!item.support_removal_minutes && (
                        <div>
                          <p className="text-neutral-500">Remoção de Suporte</p>
                          <p className="font-medium">{item.support_removal_minutes} min (total)</p>
                        </div>
                      )}
                    </div>

                    {/* Cost breakdown (labor + Phase 4A operation costs) */}
                    {(item.setup_cost > 0 ||
                      item.manual_labor_cost > 0 ||
                      !!item.machine_cost ||
                      !!item.post_processing_cost ||
                      !!item.support_removal_cost ||
                      !!item.packaging_cost ||
                      !!item.quality_control_cost ||
                      !!item.failure_cost) && (
                      <div className="mt-3 p-3 bg-neutral-50 rounded-lg space-y-2">
                        <p className="text-xs font-medium text-neutral-700">
                          Custos de Mão de Obra e Operação:
                        </p>
                        {item.setup_cost > 0 && (
                          <div className="flex justify-between text-xs">
                            <span className="text-neutral-600">
                              Setup ({item.setup_time_minutes} min)
                            </span>
                            <span className="font-medium">
                              {formatCurrency(item.setup_cost)}
                            </span>
                          </div>
                        )}
                        {item.manual_labor_cost > 0 && (
                          <div className="flex justify-between text-xs">
                            <span className="text-neutral-600">
                              Trabalho Manual ({item.manual_labor_minutes_total} min total)
                            </span>
                            <span className="font-medium">
                              {formatCurrency(item.manual_labor_cost)}
                            </span>
                          </div>
                        )}
                        {!!item.machine_cost && (
                          <div className="flex justify-between text-xs">
                            <span className="text-neutral-600">Desgaste da Máquina</span>
                            <span className="font-medium">{formatCurrency(item.machine_cost)}</span>
                          </div>
                        )}
                        {!!item.post_processing_cost && (
                          <div className="flex justify-between text-xs">
                            <span className="text-neutral-600">Pós-processamento</span>
                            <span className="font-medium">{formatCurrency(item.post_processing_cost)}</span>
                          </div>
                        )}
                        {!!item.support_removal_cost && (
                          <div className="flex justify-between text-xs">
                            <span className="text-neutral-600">Remoção de Suporte</span>
                            <span className="font-medium">{formatCurrency(item.support_removal_cost)}</span>
                          </div>
                        )}
                        {!!item.packaging_cost && (
                          <div className="flex justify-between text-xs">
                            <span className="text-neutral-600">Embalagem</span>
                            <span className="font-medium">{formatCurrency(item.packaging_cost)}</span>
                          </div>
                        )}
                        {!!item.quality_control_cost && (
                          <div className="flex justify-between text-xs">
                            <span className="text-neutral-600">Controle de Qualidade</span>
                            <span className="font-medium">{formatCurrency(item.quality_control_cost)}</span>
                          </div>
                        )}
                        {!!item.failure_cost && (
                          <div className="flex justify-between text-xs">
                            <span className="text-neutral-600">Falhas</span>
                            <span className="font-medium">{formatCurrency(item.failure_cost)}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Filaments */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-neutral-700">
                        Filamentos:
                      </p>
                      {item.filaments.map((filament) => {
                        return (
                          <div
                            key={filament.filament_id}
                            className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg"
                          >
                            <div
                              className="h-10 w-10 rounded-full border shrink-0"
                              style={getColorPreviewStyle(filament.color_type, typeof filament.color_data === 'string' ? JSON.parse(filament.color_data) : filament.color_data)}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {filament.filament_name}
                              </p>
                              <p className="text-xs text-neutral-500">
                                {filament.brand_name} - {filament.material_name} (
                                {filament.color})
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                {formatWeight(filament.quantity)}
                              </p>
                              <p className="text-xs text-neutral-500">
                                {formatCurrency(filament.cost)}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {item.additional_notes && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-900">
                          <strong>Observação:</strong> {item.additional_notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Commercial Info */}
          {(budget.delivery_days || budget.payment_terms || budget.notes) && (
            <Card>
              <CardHeader>
                <CardTitle>Informações Comerciais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {budget.delivery_days && (
                  <div>
                    <p className="text-sm text-neutral-500">Prazo de Entrega</p>
                    <p className="font-medium">
                      {budget.delivery_days} {budget.delivery_days === 1 ? 'dia' : 'dias'}
                    </p>
                  </div>
                )}
                {budget.payment_terms && (
                  <div>
                    <p className="text-sm text-neutral-500">Condições de Pagamento</p>
                    <p className="font-medium">{budget.payment_terms}</p>
                  </div>
                )}
                {budget.notes && (
                  <div>
                    <p className="text-sm text-neutral-500">Observações</p>
                    <p className="font-medium">{budget.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={() => handleDownloadPDF(false)}
                disabled={isGeneratingPDF}
                className="w-full bg-primary-500 hover:bg-primary-600"
              >
                <Download className="mr-2 h-4 w-4" />
                {isGeneratingPDF ? 'Gerando...' : 'Baixar PDF'}
              </Button>

              {isShareable(budget.status) && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowShareDialog(true)}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Compartilhar
                </Button>
              )}

              {(() => {
                const transitions = getAllowedTransitions(budget.status)
                return (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full"
                        disabled={transitions.length === 0}
                      >
                        Mudar Status
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      {transitions.map((status) => {
                        const config = STATUS_CONFIG[status]
                        const Icon = config.icon
                        return (
                          <DropdownMenuItem
                            key={status}
                            onClick={() => handleChangeStatus(status)}
                          >
                            <Icon className="mr-2 h-4 w-4" />
                            {config.label}
                          </DropdownMenuItem>
                        )
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )
              })()}
            </CardContent>
          </Card>

          {/* Customer response (Phase 4B) */}
          {budget.customer_response_at && (() => {
            const isRejected = budget.status === 'rejected' || !!budget.rejection_reason
            return (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MessageSquare className="h-5 w-5" />
                    Resposta do cliente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className={isRejected ? 'font-semibold text-red-700' : 'font-semibold text-emerald-700'}>
                    {isRejected ? 'Orçamento recusado' : 'Orçamento aprovado'}
                  </p>
                  {budget.customer_response_name && (
                    <p className="text-neutral-700">
                      por <strong>{budget.customer_response_name}</strong>
                    </p>
                  )}
                  <p className="text-neutral-500">
                    em {formatDateShort(budget.customer_response_at)}
                  </p>
                  {budget.rejection_reason && (
                    <div className="mt-2 p-3 bg-neutral-50 rounded-lg">
                      <p className="text-neutral-500">Motivo</p>
                      <p className="text-neutral-800">{budget.rejection_reason}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })()}

          {/* Cost Breakdown */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <DollarSign className="h-5 w-5" />
                  Custos
                </CardTitle>
                {/* Legacy calculation badge */}
                {budget.items.some(isLegacyItem) && (
                  <Badge variant="outline" className="bg-yellow-50 border-yellow-300 text-yellow-700">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Cálculo Antigo
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Legacy calculation warning */}
              {budget.items.some(isLegacyItem) && (
                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertTitle className="text-yellow-800">
                    Este orçamento usa cálculo antigo
                  </AlertTitle>
                  <AlertDescription className="text-yellow-700 text-sm">
                    Recomendamos duplicar e recalcular para usar o novo modelo de custos com breakdown detalhado de mão de obra.
                  </AlertDescription>
                </Alert>
              )}

              {/* Direct Costs */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Custos Diretos
                </p>
                <CostBreakdownBar
                  label="Filamentos"
                  amount={budget.filament_cost}
                  total={budget.total_cost}
                  color="blue"
                />
                {budget.include_waste_cost && budget.waste_cost > 0 && (
                  <CostBreakdownBar
                    label="Desperdício (AMS)"
                    amount={budget.waste_cost}
                    total={budget.total_cost}
                    color="red"
                  />
                )}
                {budget.include_energy_cost && budget.energy_cost > 0 && (
                  <CostBreakdownBar
                    label="Energia"
                    amount={budget.energy_cost}
                    total={budget.total_cost}
                    color="yellow"
                  />
                )}
                {!!budget.machine_cost && (
                  <CostBreakdownBar
                    label="Desgaste da Máquina"
                    amount={budget.machine_cost ?? 0}
                    total={budget.total_cost}
                    color="purple"
                  />
                )}
                {budget.setup_cost > 0 && (
                  <CostBreakdownBar
                    label="Setup"
                    amount={budget.setup_cost}
                    total={budget.total_cost}
                    color="orange"
                  />
                )}
                {budget.labor_cost > 0 && (
                  <CostBreakdownBar
                    label="Mão de Obra Manual"
                    amount={budget.labor_cost}
                    total={budget.total_cost}
                    color="purple"
                  />
                )}
                {!!budget.post_processing_cost && (
                  <CostBreakdownBar
                    label="Pós-processamento"
                    amount={budget.post_processing_cost ?? 0}
                    total={budget.total_cost}
                    color="blue"
                  />
                )}
                {!!budget.packaging_cost && (
                  <CostBreakdownBar
                    label="Embalagem"
                    amount={budget.packaging_cost ?? 0}
                    total={budget.total_cost}
                    color="orange"
                  />
                )}
                {!!budget.quality_control_cost && (
                  <CostBreakdownBar
                    label="Controle de Qualidade"
                    amount={budget.quality_control_cost ?? 0}
                    total={budget.total_cost}
                    color="yellow"
                  />
                )}
                {!!budget.failure_cost && (
                  <CostBreakdownBar
                    label="Falhas"
                    amount={budget.failure_cost ?? 0}
                    total={budget.total_cost}
                    color="red"
                  />
                )}
              </div>

              <Separator />

              {/* Subtotal */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-700 font-medium">Subtotal</span>
                <span className="font-semibold">
                  {formatCurrency(
                    budget.filament_cost +
                    budget.waste_cost +
                    budget.energy_cost +
                    (budget.machine_cost ?? 0) +
                    (budget.setup_cost || 0) +
                    budget.labor_cost +
                    (budget.post_processing_cost ?? 0) +
                    (budget.packaging_cost ?? 0) +
                    (budget.quality_control_cost ?? 0) +
                    (budget.failure_cost ?? 0)
                  )}
                </span>
              </div>

              {/* Overhead */}
              {budget.overhead_cost > 0 && (
                <CostBreakdownBar
                  label="Overhead"
                  amount={budget.overhead_cost}
                  total={budget.total_cost}
                  color="yellow"
                />
              )}

              {/* Profit */}
              {budget.profit_amount > 0 && (
                <CostBreakdownBar
                  label="Margem de Lucro"
                  amount={budget.profit_amount}
                  total={budget.total_cost}
                  color="green"
                />
              )}

              {/* Base price, discount, shipping and taxes (Phase 4A) */}
              {!!budget.base_price && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-700 font-medium">Preço base</span>
                  <span className="font-semibold">{formatCurrency(budget.base_price)}</span>
                </div>
              )}
              {!!budget.discount_amount && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-700">
                    {budget.discount_type === 'percent' && budget.discount_value != null
                      ? `Desconto (${budget.discount_value}%)`
                      : 'Desconto'}
                  </span>
                  <span className="font-semibold text-red-600">
                    − {formatCurrency(budget.discount_amount)}
                  </span>
                </div>
              )}
              {!!budget.shipping_cost && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-700">Frete</span>
                  <span className="font-semibold">{formatCurrency(budget.shipping_cost)}</span>
                </div>
              )}
              {!!budget.tax_amount && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-700">
                    {budget.tax_rate_applied != null
                      ? `Impostos (${budget.tax_rate_applied}%)`
                      : 'Impostos'}
                  </span>
                  <span className="font-semibold">{formatCurrency(budget.tax_amount)}</span>
                </div>
              )}

              <Separator />

              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-900">Total</span>
                <span className="text-2xl font-bold text-primary-600">
                  {formatCurrency(budget.total_cost)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Calculation settings (profile and presets) */}
          {(budget.profile || budget.machine_preset || budget.energy_preset || effectiveCostPreset) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sliders className="h-5 w-5" />
                  Configuração de Cálculo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2 text-sm">
                  {[
                    { label: 'Perfil de impressão', ref: budget.profile },
                    { label: 'Máquina', ref: budget.machine_preset },
                    { label: 'Energia', ref: budget.energy_preset },
                    { label: 'Custos (mão de obra, overhead e margem)', ref: effectiveCostPreset },
                  ]
                    .filter((entry) => entry.ref?.name)
                    .map((entry) => (
                      <div key={entry.label} className="flex items-start justify-between gap-3">
                        <dt className="text-neutral-500">{entry.label}</dt>
                        <dd className="font-medium text-right">{entry.ref?.name}</dd>
                      </div>
                    ))}
                </dl>
              </CardContent>
            </Card>
          )}

          {/* Print Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-5 w-5" />
                Tempo Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-neutral-900">
                {budget.total_print_time_display}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <ShareBudgetDialog
        budget={budget}
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Deletar orçamento"
        description={`Tem certeza que deseja deletar o orçamento "${budget.name}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleDelete}
        confirmText="Deletar"
        variant="destructive"
      />
    </div>
  )
}

