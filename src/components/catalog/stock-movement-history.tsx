'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useStockMovements } from '@/lib/hooks/use-filaments'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { PaginationControls } from '@/components/common/pagination-controls'
import { formatDateShort, formatGramsSigned } from '@/lib/utils/format'
import { STOCK_MOVEMENT_LABELS } from '@/lib/catalog/stock'
import { cn } from '@/lib/utils'
import type { StockMovement, StockMovementType } from '@/types/models'

const PAGE_SIZE = 10

const TYPE_FILTER_OPTIONS: Array<{ value: StockMovementType | 'all'; label: string }> = [
  { value: 'all', label: 'Todos os tipos' },
  { value: 'purchase', label: 'Compra' },
  { value: 'adjustment', label: 'Ajuste' },
  { value: 'waste', label: 'Perda' },
  { value: 'consumption', label: 'Consumo' },
]

function MovementTypeCell({ movement }: { movement: StockMovement }) {
  const label = STOCK_MOVEMENT_LABELS[movement.type] ?? movement.type

  if (movement.type === 'consumption' && movement.budget_id) {
    const quote = movement.budget_quote_number
    return (
      <Link
        href={`/budgets/${movement.budget_id}`}
        className="text-primary-600 hover:underline"
      >
        {label}
        {quote != null ? ` (orçamento nº ${quote})` : ''}
      </Link>
    )
  }

  return <span>{label}</span>
}

export function StockMovementHistory({ filamentId }: { filamentId: string }) {
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState<StockMovementType | 'all'>('all')

  const { data, isLoading } = useStockMovements(filamentId, {
    page,
    pageSize: PAGE_SIZE,
    type: typeFilter === 'all' ? undefined : typeFilter,
  })

  const movements = data?.data ?? []

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <h4 className="text-sm font-semibold text-neutral-900">Histórico de movimentações</h4>
        <div className="w-44 space-y-1">
          <Label htmlFor="movement-type-filter" className="text-xs text-neutral-500">
            Filtrar por tipo
          </Label>
          <Select
            value={typeFilter}
            onValueChange={(value) => {
              setTypeFilter(value as StockMovementType | 'all')
              setPage(1)
            }}
          >
            <SelectTrigger id="movement-type-filter" className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPE_FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : movements.length === 0 ? (
        <p className="py-6 text-center text-sm text-neutral-500">
          Nenhuma movimentação registrada.
        </p>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Observação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell className="font-medium">
                    <MovementTypeCell movement={movement} />
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-right font-medium tabular-nums',
                      movement.grams >= 0 ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {formatGramsSigned(movement.grams)}
                  </TableCell>
                  <TableCell className="text-neutral-600">
                    {formatDateShort(movement.created_at)}
                  </TableCell>
                  <TableCell className="max-w-[16rem] truncate text-neutral-600" title={movement.note ?? ''}>
                    {movement.note || '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <PaginationControls
        page={page}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
      />
    </div>
  )
}
