import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import subscriptionPlansService, {
  type CreatePlanRequest,
  type UpdatePlanRequest,
  type PlanListResponse,
} from '@/services/subscription-plans-service'
import type { SubscriptionPlanModel } from '@/types/models'

export function useActivePlans() {
  return useQuery({
    queryKey: ['subscription-plans', 'active'],
    queryFn: () => subscriptionPlansService.listActivePlans(),
  })
}

export function useAllPlans() {
  return useQuery({
    queryKey: ['subscription-plans', 'all'],
    queryFn: () => subscriptionPlansService.listAllPlans(),
  })
}

export function useCreatePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePlanRequest) =>
      subscriptionPlansService.createPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] })
      toast.success('Plano criado com sucesso!')
    },
    onError: (error: any) => {
      console.error('Error creating plan:', error)
      toast.error(
        error?.response?.data?.message ||
          'Erro ao criar plano. Tente novamente.'
      )
    },
  })
}

export function useUpdatePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdatePlanRequest }) =>
      subscriptionPlansService.updatePlan(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] })
      toast.success('Plano atualizado com sucesso!')
    },
    onError: (error: any) => {
      console.error('Error updating plan:', error)
      toast.error(
        error?.response?.data?.message ||
          'Erro ao atualizar plano. Tente novamente.'
      )
    },
  })
}

export function useDeletePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => subscriptionPlansService.deletePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] })
      toast.success('Plano removido com sucesso!')
    },
    onError: (error: any) => {
      console.error('Error deleting plan:', error)
      toast.error(
        error?.response?.data?.message ||
          'Erro ao remover plano. Tente novamente.'
      )
    },
  })
}

export function usePlansComparison() {
  const { data } = useActivePlans()
  
  if (!data?.plans) {
    return { formattedPlans: [], isLoading: true }
  }

  const formattedPlans = subscriptionPlansService.formatPlansForComparison(data.plans)
  
  return {
    formattedPlans,
    isLoading: false,
    basicPlan: formattedPlans.find(p => p.name.toLowerCase().includes('básico')),
    proPlan: formattedPlans.find(p => p.name.toLowerCase().includes('pro')),
    enterprisePlan: formattedPlans.find(p => p.name.toLowerCase().includes('enterprise')),
  }
}

export function usePlanRecommendation(currentPlan?: string, userCount?: number, features?: string[]) {
  const { formattedPlans } = usePlansComparison()
  
  if (!formattedPlans.length) return null

  // Simple recommendation logic
  if (!currentPlan || currentPlan === 'trial') {
    if (userCount && userCount > 10) {
      return formattedPlans.find(p => p.name.toLowerCase().includes('enterprise'))
    }
    return formattedPlans.find(p => p.isPopular) || formattedPlans[1] // Default to Pro
  }

  // If user has basic, recommend pro
  if (currentPlan === 'basic' && userCount && userCount > 5) {
    return formattedPlans.find(p => p.name.toLowerCase().includes('pro'))
  }

  // If user has pro, recommend enterprise for large teams
  if (currentPlan === 'pro' && userCount && userCount > 20) {
    return formattedPlans.find(p => p.name.toLowerCase().includes('enterprise'))
  }

  return null
}

export function usePlanFeatures() {
  return {
    basic: [
      '5 usuários',
      '100 orçamentos por mês',
      'PDF básico',
      'Suporte por email',
    ],
    pro: [
      '15 usuários',
      'Orçamentos ilimitados',
      'PDF personalizado',
      'Dashboard analítico',
      'Suporte prioritário',
      'API de integração',
    ],
    enterprise: [
      'Usuários ilimitados',
      'Orçamentos ilimitados',
      'PDF totalmente personalizado',
      'Dashboard avançado',
      'Suporte dedicado',
      'API completa',
      'White label',
      'Integração personalizada',
    ],
  }
}