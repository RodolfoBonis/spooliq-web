import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import {
  machinePresetService,
  energyPresetService,
  costPresetService,
  presetService,
} from '@/services/preset-service'
import type {
  CreateFromTemplateDTO,
  SuggestPresetNameDTO,
  CreateMachinePresetDTO,
  UpdateMachinePresetDTO,
  CreateEnergyPresetDTO,
  UpdateEnergyPresetDTO,
  CreateCostPresetDTO,
  UpdateCostPresetDTO,
} from '@/services/preset-service'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api/errors'
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value'
import type { PresetType } from '@/types/models'

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
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
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
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
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
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
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


// Actions shared by every preset type

const PRESET_QUERY_KEYS: Record<PresetType, string> = {
  machine: 'machine-presets',
  energy: 'energy-presets',
  cost: 'cost-presets',
}

const PRESET_TYPE_LABELS: Record<PresetType, string> = {
  machine: 'máquina',
  energy: 'energia',
  cost: 'custo',
}

function useInvalidatePresets() {
  const queryClient = useQueryClient()
  return (type: PresetType) => {
    queryClient.invalidateQueries({ queryKey: [PRESET_QUERY_KEYS[type]] })
    // Profiles embed preset names
    queryClient.invalidateQueries({ queryKey: ['profiles'] })
  }
}

/**
 * Debounced name suggestion for a preset being created/edited.
 * Pass `enabled=false` when the user already typed a name.
 */
export function useSuggestPresetName(input: SuggestPresetNameDTO, enabled: boolean) {
  const debounced = useDebouncedValue(input, 400)
  return useQuery({
    queryKey: ['preset-name-suggestion', debounced],
    queryFn: () => presetService.suggestName(debounced),
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: false,
    placeholderData: keepPreviousData,
  })
}

export function usePresetTemplates(type: PresetType, enabled = true) {
  return useQuery({
    queryKey: ['preset-templates', type],
    queryFn: () => presetService.listTemplates(type),
    enabled,
    staleTime: 30 * 60 * 1000, // static catalog
  })
}

export function useCreatePresetFromTemplate(type: PresetType) {
  const invalidate = useInvalidatePresets()
  return useMutation({
    mutationFn: ({ key, overrides }: { key: string; overrides?: CreateFromTemplateDTO }) =>
      presetService.createFromTemplate(key, overrides),
    onSuccess: (preset) => {
      invalidate(type)
      toast.success(`Preset "${preset.name}" criado a partir do modelo!`)
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Erro ao criar preset a partir do modelo'))
    },
  })
}

export function useSetDefaultPreset(type: PresetType) {
  const invalidate = useInvalidatePresets()
  return useMutation({
    mutationFn: (id: string) => presetService.setDefault(id),
    onSuccess: () => {
      invalidate(type)
      toast.success(`Preset de ${PRESET_TYPE_LABELS[type]} definido como padrão!`)
    },
    onError: (error: unknown) => {
      toast.error(
        getApiErrorMessage(error, 'Erro ao definir preset padrão', {
          403: 'Apenas proprietários e administradores podem definir o preset padrão.',
        })
      )
    },
  })
}

export function useDuplicatePreset(type: PresetType) {
  const invalidate = useInvalidatePresets()
  return useMutation({
    mutationFn: (id: string) => presetService.duplicate(id),
    onSuccess: (preset) => {
      invalidate(type)
      toast.success(`Preset duplicado como "${preset.name}"`)
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Erro ao duplicar preset'))
    },
  })
}
