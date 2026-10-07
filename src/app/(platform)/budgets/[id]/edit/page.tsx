'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { BudgetForm } from '@/components/budgets/budget-form'
import { useBudget, useDuplicateBudget } from '@/lib/hooks/use-budgets'
import { budgetToFormValues, budgetToSelectedFilaments } from '@/lib/budgets/budget-form-mapping'
import { STATUS_CONFIG } from '@/components/budgets/status-badge'
import { ArrowLeft, AlertCircle, Lock, Copy } from 'lucide-react'

export default function EditBudgetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  // Always refetch on mount and wait for it: the form reads its defaults once, so it
  // must never initialize from a stale cached detail (edits in another tab, or a
  // status that is no longer draft).
  const { data: budget, isLoading, isFetchedAfterMount, error } = useBudget(id, { refetchOnMount: 'always' })
  const { mutate: duplicateBudget, isPending: isDuplicating } = useDuplicateBudget()

  const handleDuplicate = () => {
    duplicateBudget(id, {
      onSuccess: (created) => {
        router.push(`/budgets/${created.id}/edit`)
      },
    })
  }

  if (isLoading || (!isFetchedAfterMount && !error)) {
    return (
      <div className="container max-w-5xl py-6">
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-64" />
          <Skeleton className="h-32" />
        </div>
      </div>
    )
  }

  if (error || !budget) {
    return (
      <div className="container max-w-5xl py-6">
        <EmptyState
          icon={AlertCircle}
          title="Orçamento não encontrado"
          description="O orçamento que você está tentando editar não existe ou foi deletado."
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

  // The API only allows editing drafts — show a read-only notice for anything else.
  if (budget.status !== 'draft') {
    const statusLabel = STATUS_CONFIG[budget.status]?.label ?? budget.status
    return (
      <div className="container max-w-3xl py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Voltar">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Editar Orçamento</h1>
            <p className="text-neutral-600 mt-1">{budget.name}</p>
          </div>
        </div>

        <Alert>
          <Lock className="h-4 w-4" />
          <AlertTitle>Edição indisponível</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>
              Apenas orçamentos em rascunho podem ser editados. Este orçamento está no status{' '}
              <strong>{statusLabel}</strong>.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Button asChild variant="outline" size="sm">
                <Link href={`/budgets/${id}`}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar ao orçamento
                </Link>
              </Button>
              <Button size="sm" onClick={handleDuplicate} disabled={isDuplicating}>
                <Copy className="mr-2 h-4 w-4" />
                {isDuplicating ? 'Duplicando...' : 'Duplicar para editar'}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <BudgetForm
      mode="edit"
      budgetId={id}
      initialValues={budgetToFormValues(budget)}
      initialSelectedFilaments={budgetToSelectedFilaments(budget)}
    />
  )
}
