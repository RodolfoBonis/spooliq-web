import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MaterialService } from '@/services/material.service'
import {
  FilamentMaterial,
  CreateMaterialRequest,
  UpdateMaterialRequest,
  MaterialFilters
} from '@/types/api'
import toast from 'react-hot-toast'

// Hook para buscar todos os materiais
export function useMaterials(filters?: MaterialFilters) {
  return useQuery({
    queryKey: ['materials', filters],
    queryFn: () => MaterialService.getMaterials(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

// Hook para buscar apenas materiais ativos (útil para dropdowns)
export function useActiveMaterials() {
  return useQuery({
    queryKey: ['materials', 'active'],
    queryFn: () => MaterialService.getActiveMaterials(),
    staleTime: 10 * 60 * 1000, // 10 minutos
  })
}

// Hook para buscar um material específico
export function useMaterial(id: number | null) {
  return useQuery({
    queryKey: ['materials', id],
    queryFn: () => MaterialService.getMaterial(id!),
    enabled: !!id,
  })
}

// Hook para buscar nomes de materiais (compatibilidade)
export function useMaterialNames() {
  return useQuery({
    queryKey: ['materials', 'names'],
    queryFn: () => MaterialService.getMaterialNames(),
    staleTime: 10 * 60 * 1000,
  })
}

// Hook para criar material
export function useCreateMaterial() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateMaterialRequest) => MaterialService.createMaterial(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] })
      toast.success('Material criado com sucesso!')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Erro ao criar material'
      toast.error(message)
    },
  })
}

// Hook para atualizar material
export function useUpdateMaterial() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateMaterialRequest }) =>
      MaterialService.updateMaterial(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['materials'] })
      queryClient.invalidateQueries({ queryKey: ['materials', id] })
      toast.success('Material atualizado com sucesso!')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Erro ao atualizar material'
      toast.error(message)
    },
  })
}

// Hook para deletar material
export function useDeleteMaterial() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => MaterialService.deleteMaterial(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] })
      toast.success('Material removido com sucesso!')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Erro ao remover material'
      toast.error(message)
    },
  })
}

// Hook para obter opções de material com ID e nome (para Combobox com IDs)
export function useMaterialOptions() {
  return useQuery({
    queryKey: ['material-options'],
    queryFn: async () => {
      const materials = await MaterialService.getActiveMaterials()
      return materials.map(material => ({
        value: material.id.toString(),
        label: material.name,
        id: material.id
      }))
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

// Hook personalizado com operações completas
export function useMaterialOperations() {
  const createMaterial = useCreateMaterial()
  const updateMaterial = useUpdateMaterial()
  const deleteMaterial = useDeleteMaterial()

  return {
    createMaterial,
    updateMaterial,
    deleteMaterial,
    isLoading: createMaterial.isPending || updateMaterial.isPending || deleteMaterial.isPending,
  }
}