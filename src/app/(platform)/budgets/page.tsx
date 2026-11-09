'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { BudgetCard } from '@/components/budgets/budget-card'
import { EmptyState } from '@/components/common/empty-state'
import { PaginationControls } from '@/components/common/pagination-controls'
import { Skeleton } from '@/components/ui/skeleton'
import { useBudgets, useDeleteBudget, useGeneratePDF } from '@/lib/hooks/use-budgets'
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value'
import { Plus, Search, FileText } from 'lucide-react'
import type { BudgetStatus } from '@/types/models'

const PAGE_SIZE = 12

function BudgetsPageContent() {
  const searchParams = useSearchParams()
  const initialSearch = searchParams.get('search') ?? ''

  const [search, setSearch] = useState(initialSearch)
  const [statusFilter, setStatusFilter] = useState<BudgetStatus | 'all'>('all')
  const [page, setPage] = useState(1)

  const debouncedSearch = useDebouncedValue(search, 300)

  const { data, isLoading } = useBudgets({
    search: debouncedSearch || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    page,
    pageSize: PAGE_SIZE,
  })

  const { mutate: deleteBudget } = useDeleteBudget()
  const { mutate: generatePDF } = useGeneratePDF()

  const handleDelete = (id: string) => {
    deleteBudget(id)
  }

  const handleGeneratePDF = (id: string, name: string, force = false) => {
    generatePDF({ id, name, force })
  }

  if (isLoading) {
    return (
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Orçamentos</h1>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Novo Orçamento
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    )
  }

  const budgets = data?.data || []
  const totalPages = data?.total_pages || 1

  return (
    <div className="container py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Orçamentos</h1>
          <p className="text-neutral-600 mt-1">
            Gerencie seus orçamentos de impressão 3D
          </p>
        </div>
        <Button asChild>
          <Link href="/budgets/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Orçamento
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Buscar por nº, nome ou cliente..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value as BudgetStatus | 'all')
              setPage(1)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="draft">Rascunho</SelectItem>
              <SelectItem value="sent">Enviado</SelectItem>
              <SelectItem value="approved">Aprovado</SelectItem>
              <SelectItem value="rejected">Rejeitado</SelectItem>
              <SelectItem value="expired">Expirado</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
              <SelectItem value="printing">Imprimindo</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Empty State */}
      {budgets.length === 0 && (
        <EmptyState
          icon={FileText}
          title="Nenhum orçamento encontrado"
          description={
            search || statusFilter !== 'all'
              ? 'Tente ajustar os filtros para encontrar orçamentos'
              : 'Comece criando seu primeiro orçamento'
          }
          action={
            !search && statusFilter === 'all' ? (
              <Button asChild>
                <Link href="/budgets/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Orçamento
                </Link>
              </Button>
            ) : undefined
          }
        />
      )}

      {/* Budget Grid */}
      {budgets.length > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
            {budgets.map((budget) => (
              <BudgetCard
                key={budget.id}
                budget={{
                  ...budget,
                  items_count: budget.items?.length || 0
                }}
                onDelete={handleDelete}
                onGeneratePDF={handleGeneratePDF}
              />
            ))}
          </div>

          <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}

export default function BudgetsPage() {
  return (
    <Suspense fallback={null}>
      <BudgetsPageContent />
    </Suspense>
  )
}
