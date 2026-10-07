import { z } from 'zod'

export const companySchema = z.object({
  name: z.string().min(1, 'Nome da empresa é obrigatório'),
  trade_name: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  instagram: z.string().optional(),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().length(2, 'Estado deve ter 2 caracteres').optional().or(z.literal('')),
  zip_code: z.string().optional(),
  default_tax_rate: z
    .number()
    .min(0, 'Alíquota deve ser 0 ou maior')
    .max(99.99, 'Alíquota deve ser no máximo 99,99%')
    .optional(),
})

export type CompanyFormData = z.infer<typeof companySchema>

