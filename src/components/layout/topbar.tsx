'use client'

import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuthStore } from '@/stores/auth-store'
import { useCompanyStore } from '@/stores/company-store'
import { getInitials } from '@/lib/utils/format'

export function Topbar() {
  const { user, logout } = useAuthStore()
  const { company } = useCompanyStore()

  return (
    <header className="flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-6">
      {/* Left side - Company info */}
      <div className="flex items-center space-x-4">
        {company && (
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">
              {company.trade_name || company.name}
            </h2>
            {company.subscription_status === 'trial' && company.trial_ends_at && (
              <p className="text-xs text-warning">
                Trial - {Math.ceil((new Date(company.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} dias restantes
              </p>
            )}
          </div>
        )}
      </div>

      {/* Right side - Notifications and User menu */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative" title="Notificações">
          <Bell className="h-5 w-5 text-neutral-600" />
          {/* <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary-500" /> */}
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar>
                <AvatarFallback className="bg-primary-100 text-primary-700">
                  {getInitials(user?.name || '')}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.name || 'Usuário'}</p>
                <p className="text-xs text-neutral-500">{user?.email}</p>
                {user?.roles && user.roles.length > 0 && (
                  <p className="text-xs text-neutral-400">{user.roles.join(', ')}</p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => window.location.href = '/settings/company'}>
              Configurações
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout}>
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

