'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  Settings,
  ChevronDown,
  LogOut,
  Sliders,
  ShieldCheck,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import { useCompanyStore } from '@/stores/company-store'
import { ROLES } from '@/lib/constants/roles'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { CDNImage } from '@/components/ui/cdn-image'

interface NavItem {
  title: string
  href?: string
  icon: React.ComponentType<{ className?: string }>
  roles?: string[]
  children?: NavItem[]
}

const NAV_ITEMS: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Orçamentos',
    href: '/budgets',
    icon: FileText,
  },
  {
    title: 'Clientes',
    href: '/customers',
    icon: Users,
  },
  {
    title: 'Catálogo',
    icon: Package,
    children: [
      { title: 'Filamentos', href: '/catalog/filaments', icon: Package },
      { title: 'Materiais', href: '/catalog/materials', icon: Package },
      { title: 'Marcas', href: '/catalog/brands', icon: Package },
    ],
  },
  {
    title: 'Presets',
    icon: Sliders,
    children: [
      { title: 'Máquinas', href: '/presets/machines', icon: Sliders },
      { title: 'Energia', href: '/presets/energy', icon: Sliders },
      { title: 'Custos', href: '/presets/costs', icon: Sliders },
    ],
  },
  {
    title: 'Configurações',
    icon: Settings,
    roles: [ROLES.OWNER, ROLES.ORG_ADMIN],
    children: [
      { title: 'Empresa', href: '/settings/company', icon: Settings },
      { title: 'Branding PDF', href: '/settings/branding', icon: Settings },
      { title: 'Usuários', href: '/settings/users', icon: Settings },
      {
        title: 'Assinatura',
        href: '/settings/subscription',
        icon: Settings,
        roles: [ROLES.OWNER],
      },
    ],
  },
  {
    title: 'Admin Platform',
    href: '/admin/companies',
    icon: ShieldCheck,
    roles: [ROLES.PLATFORM_ADMIN],
  },
]

function NavItemComponent({ item }: { item: NavItem }) {
  const pathname = usePathname()
  const { hasRole } = useAuthStore()

  // Check role permissions
  if (item.roles && !hasRole(item.roles)) {
    return null
  }

  // If has children, render collapsible
  if (item.children) {
    return (
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between hover:bg-neutral-100"
          >
            <div className="flex items-center">
              <item.icon className="mr-3 h-5 w-5 text-neutral-600" />
              <span className="text-sm font-medium text-neutral-700">
                {item.title}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-neutral-500" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="ml-8 mt-1 space-y-1">
          {item.children.map((child) => {
            if (child.roles && !hasRole(child.roles)) {
              return null
            }
            return (
              <Link
                key={child.href}
                href={child.href!}
                className={cn(
                  'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-neutral-100',
                  pathname === child.href
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-600 hover:text-neutral-900'
                )}
              >
                {child.title}
              </Link>
            )
          })}
        </CollapsibleContent>
      </Collapsible>
    )
  }

  // Regular nav item
  return (
    <Link
      href={item.href!}
      className={cn(
        'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-neutral-100',
        pathname === item.href
          ? 'bg-primary-50 text-primary-700'
          : 'text-neutral-600 hover:text-neutral-900'
      )}
    >
      <item.icon className="mr-3 h-5 w-5" />
      {item.title}
    </Link>
  )
}

export function Sidebar() {
  const { user, logout } = useAuthStore()
  const { company } = useCompanyStore()

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-neutral-200 bg-white">
      {/* Logo and Company Info */}
      <div className="border-b border-neutral-200 px-6 py-2">
        <Link href="/dashboard" className="flex items-center space-x-3">
          {company?.logo_url ? (
            <CDNImage
              key={`logo-${company.logo_url}-${company.updated_at || Date.now()}`}
              src={company.logo_url}
              alt="Logo da empresa"
              width={32}
              height={32}
              className="h-12 w-12 object-contain"
              fallback={
                <span className="text-2xl font-bold text-primary-500">SpoolIQ</span>
              }
            />
          ) : (
            <span className="text-2xl font-bold text-primary-500">SpoolIQ</span>
          )}
          
          {company && (
            <div className="flex-1 min-w-0">
              <h2 className="text-md font-semibold text-neutral-900 truncate">
                {company.trade_name || company.name}
              </h2>
              {company.subscription_status === 'trial' && company.trial_ends_at && (
                <p className="text-xs text-orange-600">
                  Trial - {Math.ceil((new Date(company.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} dias restantes
                </p>
              )}
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => (
          <NavItemComponent key={item.title} item={item} />
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-neutral-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
              <span className="text-sm font-medium text-primary-700">
                {user?.name
                  ? user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)
                  : '??'}
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-neutral-900 truncate">
                {user?.name || 'Usuário'}
              </span>
              <span className="text-xs text-neutral-500 truncate">{user?.email}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="hover:bg-neutral-100 shrink-0"
            title="Sair"
          >
            <LogOut className="h-4 w-4 text-neutral-600" />
          </Button>
        </div>
      </div>
    </aside>
  )
}

