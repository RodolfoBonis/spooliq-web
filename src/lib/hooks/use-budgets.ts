import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { budgetService } from '@/services/budget-service'
import type { BudgetFilters, CreateBudgetDTO, UpdateBudgetDTO, UpdateBudgetStatusDTO } from '@/services/budget-service'
import { toast } from 'sonner'

export function useBudgets(filters?: BudgetFilters) {
  return useQuery({
    queryKey: ['budgets', filters],
    queryFn: () => budgetService.list(filters),
  })
}

export function useBudget(id: string) {
  return useQuery({
    queryKey: ['budgets', id],
    queryFn: () => budgetService.getById(id),
    enabled: !!id,
  })
}

export function useCreateBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBudgetDTO) => budgetService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      toast.success('Orçamento criado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao criar orçamento')
    },
  })
}

export function useUpdateBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBudgetDTO }) =>
      budgetService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      queryClient.invalidateQueries({ queryKey: ['budgets', variables.id] })
      toast.success('Orçamento atualizado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao atualizar orçamento')
    },
  })
}

export function useUpdateBudgetStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBudgetStatusDTO }) =>
      budgetService.updateStatus(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      queryClient.invalidateQueries({ queryKey: ['budgets', variables.id] })
      toast.success('Status do orçamento atualizado!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao atualizar status')
    },
  })
}

export function useDeleteBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => budgetService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      toast.success('Orçamento deletado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao deletar orçamento')
    },
  })
}

export function useGeneratePDF() {
  return useMutation({
    mutationFn: ({ id, name, force = false }: { id: string; name: string; force?: boolean }) =>
      budgetService.generatePDF(id, force),
    onSuccess: async (response, variables) => {
      if (response && typeof response === 'object' && 'generated' in response) {
        // New API response with metadata - trigger download with authentication
        if (response.pdf_url) {
          try {
            // Fetch the PDF with authentication headers
            const pdfResponse = await fetch(response.pdf_url, {
              method: 'GET',
              headers: {
                'X-API-KEY': process.env.NEXT_PUBLIC_CDN_API_KEY || '',
              },
            })
            
            if (!pdfResponse.ok) {
              throw new Error('Failed to fetch PDF')
            }
            
            // Convert to blob and create download link
            const blob = await pdfResponse.blob()
            const url = URL.createObjectURL(blob)
            
            const link = document.createElement('a')
            link.href = url
            link.download = `orcamento-${variables.name.toLowerCase().replace(/\s+/g, '-')}.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            
            // Clean up the blob URL
            URL.revokeObjectURL(url)
          } catch (error) {
            console.error('Error downloading PDF:', error)
            toast.error('Erro ao baixar PDF')
            return
          }
        }
        
        if (response.generated) {
          toast.success('PDF gerado e baixado com sucesso!')
        } else {
          toast.success('PDF baixado com sucesso!')
        }
      } else {
        // Fallback message
        toast.success('PDF baixado com sucesso!')
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao gerar PDF')
    },
  })
}

