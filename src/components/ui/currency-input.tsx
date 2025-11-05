'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { applyCurrencyMask, parseCurrencyToFloat, formatFloatToCurrencyInput } from '@/lib/utils/format'

export interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: number | string
  onChange?: (value: number) => void
  showCurrencySymbol?: boolean
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onChange, showCurrencySymbol = false, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState('')

    // Inicializa o valor do display quando o value prop muda
    React.useEffect(() => {
      if (value !== undefined && value !== null) {
        const numValue = typeof value === 'string' ? parseFloat(value) : value
        if (!isNaN(numValue) && numValue !== 0) {
          setDisplayValue(formatFloatToCurrencyInput(numValue))
        } else {
          setDisplayValue('')
        }
      } else {
        setDisplayValue('')
      }
    }, [value])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value
      
      // Remove R$ se estiver presente
      const cleanValue = rawValue.replace(/^R\$\s?/, '')
      
      // Aplica a máscara
      const maskedValue = applyCurrencyMask(cleanValue)
      
      setDisplayValue(maskedValue)
      
      // Converte para float e chama onChange
      if (onChange) {
        const floatValue = parseCurrencyToFloat(maskedValue)
        onChange(floatValue)
      }
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Formata o valor final quando perde o foco
      const floatValue = parseCurrencyToFloat(displayValue)
      if (floatValue > 0) {
        setDisplayValue(formatFloatToCurrencyInput(floatValue))
      }
      
      // Chama o onBlur original se existir
      if (props.onBlur) {
        props.onBlur(e)
      }
    }

    const finalDisplayValue = showCurrencySymbol && displayValue 
      ? `R$ ${displayValue}` 
      : displayValue

    return (
      <input
        type="text"
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        value={finalDisplayValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        placeholder={showCurrencySymbol ? 'R$ 0,00' : '0,00'}
        ref={ref}
        {...props}
      />
    )
  }
)

CurrencyInput.displayName = 'CurrencyInput'

export { CurrencyInput }