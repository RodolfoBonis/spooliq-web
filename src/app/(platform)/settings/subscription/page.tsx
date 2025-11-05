'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/stores/auth-store'
import { CreditCard, Calendar, AlertCircle, CheckCircle, XCircle, Loader2, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import subscriptionService from '@/services/subscription-service'
import { usePaymentMethods } from '@/lib/hooks/use-payment-methods'
import { PaymentMethodCard } from '@/components/subscription/PaymentMethodCard'
import { AddPaymentMethodModal } from '@/components/subscription/AddPaymentMethodModal'
import { PlanSelectionModal } from '@/components/subscription/PlanSelectionModal'
import { CancelSubscriptionModal } from '@/components/subscription/CancelSubscriptionModal'

export default function SubscriptionPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false)
  const [showPlansModal, setShowPlansModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)

  // Only Owner can access this page
  useEffect(() => {
    if (user && !user.roles.includes('Owner')) {
      router.push('/dashboard')
    }
  }, [user, router])

  // Fetch subscription data from API
  const {
    data: subscription,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => subscriptionService.getSubscription(),
    enabled: !!user && user.roles.includes('Owner'),
  })

  // Fetch payment history
  const { data: paymentHistory } = useQuery({
    queryKey: ['payment-history'],
    queryFn: () => subscriptionService.getPaymentHistory(),
    enabled: !!user && user.roles.includes('Owner'),
  })

  // Fetch payment methods
  const { data: paymentMethods, isLoading: isLoadingPaymentMethods } = usePaymentMethods()

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

  const daysRemaining = subscription?.trialEndsAt
    ? calculateDaysRemaining(subscription.trialEndsAt)
    : null

  // Loading state
  if (isLoading) {
    return (
      <div className="container max-w-4xl py-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          <p className="text-neutral-600">Carregando informações da assinatura...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="container max-w-4xl py-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Erro ao carregar assinatura</p>
                <p className="text-sm text-red-700 mt-1">
                  Não foi possível carregar as informações da sua assinatura. Tente novamente mais tarde.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // No subscription data
  if (!subscription) {
    return null
  }

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
            <Button 
              className="flex-1 bg-primary-500 hover:bg-primary-600"
              onClick={() => setShowAddPaymentModal(true)}
            >
              Atualizar Método de Pagamento
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setShowPlansModal(true)}
            >
              Ver Planos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Métodos de Pagamento
            <Button
              size="sm"
              onClick={() => setShowAddPaymentModal(true)}
              className="bg-primary-500 hover:bg-primary-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar
            </Button>
          </CardTitle>
          <CardDescription>
            Gerencie seus métodos de pagamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingPaymentMethods ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : paymentMethods && paymentMethods.payment_methods.length > 0 ? (
            <div className="space-y-3">
              {paymentMethods.payment_methods.map((method) => (
                <PaymentMethodCard key={method.id} paymentMethod={method} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-500">
              <CreditCard className="mx-auto h-12 w-12 text-neutral-300 mb-4" />
              <p className="font-medium">Nenhum método de pagamento</p>
              <p className="text-sm mt-1">
                Adicione um cartão ou PIX para pagar suas faturas
              </p>
              <Button
                className="mt-4 bg-primary-500 hover:bg-primary-600"
                onClick={() => setShowAddPaymentModal(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Método
              </Button>
            </div>
          )}
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
          {paymentHistory && paymentHistory.payments.length > 0 ? (
            <div className="space-y-3">
              {paymentHistory.payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-neutral-200"
                >
                  <div>
                    <p className="font-medium text-neutral-900">
                      R$ {(payment.amount / 100).toFixed(2)}
                    </p>
                    <p className="text-sm text-neutral-600">
                      Vencimento:{' '}
                      {new Date(payment.due_date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      className={
                        payment.status === 'received'
                          ? 'bg-green-100 text-green-700'
                          : payment.status === 'overdue'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                      }
                    >
                      {payment.status === 'received'
                        ? 'Pago'
                        : payment.status === 'overdue'
                          ? 'Vencido'
                          : 'Pendente'}
                    </Badge>
                    {payment.invoice_url && (
                      <a
                        href={payment.invoice_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-500 hover:underline block mt-1"
                      >
                        Ver fatura
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-500">
              <p>Nenhum pagamento realizado ainda</p>
              <p className="text-sm mt-1">
                {subscription.status === 'trial'
                  ? 'Você está no período de trial gratuito'
                  : 'Nenhuma transação encontrada'}
              </p>
            </div>
          )}
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
            <Button 
              variant="destructive"
              onClick={() => setShowCancelModal(true)}
            >
              Cancelar Assinatura
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <AddPaymentMethodModal
        open={showAddPaymentModal}
        onOpenChange={setShowAddPaymentModal}
      />
      
      <PlanSelectionModal
        open={showPlansModal}
        onOpenChange={setShowPlansModal}
        currentPlan={subscription?.plan}
        onNeedPaymentMethod={() => {
          setShowPlansModal(false)
          setShowAddPaymentModal(true)
        }}
      />
      
      <CancelSubscriptionModal
        open={showCancelModal}
        onOpenChange={setShowCancelModal}
        currentPlan={getPlanName(subscription?.plan)}
        nextBillingDate={subscription?.nextPaymentDue}
      />
    </div>
  )
}

