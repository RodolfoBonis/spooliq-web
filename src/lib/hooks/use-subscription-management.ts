import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import subscriptionManagementService, {
  type SubscribeToPlanRequest,
  type CancelSubscriptionRequest,
  type SubscribeResponse,
  type SubscriptionStatusResponse,
} from '@/services/subscription-management-service'

export function useSubscriptionStatus() {
  return useQuery({
    queryKey: ['subscription-status'],
    queryFn: () => subscriptionManagementService.getSubscriptionStatus(),
  })
}

export function useSubscribeToPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SubscribeToPlanRequest) =>
      subscriptionManagementService.subscribeToPlan(data),
    onSuccess: (data: SubscribeResponse) => {
      queryClient.invalidateQueries({ queryKey: ['subscription-status'] })
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
      
      if (data.redirect_url) {
        // Redirect to payment gateway if needed
        window.location.href = data.redirect_url
      } else {
        toast.success('Assinatura ativada com sucesso!')
      }
    },
    onError: (error: any) => {
      console.error('Error subscribing to plan:', error)
      toast.error(
        error?.response?.data?.message ||
          'Erro ao ativar assinatura. Tente novamente.'
      )
    },
  })
}

export function useCancelSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data?: CancelSubscriptionRequest) =>
      subscriptionManagementService.cancelSubscription(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['subscription-status'] })
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
      toast.success(
        `Assinatura cancelada. Efetiva em: ${new Date(data.effective_date).toLocaleDateString('pt-BR')}`
      )
    },
    onError: (error: any) => {
      console.error('Error cancelling subscription:', error)
      toast.error(
        error?.response?.data?.message ||
          'Erro ao cancelar assinatura. Tente novamente.'
      )
    },
  })
}

export function useReactivateSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => subscriptionManagementService.reactivateSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-status'] })
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
      toast.success('Assinatura reativada com sucesso!')
    },
    onError: (error: any) => {
      console.error('Error reactivating subscription:', error)
      toast.error(
        error?.response?.data?.message ||
          'Erro ao reativar assinatura. Tente novamente.'
      )
    },
  })
}

export function useChangePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (newPlanId: string) =>
      subscriptionManagementService.changePlan(newPlanId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['subscription-status'] })
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
      
      let message = 'Plano alterado com sucesso!'
      if (data.proration && data.proration !== 0) {
        const prorationType = data.proration > 0 ? 'crédito' : 'cobrança'
        const amount = Math.abs(data.proration / 100).toFixed(2)
        message += ` ${prorationType === 'crédito' ? 'Você receberá' : 'Será cobrado'} R$ ${amount} de ${prorationType}.`
      }
      
      toast.success(message)
    },
    onError: (error: any) => {
      console.error('Error changing plan:', error)
      toast.error(
        error?.response?.data?.message ||
          'Erro ao alterar plano. Tente novamente.'
      )
    },
  })
}

export function useSubscriptionActions() {
  const { data: status } = useSubscriptionStatus()
  
  const canUpgrade = status?.status === 'trial' || status?.status === 'active'
  const canCancel = status?.status === 'active' || status?.status === 'trial'
  const canReactivate = status?.status === 'cancelled'
  const needsPaymentMethod = status?.status === 'trial' && !status?.can_access_features
  
  return {
    canUpgrade,
    canCancel,
    canReactivate,
    needsPaymentMethod,
    isTrialExpiring: status?.status === 'trial' && (status?.days_remaining || 0) <= 7,
    daysRemaining: status?.days_remaining,
  }
}