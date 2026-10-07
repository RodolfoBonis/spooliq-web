'use client'

import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { formatGrams } from '@/lib/utils/format'
import type { StockWarning } from '@/types/models'

interface StockWarningsAlertProps {
  warnings: StockWarning[] | undefined
  className?: string
}

/**
 * Informational amber alert listing filaments with insufficient stock for a budget.
 * Never blocks any action — it only warns. Renders nothing when there are no warnings.
 */
export function StockWarningsAlert({ warnings, className }: StockWarningsAlertProps) {
  if (!warnings || warnings.length === 0) return null

  return (
    <Alert className={`border-amber-300 bg-amber-50 text-amber-800 ${className ?? ''}`}>
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800">Estoque insuficiente</AlertTitle>
      <AlertDescription className="text-amber-700">
        <ul className="mt-1 space-y-1 text-sm">
          {warnings.map((warning) => (
            <li key={warning.filament_id}>
              <span className="font-medium">
                {warning.filament_name}
                {warning.color ? ` (${warning.color})` : ''}
              </span>
              : precisa de {formatGrams(warning.required_grams)}, tem{' '}
              {formatGrams(warning.available_grams)}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  )
}
