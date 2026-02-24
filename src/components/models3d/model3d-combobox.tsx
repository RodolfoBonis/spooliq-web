'use client'

import { useState } from 'react'
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
import { useModels3D, useModels3DByCustomer } from '@/lib/hooks/use-model3d'
import { Model3DThumbnail } from './model3d-thumbnail'
import type { Model3D } from '@/types/models'

interface Model3DComboboxProps {
  value?: string
  onChange: (id: string | undefined) => void
  customerId?: string
  disabled?: boolean
}

export function Model3DCombobox({ value, onChange, customerId, disabled }: Model3DComboboxProps) {
  const [open, setOpen] = useState(false)

  // Fetch models — by customer if customerId provided, otherwise all
  const byCustomer = useModels3DByCustomer(customerId)
  const allModels = useModels3D(undefined)

  const models: Model3D[] = customerId
    ? (byCustomer.data || [])
    : (allModels.data?.data || [])

  const isLoading = customerId ? byCustomer.isLoading : allModels.isLoading
  const selected = models.find((m) => m.id === value)

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
          <Command>
            <CommandInput placeholder="Buscar modelo..." />
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
