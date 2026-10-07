import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  filamentService,
  type FilamentFilters,
  type UpdateFilamentDTO,
  type CreateStockMovementDTO,
  type StockMovementFilters,
} from '@/services/filament-service'
import { LOW_STOCK_QUERY_KEY } from '@/hooks/dashboard/use-low-stock'

export function useFilaments(filters?: FilamentFilters) {
  return useQuery({
    queryKey: ['filaments', filters],
    queryFn: () => {
      // Use the dedicated search endpoint only for free-text queries; the list endpoint
      // now accepts every structural filter (brand_id, material_id, color_type, diameter,
      // min_price, max_price, low_stock) and returns the server-side total/page count.
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
      // Stock settings (track_stock / threshold) can change the low-stock status.
      queryClient.invalidateQueries({ queryKey: LOW_STOCK_QUERY_KEY })
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

/** Paginated stock movements for a filament, newest first. */
export function useStockMovements(filamentId: string, filters?: StockMovementFilters) {
  return useQuery({
    queryKey: ['stock-movements', filamentId, filters],
    queryFn: () => filamentService.listStockMovements(filamentId, filters),
    enabled: !!filamentId,
  })
}

/**
 * Register a manual stock movement. Invalidates the filament queries, the movement
 * history and the dashboard low-stock card so every surface reflects the new balance.
 */
export function useCreateStockMovement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateStockMovementDTO }) =>
      filamentService.createStockMovement(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['filaments'] })
      queryClient.invalidateQueries({ queryKey: ['filaments', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['stock-movements', variables.id] })
      queryClient.invalidateQueries({ queryKey: LOW_STOCK_QUERY_KEY })
    },
  })
}
