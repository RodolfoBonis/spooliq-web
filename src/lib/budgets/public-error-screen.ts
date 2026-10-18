import { isAxiosError } from 'axios'
import { FileQuestion, Clock, Ban, AlertCircle, PencilLine, type LucideIcon } from 'lucide-react'

export interface ErrorScreen {
  icon: LucideIcon
  title: string
  description: string
}

export function resolveErrorScreen(error: unknown): ErrorScreen {
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

  // The company reopened the budget to adjust it at the customer's request.
  if (code === 'budget_under_review') {
    return {
      icon: PencilLine,
      title: 'Orçamento em revisão',
      description:
        'A empresa está ajustando este orçamento. Você receberá a nova versão neste mesmo link em breve.',
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
