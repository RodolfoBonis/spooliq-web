import { Badge } from '@/components/ui/badge'
import type { BudgetStatus } from '@/types/models'
import { 
  Pencil, 
  Send, 
  CheckCircle, 
  XCircle, 
  Printer, 
  CheckCheck,
  type LucideIcon 
} from 'lucide-react'

interface StatusConfig {
  label: string
  color: string
  bgColor: string
  icon: LucideIcon
}

const STATUS_CONFIG: Record<BudgetStatus, StatusConfig> = {
  draft: {
    label: 'Rascunho',
    color: '#9d9d9d',
    bgColor: 'bg-neutral-100 text-neutral-600',
    icon: Pencil,
  },
  sent: {
    label: 'Enviado',
    color: '#0288d1',
    bgColor: 'bg-blue-100 text-blue-700',
    icon: Send,
  },
  approved: {
    label: 'Aprovado',
    color: '#00a699',
    bgColor: 'bg-emerald-100 text-emerald-700',
    icon: CheckCircle,
  },
  rejected: {
    label: 'Rejeitado',
    color: '#d93025',
    bgColor: 'bg-red-100 text-red-700',
    icon: XCircle,
  },
  printing: {
    label: 'Imprimindo',
    color: '#f4a261',
    bgColor: 'bg-orange-100 text-orange-700',
    icon: Printer,
  },
  completed: {
    label: 'Concluído',
    color: '#5a6268',
    bgColor: 'bg-neutral-200 text-neutral-700',
    icon: CheckCheck,
  },
}

interface StatusBadgeProps {
  status: BudgetStatus
  showIcon?: boolean
  className?: string
}

export function StatusBadge({ status, showIcon = true, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  return (
    <Badge className={`${config.bgColor} ${className || ''}`}>
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      {config.label}
    </Badge>
  )
}

// Export the status config for use in other components
export { STATUS_CONFIG }

