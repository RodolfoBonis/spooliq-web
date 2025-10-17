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
})

export type CompanyFormData = z.infer<typeof companySchema>

