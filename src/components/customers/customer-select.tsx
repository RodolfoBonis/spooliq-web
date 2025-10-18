'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useCustomers } from '@/lib/hooks/use-customers'
import type { Customer } from '@/types/models'

interface CustomerSelectProps {
  value?: string
  onValueChange: (value: string) => void
  onCreateNew?: () => void
}

export function CustomerSelect({
  value,
  onValueChange,
  onCreateNew,
}: CustomerSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useCustomers({ search, pageSize: 50 })
  const customers = data?.data || []

  const selectedCustomer = customers.find((c) => c.id === value)

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedCustomer ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs bg-primary-100 text-primary-700">
                  {getInitials(selectedCustomer.name)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{selectedCustomer.name}</span>
            </div>
          ) : (
            'Selecione um cliente...'
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput
            placeholder="Buscar cliente..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandEmpty>
            <div className="py-6 text-center">
              <p className="text-sm text-neutral-500 mb-3">
                Nenhum cliente encontrado
              </p>
              {onCreateNew && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setOpen(false)
                    onCreateNew()
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Criar novo cliente
                </Button>
              )}
            </div>
          </CommandEmpty>
          <CommandGroup>
            {onCreateNew && (
              <CommandItem
                onSelect={() => {
                  setOpen(false)
                  onCreateNew()
                }}
                className="border-b"
              >
                <Plus className="mr-2 h-4 w-4" />
                <span className="font-medium">Criar novo cliente</span>
              </CommandItem>
            )}
            {customers.map((customer) => (
              <CommandItem
                key={customer.id}
                onSelect={() => {
                  onValueChange(customer.id)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    value === customer.id ? 'opacity-100' : 'opacity-0'
                  )}
                />
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarFallback className="text-xs bg-primary-100 text-primary-700">
                    {getInitials(customer.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium">{customer.name}</span>
                  <span className="text-xs text-neutral-500">{customer.email}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
