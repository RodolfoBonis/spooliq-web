'use client'

import { useEffect, useState } from 'react'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useModel3D, useModels3D, useModels3DByCustomer } from '@/lib/hooks/use-model3d'
import { Model3DThumbnail } from './model3d-thumbnail'
import type { Model3D } from '@/types/models'

interface Model3DComboboxProps {
  value?: string
  onChange: (id: string | undefined) => void
  customerId?: string
  disabled?: boolean
}

const SEARCH_DEBOUNCE_MS = 300
const SEARCH_PAGE_SIZE = 20

export function Model3DCombobox({ value, onChange, customerId, disabled }: Model3DComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  const hasCustomer = !!customerId

  // Debounce the free-text query used for server-side search (no-customer mode).
  useEffect(() => {
    if (hasCustomer) return
    const timer = setTimeout(() => setDebouncedQuery(query), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [query, hasCustomer])

  // With a customer: load that customer's models (flat array, client-filtered by cmdk).
  const byCustomer = useModels3DByCustomer(customerId)
  // Without a customer: search server-side via `q`, capped at SEARCH_PAGE_SIZE.
  const serverSearch = useModels3D(
    hasCustomer
      ? undefined
      : { search: debouncedQuery || undefined, pageSize: SEARCH_PAGE_SIZE }
  )

  const models: Model3D[] = hasCustomer
    ? (byCustomer.data ?? [])
    : (serverSearch.data?.data ?? [])

  const isLoading = hasCustomer ? byCustomer.isLoading : serverSearch.isLoading

  // Resolve the selected model even when it is not part of the current result page.
  const selectedFromList = models.find((m) => m.id === value)
  const selectedQuery = useModel3D(value && !selectedFromList ? value : undefined)
  const selected = selectedFromList ?? selectedQuery.data

  return (
    <div className="flex items-center gap-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="flex-1 justify-between"
          >
            {selected ? (
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Model3DThumbnail model={selected} className="h-5 w-5 shrink-0 rounded" />
                <span className="truncate text-sm">{selected.name}</span>
              </div>
            ) : (
              <span className="text-neutral-500">Selecionar modelo 3D...</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          {/* In no-customer mode, filtering happens server-side, so disable cmdk's
              client-side filter to show exactly what the API returned. */}
          <Command shouldFilter={hasCustomer}>
            <CommandInput
              placeholder="Buscar modelo..."
              value={query}
              onValueChange={setQuery}
            />
            <CommandEmpty>
              {isLoading ? 'Carregando...' : 'Nenhum modelo encontrado.'}
            </CommandEmpty>
            <CommandGroup className="max-h-60 overflow-auto">
              {models.map((model) => (
                <CommandItem
                  key={model.id}
                  value={model.name}
                  onSelect={() => {
                    onChange(model.id === value ? undefined : model.id)
                    setOpen(false)
                  }}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Model3DThumbnail model={model} className="h-8 w-8 shrink-0 rounded" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">{model.name}</p>
                      <p className="text-xs text-neutral-500 uppercase">
                        {model.file_format.replace('.', '')}
                      </p>
                    </div>
                  </div>
                  <Check
                    className={cn('ml-2 h-4 w-4 shrink-0', value === model.id ? 'opacity-100' : 'opacity-0')}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      {/* Clear button */}
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={() => onChange(undefined)}
          disabled={disabled}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
