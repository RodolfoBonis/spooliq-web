'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/budgets/status-badge'
import { formatCurrency } from '@/lib/utils/format'
import {
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Printer
} from 'lucide-react'
import type { CustomerBudget, BudgetStatus } from '@/types/models'

interface CustomerBudgetTableProps {
  budgets: CustomerBudget[]
  customerName: string
  limit?: number
  onDelete?: (id: string) => void
  onGeneratePDF?: (id: string, name: string) => void
  onStatusChange?: (id: string, newStatus: BudgetStatus) => void
}

// Status que precisam de atenção (urgência)
const URGENT_STATUSES: BudgetStatus[] = ['sent', 'approved', 'printing']

// Mapear status para ação rápida disponível
const getQuickAction = (status: BudgetStatus) => {
  switch (status) {
    case 'sent':
      return { label: 'Aprovar', newStatus: 'approved' as BudgetStatus, icon: CheckCircle }
    case 'approved':
      return { label: 'Imprimir', newStatus: 'printing' as BudgetStatus, icon: Printer }
    case 'printing':
      return { label: 'Concluir', newStatus: 'completed' as BudgetStatus, icon: CheckCircle }
    default:
      return null
  }
}

// Ícone de urgência baseado no status
const getUrgencyIcon = (status: BudgetStatus) => {
  if (!URGENT_STATUSES.includes(status)) return null

  switch (status) {
    case 'sent':
      return (
        <span title="Aguardando resposta">
          <Clock className="h-4 w-4 text-blue-500" />
        </span>
      )
    case 'approved':
      return (
        <span title="Aprovado - pronto para produção">
          <AlertCircle className="h-4 w-4 text-emerald-500" />
        </span>
      )
    case 'printing':
      return (
        <span title="Em produção">
          <Printer className="h-4 w-4 text-orange-500" />
        </span>
      )
    default:
      return null
  }
}

export function CustomerBudgetTable({
  budgets,
  customerName,
  limit = 10,
  onDelete,
  onGeneratePDF,
  onStatusChange,
}: CustomerBudgetTableProps) {
  const displayBudgets = limit ? budgets.slice(0, limit) : budgets
  const hasMore = budgets.length > limit

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir o orçamento "${name}"?`)) {
      onDelete?.(id)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"></TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-right w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayBudgets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-neutral-500">
                  Nenhum orçamento encontrado
                </TableCell>
              </TableRow>
            ) : (
              displayBudgets.map((budget) => {
                const quickAction = getQuickAction(budget.status)
                const urgencyIcon = getUrgencyIcon(budget.status)

                return (
                  <TableRow key={budget.id} className="group">
                    {/* Coluna de Urgência */}
                    <TableCell className="text-center">
                      {urgencyIcon}
                    </TableCell>

                    {/* Nome do Orçamento */}
                    <TableCell>
                      <Link
                        href={`/budgets/${budget.id}`}
                        className="font-medium text-neutral-900 hover:text-primary transition-colors"
                      >
                        {budget.name}
                      </Link>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <StatusBadge status={budget.status} />
                    </TableCell>

                    {/* Valor */}
                    <TableCell className="text-right font-medium">
                      {formatCurrency(budget.total_cost)}
                    </TableCell>

                    {/* Ações */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Ação Rápida de Status */}
                        {quickAction && onStatusChange && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onStatusChange(budget.id, quickAction.newStatus)}
                            className="h-8 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            title={quickAction.label}
                          >
                            <quickAction.icon className="h-4 w-4" />
                          </Button>
                        )}

                        {/* Menu de Ações */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Abrir menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/budgets/${budget.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver detalhes
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/budgets/${budget.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </Link>
                            </DropdownMenuItem>
                            {onGeneratePDF && (
                              <DropdownMenuItem
                                onClick={() => onGeneratePDF(budget.id, budget.name)}
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                Gerar PDF
                              </DropdownMenuItem>
                            )}
                            {onDelete && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDelete(budget.id, budget.name)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Excluir
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Link "Ver todos" quando há mais orçamentos */}
      {hasMore && (
        <div className="flex justify-center">
          <Button variant="outline" asChild>
            <Link href={`/budgets?search=${encodeURIComponent(customerName)}`}>
              Ver todos os {budgets.length} orçamentos
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
