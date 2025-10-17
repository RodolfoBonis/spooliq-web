import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  filamentService,
  type FilamentFilters,
  type CreateFilamentDTO,
  type UpdateFilamentDTO,
} from '@/services/filament-service'

export function useFilaments(filters?: FilamentFilters) {
  return useQuery({
    queryKey: ['filaments', filters],
    queryFn: () => filamentService.list(filters),
  })
}

export function useFilament(id: string) {
  return useQuery({
    queryKey: ['filaments', id],
    queryFn: () => filamentService.getById(id),
    enabled: !!id,
  })
}

export function useCreateFilament() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: filamentService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['filaments'] })
      toast.success('Filamento criado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar filamento')
    },
  })
}

export function useUpdateFilament() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFilamentDTO }) =>
      filamentService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['filaments'] })
      queryClient.invalidateQueries({ queryKey: ['filaments', variables.id] })
      toast.success('Filamento atualizado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar filamento')
    },
  })
}

export function useDeleteFilament() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: filamentService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['filaments'] })
      toast.success('Filamento deletado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao deletar filamento')
    },
  })
}

