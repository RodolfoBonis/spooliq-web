'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle, Loader2, XCircle, Calendar } from 'lucide-react'
import { useCancelSubscription } from '@/lib/hooks/use-subscription-management'
import type { CancelSubscriptionRequest } from '@/services/subscription-management-service'

const cancelSchema = z.object({
  reason: z.string().min(1, 'Selecione um motivo'),
  feedback: z.string().optional(),
  immediately: z.boolean().default(false),
})

interface CancelSubscriptionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentPlan?: string
  nextBillingDate?: string
}

export function CancelSubscriptionModal({ 
  open, 
  onOpenChange, 
  currentPlan,
  nextBillingDate 
}: CancelSubscriptionModalProps) {
  const [step, setStep] = useState<'confirm' | 'details' | 'retention'>('confirm')
  const cancelMutation = useCancelSubscription()

  const form = useForm<z.infer<typeof cancelSchema>>({
    resolver: zodResolver(cancelSchema),
    defaultValues: {
      reason: '',
      feedback: '',
      immediately: false,
    },
  })

  const cancelReasons = [
    { value: 'too_expensive', label: 'Muito caro' },
    { value: 'not_using', label: 'Não estou usando o suficiente' },
    { value: 'missing_features', label: 'Faltam recursos importantes' },
    { value: 'technical_issues', label: 'Problemas técnicos' },
    { value: 'switching_competitors', label: 'Mudando para um concorrente' },
    { value: 'business_closure', label: 'Fechando o negócio' },
    { value: 'other', label: 'Outro motivo' },
  ]

  const onSubmit = async (values: z.infer<typeof cancelSchema>) => {
    try {
      await cancelMutation.mutateAsync({
        reason: values.reason,
        feedback: values.feedback || undefined,
        immediately: values.immediately,
      })
      onOpenChange(false)
      setStep('confirm')
      form.reset()
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleConfirmCancel = () => {
    setStep('details')
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Imediatamente'
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  const renderRetentionOffer = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          Antes de você partir...
        </h3>
        <p className="text-neutral-600">
          Que tal tentarmos resolver o que está incomodando?
        </p>
      </div>

      <div className="grid gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <h4 className="font-medium text-blue-900 mb-1">
              💬 Suporte Prioritário
            </h4>
            <p className="text-sm text-blue-700">
              Nossa equipe pode ajudar com qualquer dúvida ou problema técnico
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <h4 className="font-medium text-green-900 mb-1">
              🎓 Treinamento Gratuito
            </h4>
            <p className="text-sm text-green-700">
              Sessão 1:1 para maximizar o uso da plataforma
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <h4 className="font-medium text-purple-900 mb-1">
              💰 Desconto de 50%
            </h4>
            <p className="text-sm text-purple-700">
              Por 3 meses para você avaliar melhor nossos recursos
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => setStep('details')}
          className="flex-1"
        >
          Não, quero cancelar
        </Button>
        <Button
          onClick={() => {
            // Handle retention offer acceptance
            onOpenChange(false)
          }}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          Aceitar Ajuda
        </Button>
      </div>
    </div>
  )

  const renderConfirmStep = () => (
    <div className="space-y-6">
      <div className="flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
        <div>
          <h3 className="font-medium text-red-900">
            Você está prestes a cancelar sua assinatura
          </h3>
          <div className="text-sm text-red-700 mt-2 space-y-1">
            <p>• Perderá acesso a todos os recursos premium</p>
            <p>• Não poderá gerar novos orçamentos</p>
            <p>• Histórico de dados será mantido por 90 dias</p>
            <p>• Pode reativar a qualquer momento</p>
          </div>
        </div>
      </div>

      <div className="bg-neutral-50 p-4 rounded-lg">
        <h4 className="font-medium text-neutral-900 mb-2">Detalhes do Cancelamento</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-600">Plano atual:</span>
            <span className="font-medium">{currentPlan || 'Não informado'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-600">Acesso até:</span>
            <span className="font-medium">{formatDate(nextBillingDate)}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          className="flex-1"
        >
          Manter Assinatura
        </Button>
        <Button
          variant="destructive"
          onClick={handleConfirmCancel}
          className="flex-1"
        >
          <XCircle className="mr-2 h-4 w-4" />
          Sim, Cancelar
        </Button>
      </div>
    </div>
  )

  const renderDetailsStep = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Por que você está cancelando?</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um motivo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {cancelReasons.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="feedback"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Feedback adicional (opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Conte-nos como podemos melhorar..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="immediately"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Cancelar imediatamente
                </FormLabel>
                <p className="text-sm text-neutral-600">
                  Caso contrário, o acesso será mantido até {formatDate(nextBillingDate)}
                </p>
              </div>
            </FormItem>
          )}
        />

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep('confirm')}
            disabled={cancelMutation.isPending}
            className="flex-1"
          >
            Voltar
          </Button>
          <Button
            type="submit"
            variant="destructive"
            disabled={cancelMutation.isPending}
            className="flex-1"
          >
            {cancelMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cancelando...
              </>
            ) : (
              'Confirmar Cancelamento'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )

  const getStepContent = () => {
    switch (step) {
      case 'confirm':
        return renderConfirmStep()
      case 'retention':
        return renderRetentionOffer()
      case 'details':
        return renderDetailsStep()
      default:
        return renderConfirmStep()
    }
  }

  const getTitle = () => {
    switch (step) {
      case 'confirm':
        return 'Cancelar Assinatura'
      case 'retention':
        return 'Podemos Ajudar?'
      case 'details':
        return 'Detalhes do Cancelamento'
      default:
        return 'Cancelar Assinatura'
    }
  }

  const getDescription = () => {
    switch (step) {
      case 'confirm':
        return 'Você tem certeza que deseja cancelar sua assinatura?'
      case 'retention':
        return 'Antes de cancelar, vamos tentar resolver juntos'
      case 'details':
        return 'Nos ajude a melhorar compartilhando o motivo'
      default:
        return ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === 'confirm' && <XCircle className="h-5 w-5 text-red-600" />}
            {step === 'retention' && <Calendar className="h-5 w-5 text-blue-600" />}
            {step === 'details' && <AlertTriangle className="h-5 w-5 text-orange-600" />}
            {getTitle()}
          </DialogTitle>
          <DialogDescription>
            {getDescription()}
          </DialogDescription>
        </DialogHeader>

        {getStepContent()}
      </DialogContent>
    </Dialog>
  )
}