import { forwardRef, useId } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helper?: string
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
  fullWidth?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helper,
  startIcon,
  endIcon,
  fullWidth,
  className,
  ...props
}, ref) => {
  const inputId = useId()

  return (
    <div className={cn('space-y-1', { 'w-full': fullWidth })}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {startIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="text-gray-400 dark:text-gray-500">
              {startIcon}
            </div>
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          className={cn(
            // Airbnb-style input
            'block w-full px-4 py-3 border border-gray-300 rounded-airbnb',
            'bg-white text-gray-900 placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
            'transition-all duration-200',
            // Dark mode
            'dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100',
            'dark:placeholder:text-gray-500 dark:focus:ring-brand-400',
            // Icon padding
            {
              'pl-10': startIcon,
              'pr-10': endIcon,
            },
            // Error state
            error && [
              'border-error-300 focus:ring-error-500 focus:border-error-500',
              'dark:border-error-400'
            ],
            className
          )}
          {...props}
        />

        {endIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="text-gray-400 dark:text-gray-500">
              {endIcon}
            </div>
          </div>
        )}
      </div>

      {(error || helper) && (
        <div className="mt-1">
          {error && (
            <p className="text-sm text-error-500 dark:text-error-400">
              {error}
            </p>
          )}
          {helper && !error && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {helper}
            </p>
          )}
        </div>
      )}
    </div>
  )
})

Input.displayName = 'Input'