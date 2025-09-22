import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PresetService } from '@/services/preset.service'
import {
  CreateEnergyPresetRequest,
  CreateMachinePresetRequest,
  CreateCostPresetRequest,
  CreateMarginPresetRequest
} from '@/types/api'
import toast from 'react-hot-toast'

// Query keys
export const presetKeys = {
  all: ['presets'] as const,
  energy: () => [...presetKeys.all, 'energy'] as const,
  energyByLocation: (location: string) => [...presetKeys.energy(), location] as const,
  energyLocations: () => [...presetKeys.energy(), 'locations'] as const,
  machines: () => [...presetKeys.all, 'machines'] as const,
  cost: () => [...presetKeys.all, 'cost'] as const,
  margin: () => [...presetKeys.all, 'margin'] as const,
}

// Energy Presets Hooks
export const useEnergyPresets = (location?: string) => {
  return useQuery({
    queryKey: location ? presetKeys.energyByLocation(location) : presetKeys.energy(),
    queryFn: () => PresetService.getEnergyPresets(location),
  })
}

export const useEnergyLocations = () => {
  return useQuery({
    queryKey: presetKeys.energyLocations(),
    queryFn: PresetService.getEnergyLocations,
  })
}

// Machine Presets Hooks
export const useMachinePresets = () => {
  return useQuery({
    queryKey: presetKeys.machines(),
    queryFn: PresetService.getMachinePresets,
  })
}

// Cost Presets Hooks
export const useCostPresets = () => {
  return useQuery({
    queryKey: presetKeys.cost(),
    queryFn: PresetService.getCostPresets,
  })
}

// Margin Presets Hooks
export const useMarginPresets = () => {
  return useQuery({
    queryKey: presetKeys.margin(),
    queryFn: PresetService.getMarginPresets,
  })
}

// Mutation Hooks
export const useCreateEnergyPreset = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateEnergyPresetRequest) =>
      PresetService.createPreset('energy', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: presetKeys.energy() })
      toast.success('Preset de energia criado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao criar preset de energia')
    },
  })
}

export const useCreateMachinePreset = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateMachinePresetRequest) =>
      PresetService.createPreset('machine', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: presetKeys.machines() })
      toast.success('Preset de máquina criado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao criar preset de máquina')
    },
  })
}

export const useCreateCostPreset = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCostPresetRequest) =>
      PresetService.createPreset('cost', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: presetKeys.cost() })
      toast.success('Preset de custo criado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao criar preset de custo')
    },
  })
}

export const useCreateMarginPreset = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateMarginPresetRequest) =>
      PresetService.createPreset('margin', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: presetKeys.margin() })
      toast.success('Preset de margem criado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao criar preset de margem')
    },
  })
}

export const useUpdatePreset = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ key, data }: { key: string; data: any }) =>
      PresetService.updatePreset(key, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: presetKeys.all })
      toast.success('Preset atualizado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao atualizar preset')
    },
  })
}

export const useDeletePreset = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: PresetService.deletePreset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: presetKeys.all })
      toast.success('Preset excluído com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao excluir preset')
    },
  })
}

// Helper hooks for common use cases
export const useDefaultEnergyPreset = (location: string) => {
  return useQuery({
    queryKey: [...presetKeys.energyByLocation(location), 'default'],
    queryFn: () => PresetService.getDefaultEnergyProfile(location),
    enabled: !!location,
  })
}

export const useMachineByName = (name: string) => {
  return useQuery({
    queryKey: [...presetKeys.machines(), name],
    queryFn: () => PresetService.getMachineByName(name),
    enabled: !!name,
  })
}