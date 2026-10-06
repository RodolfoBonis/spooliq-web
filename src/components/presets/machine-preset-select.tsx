'use client'

import { useMachinePresets } from '@/lib/hooks/use-presets'
import { PresetSelectBase, type PresetSelectProps } from './preset-select-base'
import type { MachinePreset } from '@/types/models'

export function machinePresetLabel(preset: MachinePreset): string {
  if (preset.name) return preset.name
  if (preset.brand && preset.model) return `${preset.brand} ${preset.model}`
  return preset.brand || preset.model || `Preset ${preset.id.slice(0, 8)}`
}

export function MachinePresetSelect({
  label = 'Preset de Máquina',
  ...props
}: PresetSelectProps) {
  const { data: presets, isLoading } = useMachinePresets()

  return (
    <PresetSelectBase
      {...props}
      label={label}
      isLoading={isLoading}
      options={presets?.map((preset) => ({
        id: preset.id,
        label: machinePresetLabel(preset),
        isDefault: preset.is_default,
      }))}
      emptyHint="Nenhum preset cadastrado. Crie um em Presets → Máquinas."
    />
  )
}
