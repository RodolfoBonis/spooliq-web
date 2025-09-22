import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  hover?: boolean
}

export const Card = ({
  variant = 'default',
  padding = 'md',
  hover = false,
  className,
  children,
  ...props
}: CardProps) => {
  const baseClasses = cn(
    'bg-white rounded-airbnb-lg border transition-all duration-200',
    'dark:bg-gray-800 dark:border-gray-700',
    {
      'hover:shadow-airbnb-lg hover:-translate-y-1 hover:border-brand-200 dark:hover:border-brand-600': hover,
      'cursor-pointer': hover,
    }
  )

  const variants = {
    default: cn(
      'border-gray-200 shadow-airbnb-md',
      'dark:shadow-gray-900/30'
    ),
    elevated: cn(
      'border-gray-100 shadow-airbnb-lg',
      'dark:border-gray-700 dark:shadow-gray-900/50'
    ),
    outlined: cn(
      'border-gray-300 shadow-none',
      'dark:border-gray-600'
    ),
  }

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  }

  return (
    <div
      className={cn(baseClasses, variants[variant], paddings[padding], className)}
      {...props}
    >
      {children}
    </div>
  )
}