import { LucideIcon, Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-neutral-100 p-6 mb-4">
        <Icon className="h-12 w-12 text-neutral-400" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">{title}</h3>
      <p className="text-sm text-neutral-600 max-w-sm mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  )
}

