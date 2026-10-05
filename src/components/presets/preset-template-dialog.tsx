'use client'

import { useState } from 'react'
import { AlertCircle, LayoutTemplate, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { usePresetTemplates, useCreatePresetFromTemplate } from '@/lib/hooks/use-presets'
import { getApiErrorMessage } from '@/lib/api/errors'
import type { PresetType } from '@/types/models'

interface PresetTemplateDialogProps {
  type: PresetType
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Lists the static preset templates for `type` and instantiates one via from-template. */
export function PresetTemplateDialog({ type, open, onOpenChange }: PresetTemplateDialogProps) {
  const { data: templates, isLoading, error, refetch } = usePresetTemplates(type, open)
  const { mutate: createFromTemplate, isPending } = useCreatePresetFromTemplate(type)
  const [pendingKey, setPendingKey] = useState<string | null>(null)

  const handleUse = (key: string) => {
    setPendingKey(key)
    createFromTemplate(
      { key },
      {
        onSuccess: () => onOpenChange(false),
        onSettled: () => setPendingKey(null),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar a partir de modelo</DialogTitle>
          <DialogDescription>
            Escolha um modelo com valores de referência. Você pode editar o preset depois.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3" aria-busy="true" aria-label="Carregando modelos">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between gap-2">
              {getApiErrorMessage(error, 'Não foi possível carregar os modelos.')}
              <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
                Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
        ) : !templates || templates.length === 0 ? (
          <p className="text-sm text-neutral-500 py-6 text-center">
            Nenhum modelo disponível para este tipo de preset.
          </p>
        ) : (
          <ul className="space-y-2">
            {templates.map((template) => (
              <li
                key={template.key}
                className="flex items-start justify-between gap-4 rounded-lg border p-3"
              >
                <div className="flex gap-3 min-w-0">
                  <LayoutTemplate className="h-5 w-5 mt-0.5 shrink-0 text-primary-600" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="font-medium text-neutral-900">{template.name}</p>
                    {template.description && (
                      <p className="text-sm text-neutral-600">{template.description}</p>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleUse(template.key)}
                  disabled={isPending}
                  aria-label={`Usar modelo ${template.name}`}
                  className="bg-primary-500 hover:bg-primary-600 shrink-0"
                >
                  {pendingKey === template.key ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                      Criando...
                    </>
                  ) : (
                    'Usar modelo'
                  )}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  )
}
