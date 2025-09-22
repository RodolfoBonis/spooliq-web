'use client'

import { useState, useRef, useEffect, forwardRef } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ComboboxProps {
  label?: string
  error?: string
  placeholder?: string
  options: Array<{ value: string; label: string }>
  isLoading?: boolean
  value?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  name?: string
  required?: boolean
  className?: string
}

export const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(
  ({
    className,
    label,
    error,
    placeholder,
    options,
    isLoading,
    value = '',
    onChange,
    onBlur,
    name,
    required,
    ...props
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false)
    const [inputValue, setInputValue] = useState(value)
    const [highlightedIndex, setHighlightedIndex] = useState(-1)
    const containerRef = useRef<HTMLDivElement>(null)
    const listRef = useRef<HTMLUListElement>(null)

    // Filtrar opções baseado no texto digitado
    const filteredOptions = options.filter(option =>
      option.label.toLowerCase().includes(inputValue.toLowerCase())
    )

    // Atualizar input quando value externo muda
    useEffect(() => {
      if (value) {
        // Encontrar a opção pelo value e mostrar o label
        const option = options.find(opt => opt.value === value)
        setInputValue(option ? option.label : value)
      } else {
        setInputValue('')
      }
    }, [value, options])

    // Fechar dropdown quando clicar fora
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false)
          setHighlightedIndex(-1)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setInputValue(newValue)
      setIsOpen(true)
      setHighlightedIndex(-1)
      onChange?.(newValue)
    }

    const handleOptionSelect = (option: { value: string; label: string }) => {
      setInputValue(option.label)
      onChange?.(option.value)
      setIsOpen(false)
      setHighlightedIndex(-1)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        setIsOpen(true)
        return
      }

      if (!isOpen) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setHighlightedIndex(prev =>
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setHighlightedIndex(prev =>
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          )
          break
        case 'Enter':
          e.preventDefault()
          if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
            handleOptionSelect(filteredOptions[highlightedIndex])
          }
          break
        case 'Escape':
          setIsOpen(false)
          setHighlightedIndex(-1)
          break
      }
    }

    // Scroll para opção destacada
    useEffect(() => {
      if (highlightedIndex >= 0 && listRef.current) {
        const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement
        if (highlightedElement) {
          highlightedElement.scrollIntoView({
            block: 'nearest',
          })
        }
      }
    }, [highlightedIndex])

    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div ref={containerRef} className="relative">
          <div className="relative">
            <input
              ref={ref}
              type="text"
              name={name}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsOpen(true)}
              onBlur={onBlur}
              placeholder={placeholder}
              autoComplete="off"
              className={cn(
                'w-full px-3 py-2 pr-10 border border-slate-200 dark:border-slate-700 rounded-lg',
                'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100',
                'placeholder-slate-500 dark:placeholder-slate-400',
                'focus:ring-2 focus:ring-purple-500 focus:border-transparent',
                'transition-all duration-200',
                error && 'border-red-500 dark:border-red-400 focus:ring-red-500',
                isLoading && 'opacity-50',
                className
              )}
              disabled={isLoading}
              {...props}
            />

            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              tabIndex={-1}
            >
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-slate-400 transition-transform duration-200',
                  isOpen && 'rotate-180'
                )}
              />
            </button>
          </div>

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-auto">
              {isLoading ? (
                <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
                  Carregando opções...
                </div>
              ) : filteredOptions.length > 0 ? (
                <ul ref={listRef} className="py-1">
                  {filteredOptions.map((option, index) => (
                    <li key={option.value}>
                      <button
                        type="button"
                        onClick={() => handleOptionSelect(option)}
                        className={cn(
                          'w-full px-3 py-2 text-left text-sm transition-colors duration-150',
                          'hover:bg-slate-50 dark:hover:bg-slate-700',
                          'focus:bg-slate-50 dark:focus:bg-slate-700 focus:outline-none',
                          highlightedIndex === index && 'bg-slate-50 dark:bg-slate-700',
                          value === option.value && 'text-purple-600 dark:text-purple-400'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-slate-900 dark:text-slate-100">
                            {option.label}
                          </span>
                          {value === option.value && (
                            <Check className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
                  Nenhuma opção encontrada
                </div>
              )}
            </div>
          )}
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

Combobox.displayName = 'Combobox'