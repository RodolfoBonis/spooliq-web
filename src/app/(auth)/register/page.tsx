'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

import { Button, Input, Card } from '@/components/ui'
import { AuthService } from '@/services/auth.service'
import { useAuthStore } from '@/stores/auth-store'

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  password_confirmation: z.string(),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Senhas não coincidem',
  path: ['password_confirmation'],
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)

  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true)
      const response = await AuthService.register(data)

      setAuth(response.user, {
        access_token: response.access_token,
        refresh_token: response.refresh_token,
      })

      toast.success('Conta criada com sucesso!')
      router.push('/dashboard')
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Erro ao criar conta'
      toast.error(errorMessage || 'Erro ao criar conta')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card variant="elevated" className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-brand-500 to-brand-600 rounded-airbnb-lg shadow-airbnb-md flex items-center justify-center">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Criar conta
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Cadastre-se no SpoolIQ
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="Nome completo"
          type="text"
          {...register('name')}
          error={errors.name?.message}
          fullWidth
        />

        <Input
          label="Email"
          type="email"
          {...register('email')}
          error={errors.email?.message}
          fullWidth
        />

        <Input
          label="Senha"
          type="password"
          {...register('password')}
          error={errors.password?.message}
          fullWidth
        />

        <Input
          label="Confirmar senha"
          type="password"
          {...register('password_confirmation')}
          error={errors.password_confirmation?.message}
          fullWidth
        />

        <Button
          type="submit"
          isLoading={isLoading}
          fullWidth
          size="lg"
          className="bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
        >
          Criar conta
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Já tem uma conta?{' '}
          <Link
            href="/login"
            className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors duration-200 hover:underline"
          >
            Fazer login
          </Link>
        </p>
      </div>
    </Card>
  )
}