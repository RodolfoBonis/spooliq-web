'use client'

import { useEnergyPresets } from '@/lib/hooks/use-presets'
import { PresetSelectBase, type PresetSelectProps } from './preset-select-base'
import type { EnergyPreset } from '@/types/models'

export function energyPresetLabel(preset: EnergyPreset): string {
  if (preset.name) return preset.name
  const parts = [preset.city, preset.state, preset.country].filter(Boolean)
  return parts.join(', ') || `Preset ${preset.id.slice(0, 8)}`
}

export function EnergyPresetSelect({
  label = 'Preset de Energia',
  ...props
}: PresetSelectProps) {
  const { data: presets, isLoading } = useEnergyPresets()

  return (
    <PresetSelectBase
      {...props}
      label={label}
      isLoading={isLoading}
      options={presets?.map((preset) => ({
        id: preset.id,
        label: energyPresetLabel(preset),
        isDefault: preset.is_default,
      }))}
      emptyHint="Nenhum preset cadastrado. Crie um em Presets → Energia."
    />
  )
}
