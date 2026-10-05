'use client'

import { Copy, Edit, Star, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PresetRowActionsProps {
  /** Item label used in accessible names, e.g. the preset name. */
  itemLabel: string
  isDefault: boolean
  canManageDefaults: boolean
  onEdit: () => void
  onDuplicate: () => void
  onSetDefault: () => void
  onDelete: () => void
  isBusy?: boolean
  /** Noun used in tooltips: "preset" or "perfil". */
  noun?: string
}

/** Row actions shared by preset and profile tables. */
export function PresetRowActions({
  itemLabel,
  isDefault,
  canManageDefaults,
  onEdit,
  onDuplicate,
  onSetDefault,
  onDelete,
  isBusy = false,
  noun = 'preset',
}: PresetRowActionsProps) {
  const deleteLabel = isDefault
    ? `O ${noun} padrão não pode ser excluído`
    : `Excluir ${noun} ${itemLabel}`

  return (
    <div className="flex items-center justify-end gap-1">
      {canManageDefaults && !isDefault && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onSetDefault}
          disabled={isBusy}
          title="Definir como padrão"
          aria-label={`Definir ${itemLabel} como padrão`}
        >
          <Star className="h-4 w-4 text-amber-600" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={onDuplicate}
        disabled={isBusy}
        title="Duplicar"
        aria-label={`Duplicar ${itemLabel}`}
      >
        <Copy className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onEdit}
        title="Editar"
        aria-label={`Editar ${itemLabel}`}
      >
        <Edit className="h-4 w-4" />
      </Button>
      {canManageDefaults && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          disabled={isDefault || isBusy}
          title={deleteLabel}
          aria-label={deleteLabel}
        >
          <Trash2 className="h-4 w-4 text-red-600" />
        </Button>
      )}
    </div>
  )
}
