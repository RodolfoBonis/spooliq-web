'use client'

import { Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface PresetNameFieldProps {
  id?: string
  label?: string
  value: string
  onChange: (value: string) => void
  /** Name suggested by the API (shown as placeholder while the field is empty). */
  suggestion?: string
  isSuggesting?: boolean
  error?: string
  fallbackPlaceholder?: string
}

/**
 * Optional preset/profile name. While empty, the API suggestion is shown as the
 * placeholder (and is what the API will generate) with a "Usar sugestão" shortcut.
 */
export function PresetNameField({
  id = 'name',
  label = 'Nome',
  value,
  onChange,
  suggestion,
  isSuggesting = false,
  error,
  fallbackPlaceholder = 'Gerado automaticamente se vazio',
}: PresetNameFieldProps) {
  const isEmpty = value.trim() === ''
  const canUseSuggestion = isEmpty && !!suggestion
  const helpId = `${id}-help`

  return (
    <div>
      <Label htmlFor={id}>
        {label} <span className="font-normal text-neutral-500">(opcional)</span>
      </Label>
      <div className="mt-1 flex gap-2">
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={suggestion || fallbackPlaceholder}
          maxLength={100}
          aria-invalid={error ? true : undefined}
          aria-describedby={helpId}
        />
        {canUseSuggestion && (
          <Button
            type="button"
            variant="outline"
            onClick={() => onChange(suggestion)}
            className="shrink-0"
          >
            <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
            Usar sugestão
          </Button>
        )}
      </div>
      <p
        id={helpId}
        className={error ? 'text-sm text-red-600 mt-1' : 'text-xs text-neutral-500 mt-1'}
        aria-live="polite"
      >
        {error ??
          (isEmpty ? (
            isSuggesting && !suggestion ? (
              <span className="inline-flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                Gerando sugestão de nome...
              </span>
            ) : suggestion ? (
              `Se deixar em branco, o nome será "${suggestion}".`
            ) : (
              'Se deixar em branco, um nome será gerado automaticamente.'
            )
          ) : null)}
      </p>
    </div>
  )
}
