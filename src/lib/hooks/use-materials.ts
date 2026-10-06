import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  materialService,
  type MaterialFilters,
  type UpdateMaterialDTO,
} from '@/services/material-service'
import { getApiErrorMessage } from '@/lib/api/errors'

export function useMaterials(filters?: MaterialFilters) {
  return useQuery({
    queryKey: ['materials', filters],
    queryFn: () => materialService.list(filters),
  })
}

export function useMaterial(id: string) {
  return useQuery({
    queryKey: ['materials', id],
    queryFn: () => materialService.getById(id),
    enabled: !!id,
  })
}

export function useCreateMaterial() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: materialService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] })
      toast.success('Material criado com sucesso!')
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Erro ao criar material'))
    },
  })
}

export function useUpdateMaterial() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMaterialDTO }) =>
      materialService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['materials'] })
      queryClient.invalidateQueries({ queryKey: ['materials', variables.id] })
      toast.success('Material atualizado com sucesso!')
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Erro ao atualizar material'))
    },
  })
}

export function useDeleteMaterial() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: materialService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] })
      toast.success('Material deletado com sucesso!')
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Erro ao deletar material'))
    },
  })
}
