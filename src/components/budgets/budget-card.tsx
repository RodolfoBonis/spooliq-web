'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { StatusBadge } from './status-badge'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { formatCurrency, formatDateShort } from '@/lib/utils/format'
import type { Budget } from '@/types/models'
import {
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  FileText,
  Download,
} from 'lucide-react'

interface BudgetCardProps {
  budget: Budget & {
    customer: {
      id: string
      name: string
      email: string
    }
    items_count: number
  }
  onDelete?: (id: string) => void
  onGeneratePDF?: (id: string, name: string) => void
}

export function BudgetCard({ budget, onDelete, onGeneratePDF }: BudgetCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDelete = () => {
    onDelete?.(budget.id)
    setShowDeleteDialog(false)
  }

  const customerInitials = budget.customer.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Link
                href={`/budgets/${budget.id}`}
                className="text-lg font-semibold text-neutral-900 hover:text-primary-600 transition-colors"
              >
                {budget.name}
              </Link>
              {budget.description && (
                <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
                  {budget.description}
                </p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
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
                {budget.pdf_url && (
                  <DropdownMenuItem
                    onClick={() => onGeneratePDF?.(budget.id, budget.name)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Baixar PDF
                  </DropdownMenuItem>
                )}
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
        </CardHeader>

        <CardContent className="pb-3">
          {/* Customer */}
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary-100 text-primary-700 text-xs">
                {customerInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 truncate">
                {budget.customer.name}
              </p>
              <p className="text-xs text-neutral-500 truncate">
                {budget.customer.email}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-neutral-500">Items</p>
              <p className="font-medium text-neutral-900">{budget.items_count}</p>
            </div>
            <div>
              <p className="text-neutral-500">Criado em</p>
              <p className="font-medium text-neutral-900">
                {formatDateShort(budget.created_at)}
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-3 border-t flex items-center justify-between">
          <StatusBadge status={budget.status} />
          <div className="text-right">
            <p className="text-2xl font-bold text-primary-600">
              {formatCurrency(budget.total_cost)}
            </p>
          </div>
        </CardFooter>
      </Card>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Deletar orçamento"
        description={`Tem certeza que deseja deletar o orçamento "${budget.name}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleDelete}
        confirmText="Deletar"
        variant="destructive"
      />
    </>
  )
}

