'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FileText,
  Users,
  Palette,
  BarChart3,
  Package,
  Zap,
  Check,
  ArrowRight,
} from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    // Redirect to dashboard if already authenticated
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  // Show landing page if not authenticated
  if (isAuthenticated) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary-500">SpoolIQ</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
              Recursos
            </a>
            <a href="#pricing" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
              Preços
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-primary-500 hover:bg-primary-600">
                Começar Grátis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white to-neutral-50 py-20 md:py-32">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-6xl">
                Gerencie seus orçamentos de{' '}
                <span className="text-primary-500">impressão 3D</span> de forma profissional
              </h1>
              <p className="mt-6 text-lg leading-8 text-neutral-600">
                Plataforma completa para criar orçamentos detalhados, gerenciar clientes
                e aumentar suas vendas de impressão 3D
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link href="/register">
                  <Button size="lg" className="bg-primary-500 hover:bg-primary-600">
                    Começar agora - 14 dias grátis
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <a href="#features">
                  <Button size="lg" variant="outline">
                    Ver demonstração
                  </Button>
                </a>
              </div>
              <p className="mt-6 text-sm text-neutral-500">
                ✓ Sem cartão de crédito • ✓ Cancele quando quiser • ✓ Suporte em português
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
                Por que escolher o SpoolIQ?
              </h2>
              <p className="mt-4 text-lg text-neutral-600">
                Tudo que você precisa para profissionalizar seus orçamentos
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <FileText className="h-10 w-10 text-primary-500 mb-2" />
                  <CardTitle>Orçamentos Inteligentes</CardTitle>
                  <CardDescription>
                    Cálculo automático considerando filamento, energia, mão de obra e desperdício AMS
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Package className="h-10 w-10 text-primary-500 mb-2" />
                  <CardTitle>Catálogo de Filamentos</CardTitle>
                  <CardDescription>
                    Organize todos seus materiais com sistema avançado de cores e multi-filament support
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Palette className="h-10 w-10 text-primary-500 mb-2" />
                  <CardTitle>PDFs Profissionais</CardTitle>
                  <CardDescription>
                    Geração automática de orçamentos em PDF com personalização de cores e sua marca
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Users className="h-10 w-10 text-primary-500 mb-2" />
                  <CardTitle>Gestão de Clientes</CardTitle>
                  <CardDescription>
                    Centralize informações e histórico completo de cada cliente
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <BarChart3 className="h-10 w-10 text-primary-500 mb-2" />
                  <CardTitle>Dashboard Analítico</CardTitle>
                  <CardDescription>
                    Acompanhe receita, orçamentos e performance em tempo real
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Zap className="h-10 w-10 text-primary-500 mb-2" />
                  <CardTitle>Multi-tenancy Seguro</CardTitle>
                  <CardDescription>
                    Seus dados isolados e protegidos com controle de acesso por usuário
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-neutral-50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
                Planos que crescem com você
              </h2>
              <p className="mt-4 text-lg text-neutral-600">
                Escolha o plano ideal para o seu negócio
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Starter */}
              <Card>
                <CardHeader>
                  <CardTitle>Starter</CardTitle>
                  <CardDescription>Para quem está começando</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-neutral-900">R$ 29</span>
                    <span className="text-neutral-600">/mês</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 mt-0.5" />
                      <span className="text-sm text-neutral-700">50 orçamentos/mês</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 mt-0.5" />
                      <span className="text-sm text-neutral-700">3 usuários</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 mt-0.5" />
                      <span className="text-sm text-neutral-700">PDF básico</span>
                    </li>
                  </ul>
                  <Link href="/register" className="block">
                    <Button variant="outline" className="w-full">
                      Começar
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Professional */}
              <Card className="border-primary-500 border-2 relative">
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Mais Popular
                  </span>
                </div>
                <CardHeader>
                  <CardTitle>Professional</CardTitle>
                  <CardDescription>Para negócios em crescimento</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-neutral-900">R$ 79</span>
                    <span className="text-neutral-600">/mês</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 mt-0.5" />
                      <span className="text-sm text-neutral-700">Orçamentos ilimitados</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 mt-0.5" />
                      <span className="text-sm text-neutral-700">10 usuários</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 mt-0.5" />
                      <span className="text-sm text-neutral-700">PDF personalizado</span>
                    </li>
                  </ul>
                  <Link href="/register" className="block">
                    <Button className="w-full bg-primary-500 hover:bg-primary-600">
                      Começar
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Enterprise */}
              <Card>
                <CardHeader>
                  <CardTitle>Enterprise</CardTitle>
                  <CardDescription>Para grandes operações</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-neutral-900">Custom</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 mt-0.5" />
                      <span className="text-sm text-neutral-700">Tudo do Pro</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 mt-0.5" />
                      <span className="text-sm text-neutral-700">Usuários ilimitados</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 mt-0.5" />
                      <span className="text-sm text-neutral-700">API access</span>
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full">
                    Falar conosco
                  </Button>
                </CardContent>
              </Card>
            </div>

            <p className="text-center mt-8 text-sm text-neutral-600">
              ✨ Todos os planos incluem 14 dias de teste grátis
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary-500">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Pronto para profissionalizar seus orçamentos?
              </h2>
              <p className="mt-4 text-lg text-primary-100">
                Junte-se a centenas de profissionais que já usam o SpoolIQ
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link href="/register">
                  <Button size="lg" variant="secondary">
                    Começar agora - 14 dias grátis
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-neutral-50">
        <div className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <span className="text-2xl font-bold text-primary-500">SpoolIQ</span>
              <p className="text-sm text-neutral-600 mt-3">
                Plataforma completa para gerenciamento de orçamentos de impressão 3D
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-neutral-900 mb-3">Produto</h3>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li><a href="#features" className="hover:text-neutral-900">Recursos</a></li>
                <li><a href="#pricing" className="hover:text-neutral-900">Preços</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-neutral-900 mb-3">Empresa</h3>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li><Link href="/login" className="hover:text-neutral-900">Entrar</Link></li>
                <li><Link href="/register" className="hover:text-neutral-900">Cadastrar</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-neutral-900 mb-3">Legal</h3>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li><a href="#" className="hover:text-neutral-900">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-neutral-900">Privacidade</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-neutral-200 mt-8 pt-8 text-center text-sm text-neutral-600">
            © 2024 SpoolIQ. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}

