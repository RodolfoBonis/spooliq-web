import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  machinePresetService,
  energyPresetService,
  costPresetService,
} from '@/services/preset-service'
import type {
  CreateMachinePresetDTO,
  UpdateMachinePresetDTO,
  CreateEnergyPresetDTO,
  UpdateEnergyPresetDTO,
  CreateCostPresetDTO,
  UpdateCostPresetDTO,
} from '@/services/preset-service'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api/errors'

// Machine Presets
export function useMachinePresets() {
  return useQuery({
    queryKey: ['machine-presets'],
    queryFn: () => machinePresetService.list(),
  })
}

export function useMachinePreset(id: string) {
  return useQuery({
    queryKey: ['machine-presets', id],
    queryFn: () => machinePresetService.getById(id),
    enabled: !!id,
  })
}

export function useCreateMachinePreset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateMachinePresetDTO) => machinePresetService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['machine-presets'] })
      toast.success('Preset de máquina criado com sucesso!')
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Erro ao criar preset'))
    },
  })
}

export function useUpdateMachinePreset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMachinePresetDTO }) =>
      machinePresetService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['machine-presets'] })
      toast.success('Preset de máquina atualizado com sucesso!')
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Erro ao atualizar preset'))
    },
  })
}

export function useDeleteMachinePreset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => machinePresetService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['machine-presets'] })
      toast.success('Preset de máquina deletado com sucesso!')
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Erro ao deletar preset'))
    },
  })
}

// Energy Presets
export function useEnergyPresets() {
  return useQuery({
    queryKey: ['energy-presets'],
    queryFn: () => energyPresetService.list(),
  })
}

export function useEnergyPreset(id: string) {
  return useQuery({
    queryKey: ['energy-presets', id],
    queryFn: () => energyPresetService.getById(id),
    enabled: !!id,
  })
}

export function useCreateEnergyPreset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateEnergyPresetDTO) => energyPresetService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['energy-presets'] })
      toast.success('Preset de energia criado com sucesso!')
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Erro ao criar preset'))
    },
  })
}

export function useUpdateEnergyPreset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEnergyPresetDTO }) =>
      energyPresetService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['energy-presets'] })
      toast.success('Preset de energia atualizado com sucesso!')
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Erro ao atualizar preset'))
    },
  })
}

export function useDeleteEnergyPreset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => energyPresetService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['energy-presets'] })
      toast.success('Preset de energia deletado com sucesso!')
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Erro ao deletar preset'))
    },
  })
}

// Cost Presets
export function useCostPresets() {
  return useQuery({
    queryKey: ['cost-presets'],
    queryFn: () => costPresetService.list(),
  })
}

export function useCostPreset(id: string) {
  return useQuery({
    queryKey: ['cost-presets', id],
    queryFn: () => costPresetService.getById(id),
    enabled: !!id,
  })
}

export function useCreateCostPreset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCostPresetDTO) => costPresetService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-presets'] })
      toast.success('Preset de custo criado com sucesso!')
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Erro ao criar preset'))
    },
  })
}

export function useUpdateCostPreset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCostPresetDTO }) =>
      costPresetService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-presets'] })
      toast.success('Preset de custo atualizado com sucesso!')
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Erro ao atualizar preset'))
    },
  })
}

export function useDeleteCostPreset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => costPresetService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-presets'] })
      toast.success('Preset de custo deletado com sucesso!')
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Erro ao deletar preset'))
    },
  })
}

