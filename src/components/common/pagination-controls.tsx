'use client'

import { Button } from '@/components/ui/button'

interface PaginationControlsProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  /** Hide entirely when there is a single page. Defaults to true. */
  hideWhenSingle?: boolean
  className?: string
}

/**
 * Shared "Anterior / Próxima" pager used by the server-paginated list pages
 * (budgets, customers, filaments, brands, materials, admin companies).
 */
export function PaginationControls({
  page,
  totalPages,
  onPageChange,
  hideWhenSingle = true,
  className,
}: PaginationControlsProps) {
  const safeTotalPages = Math.max(1, totalPages)

  if (hideWhenSingle && safeTotalPages <= 1) return null

  return (
    <div className={`flex items-center justify-center gap-2 ${className ?? ''}`}>
      <Button
        variant="outline"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page <= 1}
      >
        Anterior
      </Button>
      <span className="text-sm text-neutral-600">
        Página {page} de {safeTotalPages}
      </span>
      <Button
        variant="outline"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= safeTotalPages}
      >
        Próxima
      </Button>
    </div>
  )
}
