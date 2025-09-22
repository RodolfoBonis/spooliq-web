import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  placeholder?: string
  options?: Array<{ value: string; label: string }>
  isLoading?: boolean
  onValueChange?: (value: string) => void
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, placeholder, options, isLoading, onValueChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onValueChange) {
        onValueChange(e.target.value)
      }
      if (props.onChange) {
        props.onChange(e)
      }
    }
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            className={cn(
              'w-full px-3 py-2 pr-10 border border-slate-200 dark:border-slate-700 rounded-lg',
              'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100',
              'placeholder-slate-500 dark:placeholder-slate-400',
              'focus:ring-2 focus:ring-purple-500 focus:border-transparent',
              'transition-all duration-200',
              'appearance-none cursor-pointer',
              error && 'border-red-500 dark:border-red-400 focus:ring-red-500',
              isLoading && 'opacity-50 cursor-not-allowed',
              className
            )}
            disabled={isLoading}
            {...props}
            onChange={handleChange}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options ? options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            )) : props.children}
          </select>

          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        {isLoading && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Carregando opções...
          </p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'