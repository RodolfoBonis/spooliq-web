'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

import { Button, Input, Card } from '@/components/ui'
import { AuthService } from '@/services/auth.service'
import { useAuthStore } from '@/stores/auth-store'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

type LoginFormData = z.infer<typeof loginSchema>

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'
  const setAuth = useAuthStore((state) => state.setAuth)

  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true)
      const response = await AuthService.login(data)

      // Decode JWT to get user info
      const tokenPayload = JSON.parse(atob(response.accessToken.split('.')[1]))
      const user = {
        id: tokenPayload.sub,
        name: tokenPayload.name || tokenPayload.preferred_username,
        email: tokenPayload.email,
        role: tokenPayload.realm_access?.roles?.includes('Admin') ? 'admin' : 'user'
      }

      setAuth(user, {
        access_token: response.accessToken,
        refresh_token: response.refreshToken,
      })

      toast.success('Login realizado com sucesso!')
      router.push(redirectTo)
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Erro ao fazer login'
      toast.error(errorMessage || 'Erro ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card variant="elevated" className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-airbnb-lg shadow-airbnb-md flex items-center justify-center">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Faça seu login
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Entre na sua conta do SpoolIQ
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

        <Button
          type="submit"
          isLoading={isLoading}
          fullWidth
          size="lg"
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
        >
          Entrar
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Não tem uma conta?{' '}
          <Link
            href="/register"
            className="font-semibold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200 hover:underline"
          >
            Criar conta
          </Link>
        </p>
      </div>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <LoginForm />
    </Suspense>
  )
}