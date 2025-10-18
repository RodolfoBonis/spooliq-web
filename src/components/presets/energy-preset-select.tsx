'use client'

import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useEnergyPresets } from '@/lib/hooks/use-presets'
import { Skeleton } from '@/components/ui/skeleton'

interface EnergyPresetSelectProps {
  value?: string
  onChange: (value: string | undefined) => void
  label?: string
  placeholder?: string
  disabled?: boolean
}

export function EnergyPresetSelect({
  value,
  onChange,
  label = 'Preset de Energia',
  placeholder = 'Selecione um preset',
  disabled = false,
}: EnergyPresetSelectProps) {
  const { data: presets, isLoading } = useEnergyPresets()

  const getLocation = (preset: typeof presets[0]) => {
    if (!preset) return ''
    const parts = [preset.city, preset.state, preset.country].filter(Boolean)
    return parts.join(', ') || `Preset ${preset.id.slice(0, 8)}`
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {label && <Label>{label}</Label>}
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {label && <Label htmlFor="energy-preset">{label}</Label>}
      <Select
        value={value || 'none'}
        onValueChange={(val) => onChange(val === 'none' ? undefined : val)}
        disabled={disabled}
      >
        <SelectTrigger id="energy-preset">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">
            <span className="text-neutral-500">Nenhum</span>
          </SelectItem>
          {presets?.map((preset) => (
            <SelectItem key={preset.id} value={preset.id}>
              {getLocation(preset)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {presets && presets.length === 0 && (
        <p className="text-xs text-neutral-500">
          Nenhum preset cadastrado. Crie um em Presets → Energia.
        </p>
      )}
    </div>
  )
}

