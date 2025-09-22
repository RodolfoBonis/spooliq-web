import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'brand' | 'success' | 'warning' | 'error' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  dot?: boolean
  className?: string
}

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className,
}: BadgeProps) => {
  const baseClasses = cn(
    'inline-flex items-center font-medium rounded-full',
    'transition-colors duration-200'
  )

  const variants = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    brand: 'bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-200',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    secondary: 'bg-gray-50 text-gray-600 border border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
  }

  const sizes = {
    sm: dot ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-xs',
    md: dot ? 'px-2 py-1 text-sm' : 'px-2.5 py-1.5 text-sm',
    lg: dot ? 'px-2.5 py-1.5 text-base' : 'px-3 py-2 text-base',
  }

  return (
    <span className={cn(baseClasses, variants[variant], sizes[size], className)}>
      {dot && (
        <div className="w-2 h-2 bg-current rounded-full mr-1.5" />
      )}
      {children}
    </span>
  )
}