'use client'

import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api/errors'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CustomerSelect } from '@/components/customers/customer-select'
import { useUpdateModel3D } from '@/lib/hooks/use-model3d'
import { updateModel3DSchema, type UpdateModel3DFormData } from '@/lib/validations/model3d'
import type { UpdateModel3DDTO } from '@/services/model3d-service'
import type { Model3D } from '@/types/models'

interface Model3DEditDialogProps {
  model: Model3D | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function Model3DEditDialog({ model, open, onOpenChange }: Model3DEditDialogProps) {
  const { mutate: update, isPending } = useUpdateModel3D()

  const form = useForm<UpdateModel3DFormData>({
    resolver: zodResolver(updateModel3DSchema),
  })

  const customerId = useWatch({ control: form.control, name: 'customer_id' })

  useEffect(() => {
    if (model) {
      form.reset({
        name: model.name,
        description: model.description || '',
        customer_id: model.customer_id || '',
        tags: model.tags || '',
        notes: model.notes || '',
      })
    }
  }, [model, form])

  const handleClose = () => {
    form.reset()
    onOpenChange(false)
  }

  const onSubmit = (values: UpdateModel3DFormData) => {
    if (!model) return
    // Send `customer_id: null` (not "") so the backend unlinks the customer.
    const data: UpdateModel3DDTO = {
      name: values.name,
      description: values.description,
      tags: values.tags,
      notes: values.notes,
      customer_id: values.customer_id ? values.customer_id : null,
    }
    update(
      { id: model.id, data },
      {
        onSuccess: () => {
          toast.success('Modelo atualizado com sucesso!')
          handleClose()
        },
        onError: (err) => {
          toast.error(getApiErrorMessage(err, 'Erro ao atualizar modelo'))
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Modelo 3D</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="edit-name">Nome *</Label>
            <Input id="edit-name" {...form.register('name')} />
            {form.formState.errors.name && (
              <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-description">Descrição</Label>
            <Textarea id="edit-description" {...form.register('description')} rows={2} />
          </div>

          {/* Customer link (optional) */}
          <div className="space-y-1">
            <Label>Cliente</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <CustomerSelect
                  value={customerId || undefined}
                  onValueChange={(value) =>
                    form.setValue('customer_id', value, { shouldDirty: true })
                  }
                />
              </div>
              {customerId && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remover vínculo com o cliente"
                  onClick={() => form.setValue('customer_id', '', { shouldDirty: true })}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-tags">Tags</Label>
            <Input id="edit-tags" {...form.register('tags')} placeholder="Ex: suporte, câmera" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-notes">Notas</Label>
            <Textarea id="edit-notes" {...form.register('notes')} rows={2} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
