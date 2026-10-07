import { z } from 'zod'

/** Public approval form: the customer confirms their name. */
export const publicApproveSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Informe seu nome (mínimo 2 caracteres)')
    .max(120, 'Nome deve ter no máximo 120 caracteres'),
})

/** Public rejection form: name + an optional reason. */
export const publicRejectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Informe seu nome (mínimo 2 caracteres)')
    .max(120, 'Nome deve ter no máximo 120 caracteres'),
  reason: z
    .string()
    .trim()
    .max(1000, 'O motivo deve ter no máximo 1000 caracteres')
    .optional()
    .or(z.literal('')),
})

export type PublicApproveFormData = z.infer<typeof publicApproveSchema>
export type PublicRejectFormData = z.infer<typeof publicRejectSchema>
