'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'

import { cn } from '@/lib/utils'
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

import { useCustomers } from '@/lib/hooks/use-customers'
import { getInitials } from '@/lib/utils/format'

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
  const { data } = useCustomers({ search })

  const customers = data?.data || []
  const selectedCustomer = customers.find((c) => c.id === value)

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
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-primary-100 text-primary-700 text-xs">
                  {getInitials(selectedCustomer.name)}
                </AvatarFallback>
              </Avatar>
              <span>{selectedCustomer.name}</span>
            </div>
          ) : (
            <span className="text-neutral-500">Selecionar cliente...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Buscar cliente..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandEmpty>
            <div className="py-6 text-center text-sm">
              <p className="text-neutral-600 mb-4">Nenhum cliente encontrado</p>
              {onCreateNew && (
                <Button
                  size="sm"
                  onClick={() => {
                    setOpen(false)
                    onCreateNew()
                  }}
                  className="bg-primary-500 hover:bg-primary-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Novo Cliente
                </Button>
              )}
            </div>
          </CommandEmpty>
          <CommandGroup>
            {customers.map((customer) => (
              <CommandItem
                key={customer.id}
                value={customer.id}
                onSelect={(currentValue) => {
                  onValueChange(currentValue === value ? '' : currentValue)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    value === customer.id ? 'opacity-100' : 'opacity-0'
                  )}
                />
                <div className="flex items-center space-x-2 flex-1">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary-100 text-primary-700 text-xs">
                      {getInitials(customer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{customer.name}</p>
                    <p className="text-xs text-neutral-500 truncate">{customer.email}</p>
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
          {onCreateNew && customers.length > 0 && (
            <>
              <div className="border-t border-neutral-200 p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-primary-600"
                  onClick={() => {
                    setOpen(false)
                    onCreateNew()
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Novo Cliente
                </Button>
              </div>
            </>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  )
}

