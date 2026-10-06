'use client'

import { useId } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'

const NONE_VALUE = '__none__'

export interface PresetSelectOption {
  id: string
  label: string
  isDefault?: boolean
}

/** Props shared by every preset/profile select. */
export interface PresetSelectProps {
  value?: string
  onChange: (value: string | undefined) => void
  id?: string
  label?: string
  placeholder?: string
  disabled?: boolean
  /** Label for the empty option; pass `null` to hide it (selection required). */
  noneLabel?: string | null
  /** Validation message shown below the select. */
  error?: string
  /** Extra help text shown below the select. */
  description?: string
}

interface PresetSelectBaseProps extends PresetSelectProps {
  options: PresetSelectOption[] | undefined
  isLoading: boolean
  emptyHint: string
}

export function PresetSelectBase({
  value,
  onChange,
  id,
  label,
  placeholder = 'Selecione um preset',
  disabled = false,
  noneLabel = 'Nenhum',
  error,
  description,
  options,
  isLoading,
  emptyHint,
}: PresetSelectBaseProps) {
  const generatedId = useId()
  const triggerId = id ?? generatedId
  const messageId = `${triggerId}-message`

  if (isLoading) {
    return (
      <div className="space-y-2">
        {label && <Label htmlFor={triggerId}>{label}</Label>}
        <Skeleton className="h-10 w-full" aria-label={`Carregando ${label ?? 'opções'}`} />
      </div>
    )
  }

  const selectValue = value ?? (noneLabel === null ? '' : NONE_VALUE)
  const hint = error ?? (options && options.length === 0 ? emptyHint : description)

  return (
    <div className="space-y-2">
      {label && <Label htmlFor={triggerId}>{label}</Label>}
      <Select
        value={selectValue}
        onValueChange={(val) => onChange(val === NONE_VALUE ? undefined : val)}
        disabled={disabled}
      >
        <SelectTrigger
          id={triggerId}
          aria-invalid={error ? true : undefined}
          aria-describedby={hint ? messageId : undefined}
          className={error ? 'border-red-500' : undefined}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {noneLabel !== null && (
            <SelectItem value={NONE_VALUE}>
              <span className="text-neutral-500">{noneLabel}</span>
            </SelectItem>
          )}
          {options?.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.label}
              {option.isDefault && <span className="text-neutral-500"> (padrão)</span>}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hint && (
        <p id={messageId} className={error ? 'text-sm text-red-600' : 'text-xs text-neutral-500'}>
          {hint}
        </p>
      )}
    </div>
  )
}
