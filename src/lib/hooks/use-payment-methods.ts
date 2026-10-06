import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import paymentMethodService, {
  type AddPaymentMethodRequest,
} from '@/services/payment-method-service'
import { getApiErrorMessage } from '@/lib/api/errors'

export function usePaymentMethods() {
  return useQuery({
    queryKey: ['payment-methods'],
    queryFn: () => paymentMethodService.listPaymentMethods(),
  })
}

export function useAddPaymentMethod() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AddPaymentMethodRequest) =>
      paymentMethodService.addPaymentMethod(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] })
      toast.success('Método de pagamento adicionado com sucesso!')
    },
    onError: (error: unknown) => {
      toast.error(
        getApiErrorMessage(error, 'Erro ao adicionar método de pagamento. Tente novamente.')
      )
    },
  })
}

export function useSetPrimaryPaymentMethod() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => paymentMethodService.setPrimaryPaymentMethod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] })
      toast.success('Método de pagamento principal atualizado!')
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Erro ao definir método principal. Tente novamente.'))
    },
  })
}

export function useDeletePaymentMethod() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => paymentMethodService.deletePaymentMethod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] })
      toast.success('Método de pagamento removido com sucesso!')
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Erro ao remover método de pagamento. Tente novamente.'))
    },
  })
}

export function useHasPaymentMethods() {
  const { data } = usePaymentMethods()
  return {
    hasPaymentMethods: (data?.payment_methods?.length || 0) > 0,
    primaryPaymentMethod: data?.payment_methods?.find((pm) => pm.is_primary),
    paymentMethodsCount: data?.payment_methods?.length || 0,
  }
}
