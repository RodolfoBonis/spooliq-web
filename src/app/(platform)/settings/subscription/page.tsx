'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/stores/auth-store'
import { CreditCard, Calendar, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function SubscriptionPage() {
  const { user } = useAuthStore()
  const router = useRouter()

  // Only Owner can access this page
  useEffect(() => {
    if (user && !user.roles.includes('Owner')) {
      router.push('/dashboard')
    }
  }, [user, router])

  // Mock data - Replace with real API call
  const subscription = {
    status: 'trial' as 'trial' | 'active' | 'overdue' | 'cancelled',
    plan: 'pro' as 'basic' | 'pro' | 'enterprise',
    trialEndsAt: '2024-11-01T00:00:00Z',
    nextPaymentDue: null,
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'trial':
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            <Calendar className="mr-1 h-3 w-3" />
            Trial Ativo
          </Badge>
        )
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <CheckCircle className="mr-1 h-3 w-3" />
            Ativo
          </Badge>
        )
      case 'overdue':
        return (
          <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
            <AlertCircle className="mr-1 h-3 w-3" />
            Pagamento Atrasado
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Cancelado
          </Badge>
        )
    }
  }

  const getPlanName = (plan: string) => {
    switch (plan) {
      case 'basic':
        return 'Básico'
      case 'pro':
        return 'Profissional'
      case 'enterprise':
        return 'Enterprise'
      default:
        return plan
    }
  }

  const calculateDaysRemaining = (date: string) => {
    const now = new Date()
    const end = new Date(date)
    const diff = end.getTime() - now.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const daysRemaining = subscription.trialEndsAt
    ? calculateDaysRemaining(subscription.trialEndsAt)
    : null

  return (
    <div className="container max-w-4xl py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-2">
          <CreditCard className="h-8 w-8 text-primary-500" />
          Assinatura
        </h1>
        <p className="text-neutral-600 mt-1">
          Gerencie sua assinatura e pagamentos
        </p>
      </div>

      {/* Trial Warning */}
      {subscription.status === 'trial' && daysRemaining && daysRemaining <= 7 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <p className="font-medium text-orange-900">
                  Seu trial termina em {daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'}
                </p>
                <p className="text-sm text-orange-700 mt-1">
                  Adicione um método de pagamento para continuar usando o SpoolIQ após o período de trial.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Plano Atual</CardTitle>
          <CardDescription>
            Informações sobre sua assinatura
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Status</p>
              <div className="mt-1">{getStatusBadge(subscription.status)}</div>
            </div>
            <div className="text-right">
              <p className="text-sm text-neutral-600">Plano</p>
              <p className="text-lg font-semibold text-neutral-900 mt-1">
                {getPlanName(subscription.plan)}
              </p>
            </div>
          </div>

          <Separator />

          {subscription.status === 'trial' && subscription.trialEndsAt && (
            <div>
              <p className="text-sm text-neutral-600">Trial termina em</p>
              <p className="text-lg font-medium text-neutral-900 mt-1">
                {new Date(subscription.trialEndsAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
              <p className="text-sm text-neutral-500 mt-1">
                {daysRemaining} {daysRemaining === 1 ? 'dia restante' : 'dias restantes'}
              </p>
            </div>
          )}

          {subscription.status === 'active' && subscription.nextPaymentDue && (
            <div>
              <p className="text-sm text-neutral-600">Próximo pagamento</p>
              <p className="text-lg font-medium text-neutral-900 mt-1">
                {new Date(subscription.nextPaymentDue).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button className="flex-1 bg-primary-500 hover:bg-primary-600">
              Atualizar Método de Pagamento
            </Button>
            <Button variant="outline" className="flex-1">
              Ver Planos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Plan Features */}
      <Card>
        <CardHeader>
          <CardTitle>Recursos do Plano {getPlanName(subscription.plan)}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <span className="text-neutral-700">Orçamentos ilimitados</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <span className="text-neutral-700">10 usuários</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <span className="text-neutral-700">PDFs personalizados</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <span className="text-neutral-700">Dashboard analítico</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <span className="text-neutral-700">Suporte prioritário</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pagamentos</CardTitle>
          <CardDescription>
            Últimas transações da sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-neutral-500">
            <p>Nenhum pagamento realizado ainda</p>
            <p className="text-sm mt-1">
              Você está no período de trial gratuito
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Cancel Subscription */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Zona de Perigo</CardTitle>
          <CardDescription>
            Ações irreversíveis para sua assinatura
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900">Cancelar Assinatura</p>
              <p className="text-sm text-neutral-600 mt-1">
                Você perderá acesso a todos os recursos ao final do período pago
              </p>
            </div>
            <Button variant="destructive">
              Cancelar Assinatura
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

