import { Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function DefaultBadge() {
  return (
    <Badge
      variant="outline"
      className="border-amber-300 bg-amber-50 text-amber-800 gap-1"
      aria-label="Padrão"
    >
      <Star className="h-3 w-3 fill-current" aria-hidden="true" />
      Padrão
    </Badge>
  )
}
