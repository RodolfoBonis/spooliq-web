'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Upload, X, File } from 'lucide-react'
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
import { useUploadModel3D } from '@/lib/hooks/use-model3d'
import { uploadModel3DSchema, validateModel3DFile, type UploadModel3DFormData } from '@/lib/validations/model3d'
import { UploadConflictError } from '@/services/model3d-service'

interface Model3DUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerId?: string
}

export function Model3DUploadDialog({ open, onOpenChange, customerId }: Model3DUploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const { mutate: upload, isPending } = useUploadModel3D()

  const form = useForm<UploadModel3DFormData>({
    resolver: zodResolver(uploadModel3DSchema),
    defaultValues: {
      name: '',
      description: '',
      customer_id: customerId || '',
      tags: '',
      notes: '',
    },
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return
    const error = validateModel3DFile(file)
    if (error) {
      setFileError(error)
      return
    }
    setFileError(null)
    setSelectedFile(file)
    // Auto-fill name from filename if empty
    const currentName = form.getValues('name')
    if (!currentName) {
      const nameWithoutExt = file.name.replace(/\.(stl|3mf)$/i, '')
      form.setValue('name', nameWithoutExt)
    }
  }, [form])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/octet-stream': ['.stl', '.3mf'] },
    maxFiles: 1,
    multiple: false,
  })

  const handleClose = () => {
    form.reset()
    setSelectedFile(null)
    setFileError(null)
    onOpenChange(false)
  }

  const onSubmit = (values: UploadModel3DFormData) => {
    if (!selectedFile) {
      setFileError('Selecione um arquivo')
      return
    }
    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('name', values.name)
    if (values.description) formData.append('description', values.description)
    if (values.customer_id) formData.append('customer_id', values.customer_id)
    if (values.tags) formData.append('tags', values.tags)
    if (values.notes) formData.append('notes', values.notes)

    upload(formData, {
      onSuccess: () => {
        toast.success('Modelo 3D enviado com sucesso!')
        handleClose()
      },
      onError: (err) => {
        if (err instanceof UploadConflictError) {
          toast.warning(`Arquivo já existe: "${err.existing.name}"`)
          handleClose()
          return
        }
        toast.error('Erro ao enviar modelo 3D')
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo Modelo 3D</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Dropzone */}
          <div>
            <div
              {...getRootProps()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-neutral-300 hover:border-neutral-400'
              }`}
            >
              <input {...getInputProps()} />
              {selectedFile ? (
                <div className="flex items-center gap-2 text-sm">
                  <File className="h-5 w-5 text-neutral-500" />
                  <span className="font-medium">{selectedFile.name}</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null) }}
                    className="ml-1 text-neutral-400 hover:text-neutral-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="mb-2 h-8 w-8 text-neutral-400" />
                  <p className="text-sm text-neutral-600">
                    {isDragActive ? 'Solte aqui...' : 'Arraste ou clique para selecionar'}
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">.STL ou .3MF — máximo 50MB</p>
                </>
              )}
            </div>
            {fileError && <p className="mt-1 text-xs text-red-500">{fileError}</p>}
          </div>

          {/* Name */}
          <div className="space-y-1">
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" {...form.register('name')} placeholder="Ex: Suporte para câmera" />
            {form.formState.errors.name && (
              <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              {...form.register('description')}
              placeholder="Descrição opcional do modelo"
              rows={2}
            />
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              {...form.register('tags')}
              placeholder="Ex: suporte, câmera, impressora"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Enviando...' : 'Enviar Modelo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
