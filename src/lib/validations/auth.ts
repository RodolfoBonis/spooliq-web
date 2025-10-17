import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(8, 'Senha deve ter no mínimo 8 caracteres'),
})

export const registerSchema = z.object({
  // User data
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(8, 'Senha deve ter no mínimo 8 caracteres'),

  // Company data
  company_name: z
    .string()
    .min(1, 'Nome da empresa é obrigatório'),
  company_trade_name: z.string().optional(),
  company_document: z
    .string()
    .min(1, 'CNPJ é obrigatório')
    .regex(/^\d{14}$/, 'CNPJ deve conter 14 dígitos'),
  company_phone: z
    .string()
    .min(1, 'Telefone é obrigatório'),

  // Address (ALL required)
  address: z
    .string()
    .min(1, 'Endereço é obrigatório'),
  address_number: z
    .string()
    .min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
  neighborhood: z
    .string()
    .min(1, 'Bairro é obrigatório'),
  city: z
    .string()
    .min(1, 'Cidade é obrigatória'),
  state: z
    .string()
    .length(2, 'Estado deve ter 2 caracteres (ex: SP)'),
  zip_code: z
    .string()
    .min(1, 'CEP é obrigatório')
    .regex(/^\d{8}$/, 'CEP deve conter 8 dígitos'),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>

