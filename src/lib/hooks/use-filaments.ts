import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  filamentService,
  type FilamentFilters,
  type UpdateFilamentDTO,
} from '@/services/filament-service'

export function useFilaments(filters?: FilamentFilters) {
  return useQuery({
    queryKey: ['filaments', filters],
    queryFn: () => {
      // Use the dedicated search endpoint only for free-text queries; the list endpoint
      // now accepts every structural filter (brand_id, material_id, color_type, diameter,
      // min_price, max_price) and returns the server-side total/page count.
      if (filters?.search) {
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
