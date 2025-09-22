'use client'

import { Menu } from '@headlessui/react'
import { Fragment } from 'react'
import { Transition } from '@headlessui/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  Menu as MenuIcon,
  Bell,
  ChevronDown,
  Search,
  Settings,
  User,
  LogOut,
  Activity
} from 'lucide-react'

import { Avatar } from '@/components/ui'
import { useAuthStore } from '@/stores/auth-store'
import { AuthService } from '@/services/auth.service'
import { cn } from '@/lib/utils'
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter()
  const { user, clearAuth } = useAuthStore()

  const handleLogout = async () => {
    try {
      await AuthService.logout()
    } catch {
      // Ignorar erro do logout, limpar local mesmo assim
    } finally {
      clearAuth()
      toast.success('Logout realizado com sucesso!')
      router.push('/login')
    }
  }

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-6 border-b border-slate-200 bg-white/80 backdrop-blur-xl px-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 sm:px-6 lg:px-8">
      {/* Mobile menu button */}
      <button
        type="button"
        className="-m-2.5 p-2.5 text-slate-600 hover:text-slate-900 lg:hidden dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
        onClick={onMenuClick}
      >
        <MenuIcon className="h-6 w-6" />
      </button>

      {/* Search Bar - Desktop */}
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="hidden lg:flex lg:max-w-md lg:flex-1 items-center">
          <div className="relative w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar em todo sistema..."
              className="block w-full rounded-lg border-0 bg-slate-50 py-2 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-500 focus:bg-white focus:ring-2 focus:ring-red-500 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400 dark:focus:bg-slate-700 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-x-3 lg:gap-x-4 ml-auto">
          {/* Quick Actions */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              type="button"
              className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              <Activity className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full"></span>
            </button>

            <button
              type="button"
              className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-medium">2</span>
              </span>
            </button>
          </div>

          {/* Theme switcher */}
          <ThemeSwitcher />

          {/* Separator */}
          <div className="hidden lg:block lg:h-5 lg:w-px lg:bg-slate-200 dark:lg:bg-slate-700" />

          {/* Profile dropdown */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center gap-3 p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <Avatar
                name={user?.name || 'Usuário'}
                size="sm"
              />
              <span className="hidden lg:flex lg:items-center gap-2">
                <div className="text-left">
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {user?.name || 'Usuário'}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {user?.role === 'admin' ? 'Administrador' : 'Usuário'}
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </span>
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-xl bg-white py-2 shadow-lg ring-1 ring-slate-900/5 focus:outline-none dark:bg-slate-800 dark:ring-slate-700 border border-slate-200 dark:border-slate-700">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {user?.name || 'Usuário'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {user?.email || 'email@exemplo.com'}
                  </p>
                </div>

                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={cn(
                          'flex w-full items-center gap-3 px-4 py-2 text-sm',
                          active
                            ? 'bg-slate-50 text-slate-900 dark:bg-slate-700 dark:text-slate-100'
                            : 'text-slate-700 dark:text-slate-300'
                        )}
                      >
                        <User className="h-4 w-4" />
                        Meu Perfil
                      </button>
                    )}
                  </Menu.Item>

                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={cn(
                          'flex w-full items-center gap-3 px-4 py-2 text-sm',
                          active
                            ? 'bg-slate-50 text-slate-900 dark:bg-slate-700 dark:text-slate-100'
                            : 'text-slate-700 dark:text-slate-300'
                        )}
                      >
                        <Settings className="h-4 w-4" />
                        Configurações
                      </button>
                    )}
                  </Menu.Item>
                </div>

                <div className="py-1 border-t border-slate-100 dark:border-slate-700">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className={cn(
                          'flex w-full items-center gap-3 px-4 py-2 text-sm',
                          active
                            ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                            : 'text-red-600 dark:text-red-400'
                        )}
                      >
                        <LogOut className="h-4 w-4" />
                        Sair
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </div>
  )
}