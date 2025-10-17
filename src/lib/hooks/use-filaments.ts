import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  filamentService,
  type FilamentFilters,
  type CreateFilamentDTO,
  type UpdateFilamentDTO,
} from '@/services/filament-service'

export function useFilaments(filters?: FilamentFilters) {
  return useQuery({
    queryKey: ['filaments', filters],
    queryFn: () => {
      // Use search endpoint if filters are provided, otherwise use list
      if (filters && (filters.search || filters.brand_id || filters.material_id)) {
        return filamentService.search(filters)
      }
      return filamentService.list(filters)
    },
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
    },
  })
}

export function useDeleteFilament() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: filamentService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['filaments'] })
    },
  })
}

