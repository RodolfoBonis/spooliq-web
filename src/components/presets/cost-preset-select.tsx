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
import { useCostPresets } from '@/lib/hooks/use-presets'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils/format'

interface CostPresetSelectProps {
  value?: string
  onChange: (value: string | undefined) => void
  label?: string
  placeholder?: string
  disabled?: boolean
}

export function CostPresetSelect({
  value,
  onChange,
  label = 'Preset de Custo',
  placeholder = 'Selecione um preset',
  disabled = false,
}: CostPresetSelectProps) {
  const { data: presets, isLoading } = useCostPresets()

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
      {label && <Label htmlFor="cost-preset">{label}</Label>}
      <Select
        value={value || 'none'}
        onValueChange={(val) => onChange(val === 'none' ? undefined : val)}
        disabled={disabled}
      >
        <SelectTrigger id="cost-preset">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">
            <span className="text-neutral-500">Nenhum</span>
          </SelectItem>
          {presets?.map((preset) => (
            <SelectItem key={preset.id} value={preset.id}>
              Mão de obra: {formatCurrency(preset.labor_cost_per_hour)}/h | Margem: {preset.profit_margin_percentage}%
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {presets && presets.length === 0 && (
        <p className="text-xs text-neutral-500">
          Nenhum preset cadastrado. Crie um em Presets → Custos.
        </p>
      )}
    </div>
  )
}

