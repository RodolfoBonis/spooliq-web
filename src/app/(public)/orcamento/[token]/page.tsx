'use client'

import { use } from 'react'
import { isAxiosError } from 'axios'
import { usePublicBudget } from '@/lib/hooks/use-public-budget'
import { PublicBudgetView } from '@/components/public/public-budget-view'
import { Skeleton } from '@/components/ui/skeleton'
import { FileQuestion, Clock, Ban, AlertCircle, type LucideIcon } from 'lucide-react'

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

interface ErrorScreen {
  icon: LucideIcon
  title: string
  description: string
}

function resolveErrorScreen(error: unknown): ErrorScreen {
  const status = isAxiosError(error) ? error.response?.status : undefined
  const data = isAxiosError(error) ? (error.response?.data as { code?: string } | undefined) : undefined
  const code = data?.code

  if (status === 404 || code === 'public_budget_not_found') {
    return {
      icon: FileQuestion,
      title: 'Orçamento não encontrado',
      description:
        'O link pode estar incorreto ou ter sido revogado. Confira o endereço recebido ou entre em contato com a empresa.',
    }
  }

  if (status === 410 || code === 'budget_expired') {
    return {
      icon: Clock,
      title: 'Orçamento expirado',
      description:
        'Este orçamento não está mais disponível. Entre em contato com a empresa para gerar um novo.',
    }
  }

  if (code === 'budget_already_responded') {
    return {
      icon: Ban,
      title: 'Orçamento já respondido',
      description: 'Este orçamento já foi aprovado ou recusado e não aceita novas respostas.',
    }
  }

  if (status === 409 || code === 'budget_not_available') {
    return {
      icon: Ban,
      title: 'Orçamento indisponível',
      description: 'Este orçamento não está mais disponível para visualização.',
    }
  }

  if (status === 429 || code === 'rate_limited') {
    return {
      icon: AlertCircle,
      title: 'Muitas tentativas',
      description: 'Aguarde alguns instantes e tente novamente.',
    }
  }

  return {
    icon: AlertCircle,
    title: 'Não foi possível carregar o orçamento',
    description: 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
  }
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
