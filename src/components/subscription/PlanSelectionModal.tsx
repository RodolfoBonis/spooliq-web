'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Check, 
  Crown, 
  Star, 
  Zap,
  Users,
  FileText,
  BarChart3,
  Headphones,
  Loader2
} from 'lucide-react'
import { usePlansComparison, usePlanFeatures } from '@/lib/hooks/use-subscription-plans'
import { useSubscribeToPlan } from '@/lib/hooks/use-subscription-management'
import { useHasPaymentMethods } from '@/lib/hooks/use-payment-methods'

interface PlanSelectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentPlan?: string
  onNeedPaymentMethod?: () => void
}

export function PlanSelectionModal({ 
  open, 
  onOpenChange, 
  currentPlan,
  onNeedPaymentMethod 
}: PlanSelectionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  
  const { formattedPlans, isLoading } = usePlansComparison()
  const { hasPaymentMethods, primaryPaymentMethod } = useHasPaymentMethods()
  const subscribeMutation = useSubscribeToPlan()
  const planFeatures = usePlanFeatures()

  const handleSubscribe = async () => {
    if (!selectedPlan) return

    if (!hasPaymentMethods) {
      onNeedPaymentMethod?.()
      return
    }

    try {
      await subscribeMutation.mutateAsync({
        plan_id: selectedPlan,
        payment_method_id: primaryPaymentMethod?.id,
        billing_cycle: billingCycle,
      })
      onOpenChange(false)
    } catch (error) {
      // Error handled by mutation
    }
  }

  const getPlanIcon = (planName: string) => {
    const name = planName.toLowerCase()
    if (name.includes('enterprise')) return <Crown className="h-5 w-5" />
    if (name.includes('pro')) return <Star className="h-5 w-5" />
    return <Zap className="h-5 w-5" />
  }

  const getPlanFeatures = (planName: string) => {
    const name = planName.toLowerCase()
    if (name.includes('enterprise')) return planFeatures.enterprise
    if (name.includes('pro')) return planFeatures.pro
    return planFeatures.basic
  }

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[900px]">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Escolha seu Plano</DialogTitle>
          <DialogDescription>
            Selecione o plano ideal para sua empresa. Você pode alterar a qualquer momento.
          </DialogDescription>
        </DialogHeader>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-6">
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
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {formattedPlans.map((plan) => {
            const isCurrentPlan = currentPlan === plan.id
            const isSelected = selectedPlan === plan.id
            const features = getPlanFeatures(plan.name)
            const monthlyPrice = billingCycle === 'yearly' 
              ? Math.round(parseFloat(plan.price.replace('R$ ', '')) * 0.83) 
              : parseFloat(plan.price.replace('R$ ', ''))

            return (
              <Card 
                key={plan.id}
                className={`relative cursor-pointer transition-all ${
                  isSelected 
                    ? 'ring-2 ring-primary-500 shadow-lg' 
                    : isCurrentPlan
                    ? 'ring-2 ring-blue-500'
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary-500 text-white px-3 py-1">
                      Mais Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-3">
                  <div className="flex items-center justify-center mb-2">
                    {getPlanIcon(plan.name)}
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="space-y-1">
                    <div className="text-3xl font-bold">
                      R$ {monthlyPrice.toFixed(2).replace('.', ',')}
                    </div>
                    <div className="text-sm text-neutral-600">
                      {billingCycle === 'yearly' ? 'por mês (anual)' : 'por mês'}
                    </div>
                    {billingCycle === 'yearly' && (
                      <div className="text-xs text-green-600">
                        Economize R$ {(parseFloat(plan.price.replace('R$ ', '')) * 2).toFixed(2)}
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-neutral-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrentPlan && (
                    <Badge className="w-full justify-center bg-blue-100 text-blue-700">
                      Plano Atual
                    </Badge>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Payment Method Warning */}
        {!hasPaymentMethods && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="bg-orange-100 rounded-full p-1">
                <Headphones className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <h4 className="font-medium text-orange-900">Método de Pagamento Necessário</h4>
                <p className="text-sm text-orange-700 mt-1">
                  Você precisa adicionar um método de pagamento antes de assinar um plano.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={subscribeMutation.isPending}
          >
            Cancelar
          </Button>

          <div className="flex gap-3">
            {!hasPaymentMethods && (
              <Button
                variant="outline"
                onClick={() => {
                  onNeedPaymentMethod?.()
                  onOpenChange(false)
                }}
              >
                Adicionar Método de Pagamento
              </Button>
            )}

            <Button
              onClick={handleSubscribe}
              disabled={!selectedPlan || subscribeMutation.isPending}
              className="bg-primary-500 hover:bg-primary-600"
            >
              {subscribeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : selectedPlan === currentPlan ? (
                'Manter Plano Atual'
              ) : (
                'Assinar Plano'
              )}
            </Button>
          </div>
        </div>

        {/* Features Comparison */}
        <div className="mt-6 pt-6 border-t">
          <h3 className="font-medium text-neutral-900 mb-4">Comparação de Recursos</h3>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="font-medium text-neutral-600">Recurso</div>
            <div className="text-center font-medium">Básico</div>
            <div className="text-center font-medium">Profissional</div>
            <div className="text-center font-medium">Enterprise</div>

            <div className="text-neutral-700">Usuários</div>
            <div className="text-center">5</div>
            <div className="text-center">15</div>
            <div className="text-center">Ilimitado</div>

            <div className="text-neutral-700">Orçamentos</div>
            <div className="text-center">100/mês</div>
            <div className="text-center">Ilimitado</div>
            <div className="text-center">Ilimitado</div>

            <div className="text-neutral-700">API</div>
            <div className="text-center">❌</div>
            <div className="text-center">✅</div>
            <div className="text-center">✅ Completa</div>

            <div className="text-neutral-700">Suporte</div>
            <div className="text-center">Email</div>
            <div className="text-center">Prioritário</div>
            <div className="text-center">Dedicado</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}