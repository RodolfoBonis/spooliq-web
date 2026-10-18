'use client'

import { use } from 'react'
import { usePublicBudget } from '@/lib/hooks/use-public-budget'
import { PublicBudgetView } from '@/components/public/public-budget-view'
import { Skeleton } from '@/components/ui/skeleton'
import { resolveErrorScreen } from '@/lib/budgets/public-error-screen'

export default function PublicBudgetPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = use(params)
  const { data: budget, isLoading, error } = usePublicBudget(token)

  if (isLoading) {
    return <PublicLoading />
  }

  if (error || !budget) {
    return <PublicErrorState error={error} />
  }

  return <PublicBudgetView budget={budget} token={token} />
}

function PublicLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Skeleton className="h-28 w-full" />
      <Skeleton className="mt-6 h-10 w-64" />
      <Skeleton className="mt-4 h-16 w-full" />
      <Skeleton className="mt-6 h-64 w-full" />
      <Skeleton className="mt-4 h-40 w-full" />
    </div>
  )
}

function PublicErrorState({ error }: { error: unknown }) {
  const { icon: Icon, title, description } = resolveErrorScreen(error)

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
        <Icon className="h-8 w-8 text-neutral-400" />
      </div>
      <h1 className="mt-6 text-xl font-bold text-neutral-900">{title}</h1>
      <p className="mt-2 text-sm text-neutral-600">{description}</p>
      <p className="mt-8 text-xs text-neutral-400">Powered by SpoolIQ</p>
    </div>
  )
}
