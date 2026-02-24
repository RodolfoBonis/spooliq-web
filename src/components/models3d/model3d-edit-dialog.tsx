'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
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
import { useUpdateModel3D } from '@/lib/hooks/use-model3d'
import { updateModel3DSchema, type UpdateModel3DFormData } from '@/lib/validations/model3d'
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

  useEffect(() => {
    if (model) {
      form.reset({
        name: model.name,
        description: model.description || '',
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
    update(
      { id: model.id, data: values },
      {
        onSuccess: () => {
          toast.success('Modelo atualizado com sucesso!')
          handleClose()
        },
        onError: () => {
          toast.error('Erro ao atualizar modelo')
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
