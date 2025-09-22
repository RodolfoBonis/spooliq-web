import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'minimal'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  isLoading?: boolean
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  isLoading,
  fullWidth,
  children,
  className,
  disabled,
  ...props
}, ref) => {
  const baseClasses = cn(
    // Base styles inspired by Airbnb
    'inline-flex items-center justify-center font-medium transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'dark:focus:ring-offset-gray-800',
    {
      'w-full': fullWidth,
    }
  )

  const variants = {
    primary: cn(
      'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-airbnb',
      'hover:from-brand-600 hover:to-brand-700 hover:shadow-airbnb-md',
      'active:from-brand-700 active:to-brand-800 active:shadow-airbnb',
      'dark:shadow-gray-900/20'
    ),
    secondary: cn(
      'bg-white text-gray-700 border border-gray-300 shadow-airbnb',
      'hover:bg-gray-50 hover:border-gray-400 hover:shadow-airbnb-md',
      'active:bg-gray-100',
      'dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600',
      'dark:hover:bg-gray-700 dark:hover:border-gray-500'
    ),
    outline: cn(
      'border-2 border-brand-500 text-brand-600 bg-transparent',
      'hover:bg-brand-50 hover:border-brand-600',
      'active:bg-brand-100',
      'dark:text-brand-400 dark:border-brand-400',
      'dark:hover:bg-brand-900/20 dark:hover:border-brand-300'
    ),
    ghost: cn(
      'text-gray-700 bg-transparent',
      'hover:bg-gray-100 hover:text-gray-900',
      'active:bg-gray-200',
      'dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'
    ),
    danger: cn(
      'bg-error-500 text-white shadow-airbnb',
      'hover:bg-error-600 hover:shadow-airbnb-md',
      'active:bg-error-700',
      'focus:ring-error-500'
    ),
    minimal: cn(
      'text-brand-600 bg-transparent p-0 shadow-none',
      'hover:text-brand-700 hover:underline',
      'dark:text-brand-400 dark:hover:text-brand-300'
    ),
  }

  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs rounded-lg',
    sm: 'px-3 py-2 text-sm rounded-airbnb',
    md: 'px-4 py-2.5 text-sm rounded-airbnb',
    lg: 'px-6 py-3 text-base rounded-airbnb-lg',
    xl: 'px-8 py-4 text-lg rounded-airbnb-lg',
  }

  return (
    <button
      ref={ref}
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      )}
      {children}
    </button>
  )
})

Button.displayName = 'Button'