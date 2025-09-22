import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BrandService } from '@/services/brand.service'
import {
  FilamentBrand,
  CreateBrandRequest,
  UpdateBrandRequest,
  BrandFilters
} from '@/types/api'
import toast from 'react-hot-toast'

// Hook para buscar todas as marcas
export function useBrands(filters?: BrandFilters) {
  return useQuery({
    queryKey: ['brands', filters],
    queryFn: () => BrandService.getBrands(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

// Hook para buscar apenas marcas ativas (útil para dropdowns)
export function useActiveBrands() {
  return useQuery({
    queryKey: ['brands', 'active'],
    queryFn: () => BrandService.getActiveBrands(),
    staleTime: 10 * 60 * 1000, // 10 minutos
  })
}

// Hook para buscar uma marca específica
export function useBrand(id: number | null) {
  return useQuery({
    queryKey: ['brands', id],
    queryFn: () => BrandService.getBrand(id!),
    enabled: !!id,
  })
}

// Hook para buscar nomes de marcas (compatibilidade)
export function useBrandNames() {
  return useQuery({
    queryKey: ['brands', 'names'],
    queryFn: () => BrandService.getBrandNames(),
    staleTime: 10 * 60 * 1000,
  })
}

// Hook para criar marca
export function useCreateBrand() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBrandRequest) => BrandService.createBrand(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] })
      toast.success('Marca criada com sucesso!')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Erro ao criar marca'
      toast.error(message)
    },
  })
}

// Hook para atualizar marca
export function useUpdateBrand() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBrandRequest }) =>
      BrandService.updateBrand(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['brands'] })
      queryClient.invalidateQueries({ queryKey: ['brands', id] })
      toast.success('Marca atualizada com sucesso!')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Erro ao atualizar marca'
      toast.error(message)
    },
  })
}

// Hook para deletar marca
export function useDeleteBrand() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => BrandService.deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] })
      toast.success('Marca removida com sucesso!')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Erro ao remover marca'
      toast.error(message)
    },
  })
}

// Hook para obter opções de marca com ID e nome (para Combobox com IDs)
export function useBrandOptions() {
  return useQuery({
    queryKey: ['brand-options'],
    queryFn: async () => {
      const brands = await BrandService.getActiveBrands()
      return brands.map(brand => ({
        value: brand.id.toString(),
        label: brand.name,
        id: brand.id
      }))
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

// Hook personalizado com operações completas
export function useBrandOperations() {
  const createBrand = useCreateBrand()
  const updateBrand = useUpdateBrand()
  const deleteBrand = useDeleteBrand()

  return {
    createBrand,
    updateBrand,
    deleteBrand,
    isLoading: createBrand.isPending || updateBrand.isPending || deleteBrand.isPending,
  }
}