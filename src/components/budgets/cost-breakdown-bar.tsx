import * as React from 'react'
import { cn } from '@/lib/utils'

// Color variants for cost categories
const colorVariants = {
  blue: {
    bg: 'bg-blue-500',
    text: 'text-blue-700',
  },
  orange: {
    bg: 'bg-orange-500',
    text: 'text-orange-700',
  },
  purple: {
    bg: 'bg-purple-500',
    text: 'text-purple-700',
  },
  yellow: {
    bg: 'bg-yellow-500',
    text: 'text-yellow-700',
  },
  green: {
    bg: 'bg-green-500',
    text: 'text-green-700',
  },
  red: {
    bg: 'bg-red-500',
    text: 'text-red-700',
  },
} as const

type ColorVariant = keyof typeof colorVariants

interface CostBreakdownBarProps {
  label: string
  amount: number // in cents
  total: number // in cents
  color?: ColorVariant
  className?: string
}

/**
 * Component to display cost breakdown with visual progress bar
 * Shows label, amount, percentage, and visual bar
 */
export function CostBreakdownBar({
  label,
  amount,
  total,
  color = 'blue',
  className,
}: CostBreakdownBarProps) {
  // Calculate percentage
  const percentage = total > 0 ? (amount / total) * 100 : 0
  const percentageDisplay = percentage.toFixed(1)

  // Format currency (cents to R$)
  const formatCurrency = (cents: number) => {
    const reais = cents / 100
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(reais)
  }

  const colors = colorVariants[color]

  // Don't render if amount is 0
  if (amount === 0) return null

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-700">{label}</span>
        <div className="flex items-center gap-2">
          <span className={cn('text-xs font-medium', colors.text)}>
            {percentageDisplay}%
          </span>
          <span className="font-semibold text-neutral-900">
            {formatCurrency(amount)}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
        <div
          className={cn(
            'h-full transition-all duration-300 ease-in-out',
            colors.bg
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// Export default for convenience
export default CostBreakdownBar
