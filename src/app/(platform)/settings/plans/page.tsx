'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Check, 
  Crown, 
  Star, 
  Zap,
  ArrowLeft,
  Loader2,
  CreditCard,
  Users,
  FileText,
  BarChart3,
  Headphones,
  Globe,
  Shield
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { usePlansComparison, usePlanFeatures } from '@/lib/hooks/use-subscription-plans'
import { useSubscribeToPlan } from '@/lib/hooks/use-subscription-management'
import { useHasPaymentMethods } from '@/lib/hooks/use-payment-methods'
import { useQuery } from '@tanstack/react-query'
import subscriptionService from '@/services/subscription-service'
import { AddPaymentMethodModal } from '@/components/subscription/add-payment-method-modal'

export default function PlansPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false)
  
  const { formattedPlans, isLoading } = usePlansComparison()
  const { hasPaymentMethods, primaryPaymentMethod } = useHasPaymentMethods()
  const subscribeMutation = useSubscribeToPlan()
  const planFeatures = usePlanFeatures()

  // Get current subscription
  const { data: currentSubscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => subscriptionService.getSubscription(),
  })

  const handleSubscribe = async (planId: string) => {
    if (!hasPaymentMethods) {
      setShowAddPaymentModal(true)
      return
    }

    try {
      await subscribeMutation.mutateAsync({
        plan_id: planId,
        payment_method_id: primaryPaymentMethod?.id,
        billing_cycle: billingCycle,
      })
      router.push('/settings/subscription')
    } catch (error) {
      // Error handled by mutation
    }
  }

  const getPlanIcon = (planName: string) => {
    const name = planName.toLowerCase()
    if (name.includes('enterprise')) return <Crown className="h-6 w-6" />
    if (name.includes('pro')) return <Star className="h-6 w-6" />
    return <Zap className="h-6 w-6" />
  }

  const getPlanFeatures = (planName: string) => {
    const name = planName.toLowerCase()
    if (name.includes('enterprise')) return planFeatures.enterprise
    if (name.includes('pro')) return planFeatures.pro
    return planFeatures.basic
  }

  const isCurrentPlan = (planId: string) => {
    return currentSubscription?.plan === planId
  }

  const getActionButton = (plan: any) => {
    const isCurrent = isCurrentPlan(plan.id)
    const isLoading = subscribeMutation.isPending && selectedPlan === plan.id

    if (isCurrent) {
      return (
        <Button disabled className="w-full" variant="outline">
          <Check className="mr-2 h-4 w-4" />
          Plano Atual
        </Button>
      )
    }

    return (
      <Button
        onClick={() => {
          setSelectedPlan(plan.id)
          handleSubscribe(plan.id)
        }}
        disabled={isLoading}
        className="w-full bg-primary-500 hover:bg-primary-600"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processando...
          </>
        ) : (
          'Escolher Plano'
        )}
      </Button>
    )
  }

  if (isLoading) {
    return (
      <div className="container max-w-6xl py-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          <p className="text-neutral-600">Carregando planos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-6xl py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">
            Escolha seu Plano
          </h1>
          <p className="text-neutral-600 mt-1">
            Selecione o plano ideal para sua empresa
          </p>
        </div>
      </div>

      {/* Payment Method Warning */}
      {!hasPaymentMethods && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CreditCard className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <p className="font-medium text-orange-900">
                  Método de Pagamento Necessário
                </p>
                <p className="text-sm text-orange-700 mt-1">
                  Adicione um método de pagamento para assinar um plano.
                </p>
                <Button
                  size="sm"
                  className="mt-3 bg-orange-600 hover:bg-orange-700"
                  onClick={() => setShowAddPaymentModal(true)}
                >
                  Adicionar Método de Pagamento
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4">
        <span className={`text-sm ${billingCycle === 'monthly' ? 'font-medium' : 'text-neutral-600'}`}>
          Mensal
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
          className={`relative w-12 h-6 p-0 ${billingCycle === 'yearly' ? 'bg-primary-500' : ''}`}
        >
          <div className={`absolute w-4 h-4 bg-white rounded-full transition-transform ${
            billingCycle === 'yearly' ? 'translate-x-3' : 'translate-x-1'
          }`} />
        </Button>
        <span className={`text-sm ${billingCycle === 'yearly' ? 'font-medium' : 'text-neutral-600'}`}>
          Anual
        </span>
        {billingCycle === 'yearly' && (
          <Badge className="bg-green-100 text-green-700 text-xs">
            2 meses grátis
          </Badge>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {formattedPlans.map((plan) => {
          const features = getPlanFeatures(plan.name)
          const monthlyPrice = billingCycle === 'yearly' 
            ? Math.round(parseFloat(plan.price.replace('R$ ', '')) * 0.83) 
            : parseFloat(plan.price.replace('R$ ', ''))
          const isCurrent = isCurrentPlan(plan.id)

          return (
            <Card 
              key={plan.id}
              className={`relative ${
                plan.isPopular ? 'scale-105 shadow-xl' : 'shadow-lg'
              } ${isCurrent ? 'ring-2 ring-blue-500' : ''}`}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary-500 text-white px-4 py-2 text-sm">
                    Mais Popular
                  </Badge>
                </div>
              )}

              {isCurrent && (
                <div className="absolute -top-4 right-4">
                  <Badge className="bg-blue-500 text-white px-3 py-1 text-xs">
                    Atual
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center mb-4">
                  <div className={`p-3 rounded-full ${
                    plan.isPopular ? 'bg-primary-100' : 'bg-neutral-100'
                  }`}>
                    {getPlanIcon(plan.name)}
                  </div>
                </div>
                
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                
                <div className="space-y-2">
                  <div className="text-4xl font-bold">
                    R$ {monthlyPrice.toFixed(2).replace('.', ',')}
                  </div>
                  <div className="text-sm text-neutral-600">
                    {billingCycle === 'yearly' ? 'por mês (anual)' : 'por mês'}
                  </div>
                  {billingCycle === 'yearly' && (
                    <div className="text-sm text-green-600 font-medium">
                      Economize R$ {(parseFloat(plan.price.replace('R$ ', '')) * 2).toFixed(2)}
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-sm text-neutral-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  {getActionButton(plan)}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Detailed Features Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Comparação Detalhada</CardTitle>
          <CardDescription>
            Veja todos os recursos incluídos em cada plano
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Recurso</th>
                  <th className="text-center py-3 px-4">Básico</th>
                  <th className="text-center py-3 px-4">Profissional</th>
                  <th className="text-center py-3 px-4">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="py-3 px-4 flex items-center gap-2">
                    <Users className="h-4 w-4 text-neutral-500" />
                    Usuários
                  </td>
                  <td className="text-center py-3 px-4">5</td>
                  <td className="text-center py-3 px-4">15</td>
                  <td className="text-center py-3 px-4">Ilimitado</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-neutral-500" />
                    Orçamentos por mês
                  </td>
                  <td className="text-center py-3 px-4">100</td>
                  <td className="text-center py-3 px-4">Ilimitado</td>
                  <td className="text-center py-3 px-4">Ilimitado</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-neutral-500" />
                    Dashboard analítico
                  </td>
                  <td className="text-center py-3 px-4">❌</td>
                  <td className="text-center py-3 px-4">✅</td>
                  <td className="text-center py-3 px-4">✅ Avançado</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 flex items-center gap-2">
                    <Globe className="h-4 w-4 text-neutral-500" />
                    API de integração
                  </td>
                  <td className="text-center py-3 px-4">❌</td>
                  <td className="text-center py-3 px-4">✅</td>
                  <td className="text-center py-3 px-4">✅ Completa</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-neutral-500" />
                    White label
                  </td>
                  <td className="text-center py-3 px-4">❌</td>
                  <td className="text-center py-3 px-4">❌</td>
                  <td className="text-center py-3 px-4">✅</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 flex items-center gap-2">
                    <Headphones className="h-4 w-4 text-neutral-500" />
                    Suporte
                  </td>
                  <td className="text-center py-3 px-4">Email</td>
                  <td className="text-center py-3 px-4">Prioritário</td>
                  <td className="text-center py-3 px-4">Dedicado</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Perguntas Frequentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-neutral-900 mb-1">
              Posso alterar meu plano a qualquer momento?
            </h4>
            <p className="text-sm text-neutral-600">
              Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. 
              As alterações são feitas com base proporcional.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-neutral-900 mb-1">
              O que acontece se eu cancelar?
            </h4>
            <p className="text-sm text-neutral-600">
              Você manterá acesso a todos os recursos até o final do período pago. 
              Seus dados ficam salvos por 90 dias caso queira reativar.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-neutral-900 mb-1">
              Há desconto para pagamento anual?
            </h4>
            <p className="text-sm text-neutral-600">
              Sim! Pagando anualmente você economiza o equivalente a 2 meses de assinatura.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Add Payment Method Modal */}
      <AddPaymentMethodModal
        open={showAddPaymentModal}
        onOpenChange={setShowAddPaymentModal}
      />
    </div>
  )
}