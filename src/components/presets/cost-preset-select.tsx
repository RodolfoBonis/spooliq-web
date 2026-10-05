'use client'

import { useCostPresets } from '@/lib/hooks/use-presets'
import { PresetSelectBase, type PresetSelectProps } from './preset-select-base'
import { formatCurrencyFromReais } from '@/lib/utils/format'
import type { CostPreset } from '@/types/models'

export function costPresetLabel(preset: CostPreset): string {
  const summary = `${formatCurrencyFromReais(preset.labor_cost_per_hour)}/h · margem ${preset.profit_margin_percentage}%`
  return preset.name ? `${preset.name} (${summary})` : summary
}

export function CostPresetSelect({ label = 'Preset de Custo', ...props }: PresetSelectProps) {
  const { data: presets, isLoading } = useCostPresets()

  return (
    <PresetSelectBase
      {...props}
      label={label}
      isLoading={isLoading}
      options={presets?.map((preset) => ({
        id: preset.id,
        label: costPresetLabel(preset),
        isDefault: preset.is_default,
      }))}
      emptyHint="Nenhum preset cadastrado. Crie um em Presets → Custos."
    />
  )
}
