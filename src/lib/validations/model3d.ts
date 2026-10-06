import { z } from 'zod'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const ALLOWED_FORMATS = ['.stl', '.3mf']

export const uploadModel3DSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(255, 'Nome deve ter no máximo 255 caracteres'),
  description: z
    .string()
    .max(2000, 'Descrição deve ter no máximo 2000 caracteres')
    .optional(),
  customer_id: z
    .string()
    .uuid('ID de cliente inválido')
    .optional()
    .or(z.literal('')),
  tags: z
    .string()
    .max(1000, 'Tags devem ter no máximo 1000 caracteres')
    .optional(),
  notes: z
    .string()
    .max(2000, 'Notas devem ter no máximo 2000 caracteres')
    .optional(),
})

export const updateModel3DSchema = uploadModel3DSchema.partial()

export type UploadModel3DFormData = z.infer<typeof uploadModel3DSchema>
export type UpdateModel3DFormData = z.infer<typeof updateModel3DSchema>

export function validateModel3DFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) {
    return 'Arquivo deve ter no máximo 50MB'
  }
  const ext = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!ALLOWED_FORMATS.includes(ext)) {
    return 'Formato inválido. Apenas .stl e .3mf são suportados'
  }
  return null
}
