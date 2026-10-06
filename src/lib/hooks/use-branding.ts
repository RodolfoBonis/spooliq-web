import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { brandingService, type CompanyBrandingColors } from '@/services/branding-service'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api/errors'

export function useBranding() {
  return useQuery({
    queryKey: ['branding'],
    queryFn: () => brandingService.get(),
  })
}

export function useBrandingTemplates() {
  return useQuery({
    queryKey: ['branding-templates'],
    queryFn: () => brandingService.listTemplates(),
    staleTime: Infinity, // Templates don't change
  })
}

export function useUpdateBranding() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (colors: CompanyBrandingColors) => brandingService.update(colors),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branding'] })
      toast.success('Cores do PDF atualizadas com sucesso!')
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Erro ao atualizar cores do PDF'))
    },
  })
}
