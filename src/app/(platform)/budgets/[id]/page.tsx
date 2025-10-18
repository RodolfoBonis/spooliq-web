'use client'

import { useState } from 'react'
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
import {
  useBudget,
  useDeleteBudget,
  useUpdateBudgetStatus,
  useGeneratePDF,
} from '@/lib/hooks/use-budgets'
import {
  formatCurrency,
  formatDateShort,
  formatTime,
  formatWeight,
  getColorPreviewStyle,
} from '@/lib/utils/format'
import {
  ArrowLeft,
  Edit,
  Trash2,
  Download,
  MoreVertical,
  FileText,
  User,
  Calendar,
  Clock,
  Package,
  DollarSign,
  AlertCircle,
} from 'lucide-react'
import type { BudgetStatus } from '@/types/models'

export default function BudgetDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: budget, isLoading, error } = useBudget(params.id)
  const { mutate: deleteBudget } = useDeleteBudget()
  const { mutate: updateStatus } = useUpdateBudgetStatus()
  const { mutate: generatePDF, isPending: isGeneratingPDF } = useGeneratePDF()

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

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

  const handleDelete = () => {
    deleteBudget(params.id, {
      onSuccess: () => {
        router.push('/budgets')
      },
    })
  }

  const handleChangeStatus = (status: BudgetStatus) => {
    updateStatus({ id: params.id, data: { status } })
  }

  const handleDownloadPDF = () => {
    generatePDF({ id: params.id, name: budget.name })
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
                <DropdownMenuItem asChild>
                  <Link href={`/budgets/${params.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {isGeneratingPDF ? 'Gerando PDF...' : 'Baixar PDF'}
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
          <div className="flex items-center gap-4 mt-4">
            <StatusBadge status={budget.status} />
            <span className="text-sm text-neutral-500">
              Criado em {formatDateShort(budget.created_at)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
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
                      </div>
                      <span className="text-lg font-bold text-primary-600">
                        {formatCurrency(item.item_total_cost)}
                      </span>
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
                      <div>
                        <p className="text-neutral-500">Preço Unitário</p>
                        <p className="font-medium">
                          {formatCurrency(item.unit_price)}
                        </p>
                      </div>
                    </div>

                    {/* Filaments */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-neutral-700">
                        Filamentos:
                      </p>
                      {item.filaments.map((filament) => {
                        // Reconstruct color_data for preview
                        const colorData = { color: filament.color }
                        const colorType = 'solid' as const

                        return (
                          <div
                            key={filament.filament_id}
                            className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg"
                          >
                            <div
                              className="h-10 w-10 rounded-full border shrink-0"
                              style={getColorPreviewStyle(colorType, colorData)}
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
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="w-full bg-primary-500 hover:bg-primary-600"
              >
                <Download className="mr-2 h-4 w-4" />
                {isGeneratingPDF ? 'Gerando...' : 'Baixar PDF'}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full">
                    Mudar Status
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  {(Object.entries(STATUS_CONFIG) as [BudgetStatus, any][]).map(
                    ([status, config]) => {
                      const Icon = config.icon
                      return (
                        <DropdownMenuItem
                          key={status}
                          onClick={() => handleChangeStatus(status)}
                          disabled={status === budget.status}
                        >
                          <Icon className="mr-2 h-4 w-4" />
                          {config.label}
                        </DropdownMenuItem>
                      )
                    }
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>

          {/* Cost Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="h-5 w-5" />
                Custos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">Filamentos</span>
                <span className="font-medium">
                  {formatCurrency(budget.filament_cost)}
                </span>
              </div>
              {budget.include_waste_cost && budget.waste_cost > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Desperdício (AMS)</span>
                  <span className="font-medium">
                    {formatCurrency(budget.waste_cost)}
                  </span>
                </div>
              )}
              {budget.include_energy_cost && budget.energy_cost > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Energia</span>
                  <span className="font-medium">
                    {formatCurrency(budget.energy_cost)}
                  </span>
                </div>
              )}
              {budget.labor_cost > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Mão de Obra</span>
                  <span className="font-medium">
                    {formatCurrency(budget.labor_cost)}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-900">Total</span>
                <span className="text-2xl font-bold text-primary-600">
                  {formatCurrency(budget.total_cost)}
                </span>
              </div>
            </CardContent>
          </Card>

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

