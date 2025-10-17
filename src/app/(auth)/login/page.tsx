'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

import { loginSchema, type LoginFormData } from '@/lib/validations/auth'
import { authService } from '@/services/auth-service'
import { companyService } from '@/services/company-service'
import { useAuthStore } from '@/stores/auth-store'
import { useCompanyStore } from '@/stores/company-store'
import { decodeJWT } from '@/lib/utils/jwt'

export default function LoginPage() {
  const router = useRouter()
  const { isAuthenticated, setAuth } = useAuthStore()
  const { setCompany } = useCompanyStore()
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    } else {
      setIsCheckingAuth(false)
    }
  }, [isAuthenticated, router])

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true)
      
      // Login
      const loginResponse = await authService.login(data)
      
      // Decode JWT to get user information
      const user = decodeJWT(loginResponse.accessToken)
      
      if (!user) {
        throw new Error('Falha ao decodificar token de autenticação')
      }

      // Set auth state with real user data
      setAuth(user, loginResponse.accessToken)

      // Fetch company data
      try {
        const company = await companyService.get()
        setCompany(company)
      } catch (error) {
        console.error('Error fetching company:', error)
        // Don't block login if company fetch fails
      }

      toast.success('Login realizado com sucesso!')
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error(error.response?.data?.message || 'Erro ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold text-primary-500">
            SpoolIQ
          </CardTitle>
          <CardDescription>
            Entre com suas credenciais para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="seu@email.com"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-primary-500 hover:bg-primary-600 text-white "
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Entrar
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center text-sm">
          <div className="text-neutral-600">
            Não tem uma conta?{' '}
            <Link
              href="/register"
              className="font-medium text-primary-500 hover:text-primary-600 hover:underline"
            >
              Criar conta grátis
            </Link>
          </div>
          <Link
            href="/forgot-password"
            className="text-neutral-500 hover:text-neutral-600 hover:underline"
          >
            Esqueceu sua senha?
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

