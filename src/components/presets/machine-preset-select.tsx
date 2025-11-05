'use client'

import { useState, useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useMachinePresets } from '@/lib/hooks/use-presets'
import { Skeleton } from '@/components/ui/skeleton'

interface MachinePresetSelectProps {
  value?: string
  onChange: (value: string | undefined) => void
  label?: string
  placeholder?: string
  disabled?: boolean
}

export function MachinePresetSelect({
  value,
  onChange,
  label = 'Preset de Máquina',
  placeholder = 'Selecione um preset',
  disabled = false,
}: MachinePresetSelectProps) {
  const { data: presets, isLoading } = useMachinePresets()
  const [localValue, setLocalValue] = useState<string | undefined>(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

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
      {label && <Label htmlFor="machine-preset">{label}</Label>}
      <Select
        value={localValue || 'none'}
        onValueChange={(val) => {
          const newValue = val === 'none' ? undefined : val
          setLocalValue(newValue)
          onChange(newValue)
        }}
        disabled={disabled}
      >
        <SelectTrigger id="machine-preset">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">
            <span className="text-neutral-500">Nenhum</span>
          </SelectItem>
          {presets?.map((preset) => (
            <SelectItem key={preset.id} value={preset.id}>
              {preset.brand && preset.model
                ? `${preset.brand} ${preset.model}`
                : preset.brand || preset.model || `Preset ${preset.id.slice(0, 8)}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {presets && presets.length === 0 && (
        <p className="text-xs text-neutral-500">
          Nenhum preset cadastrado. Crie um em Presets → Máquinas.
        </p>
      )}
    </div>
  )
}

