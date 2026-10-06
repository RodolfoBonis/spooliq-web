'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
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
import { useFilaments } from '@/lib/hooks/use-filaments'
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value'
import { getColorPreviewStyle, formatCurrency } from '@/lib/utils/format'
import type { Filament } from '@/types/models'

interface FilamentSelectorProps {
  value?: string
  onValueChange: (filament: Filament | null) => void
  excludeIds?: string[]
}

export function FilamentSelector({
  value,
  onValueChange,
  excludeIds = [],
}: FilamentSelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  // Keeps the trigger label when the current search no longer contains the selection.
  const [lastSelected, setLastSelected] = useState<Filament | null>(null)
  const debouncedSearch = useDebouncedValue(search.trim(), 250)

  const { data, isLoading } = useFilaments({ search: debouncedSearch, pageSize: 100 })
  const filaments = (data?.data || []).filter((f) => !excludeIds.includes(f.id))
  const total = data?.total ?? filaments.length

  const selectedFilament =
    filaments.find((f) => f.id === value) ?? (lastSelected?.id === value ? lastSelected : undefined)

  return (
    // modal: inside a Dialog, a portalled non-modal Popover loses focus and can't scroll.
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedFilament ? (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div
                className="h-5 w-5 rounded-full border shrink-0"
                style={getColorPreviewStyle(
                  selectedFilament.color_type,
                  selectedFilament.color_data
                )}
              />
              <span className="truncate">
                {selectedFilament.brand_name} - {selectedFilament.name}
              </span>
            </div>
          ) : (
            'Selecione um filamento...'
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[500px] p-0">
        {/* Filtering happens on the server (debounced q), not in cmdk. */}
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar filamento..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandEmpty>
            <div className="py-6 text-center">
              <p className="text-sm text-neutral-500">
                {isLoading || search.trim() !== debouncedSearch
                  ? 'Buscando…'
                  : 'Nenhum filamento encontrado'}
              </p>
            </div>
          </CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-y-auto">
            {filaments.map((filament) => (
              <CommandItem
                key={filament.id}
                value={filament.id}
                onSelect={() => {
                  setLastSelected(filament)
                  onValueChange(filament)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    value === filament.id ? 'opacity-100' : 'opacity-0'
                  )}
                />
                <div
                  className="h-8 w-8 rounded-full border mr-3 shrink-0"
                  style={getColorPreviewStyle(filament.color_type, filament.color_data)}
                />
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium truncate">{filament.name}</span>
                    <span className="text-xs text-neutral-500">({filament.color})</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <span>{filament.brand_name}</span>
                    <span>•</span>
                    <span>{filament.material_name}</span>
                    <span>•</span>
                    <span>{filament.diameter}mm</span>
                    <span>•</span>
                    <span className="font-medium text-neutral-700">
                      {formatCurrency(filament.price_per_kg)}/kg
                    </span>
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
          {filaments.length > 0 && (
            <div className="border-t px-3 py-2 text-xs text-neutral-500" aria-live="polite">
              {total > filaments.length
                ? `Mostrando ${filaments.length} de ${total} filamentos — refine a busca`
                : `${filaments.length} ${filaments.length === 1 ? 'filamento' : 'filamentos'}`}
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  )
}

