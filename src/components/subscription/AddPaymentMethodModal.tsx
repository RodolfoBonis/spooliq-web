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
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, Smartphone, FileText, Loader2 } from 'lucide-react'
import { useAddPaymentMethod } from '@/lib/hooks/use-payment-methods'
import type { AddPaymentMethodRequest } from '@/services/payment-method-service'

const creditCardSchema = z.object({
  card_number: z.string()
    .min(13, 'Número do cartão deve ter pelo menos 13 dígitos')
    .max(19, 'Número do cartão deve ter no máximo 19 dígitos')
    .regex(/^\d+$/, 'Digite apenas números'),
  card_holder_name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo'),
  expiry_month: z.string()
    .min(1, 'Selecione o mês')
    .max(2, 'Mês inválido'),
  expiry_year: z.string()
    .min(2, 'Selecione o ano')
    .max(2, 'Ano inválido'),
  cvv: z.string()
    .min(3, 'CVV deve ter 3 ou 4 dígitos')
    .max(4, 'CVV deve ter 3 ou 4 dígitos')
    .regex(/^\d+$/, 'CVV deve conter apenas números'),
})

interface AddPaymentMethodModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddPaymentMethodModal({ open, onOpenChange }: AddPaymentMethodModalProps) {
  const [paymentType, setPaymentType] = useState<'credit_card' | 'pix' | 'boleto'>('credit_card')
  const addPaymentMethodMutation = useAddPaymentMethod()

  const form = useForm<z.infer<typeof creditCardSchema>>({
    resolver: zodResolver(creditCardSchema),
    defaultValues: {
      card_number: '',
      card_holder_name: '',
      expiry_month: '',
      expiry_year: '',
      cvv: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof creditCardSchema>) => {
    try {
      const data: AddPaymentMethodRequest = {
        card_number: values.card_number.replace(/\s/g, ''),
        card_holder_name: values.card_holder_name,
        expiry_month: values.expiry_month,
        expiry_year: values.expiry_year,
        cvv: values.cvv,
      }

      await addPaymentMethodMutation.mutateAsync(data)
      onOpenChange(false)
      form.reset()
    } catch (error) {
      // Error is handled by the mutation
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const months = Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString().padStart(2, '0')
    return { value: month, label: month }
  })

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => {
    const year = (currentYear + i).toString().slice(-2)
    return { value: year, label: `20${year}` }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Adicionar Método de Pagamento</DialogTitle>
          <DialogDescription>
            Adicione um novo método de pagamento para suas assinaturas
          </DialogDescription>
        </DialogHeader>

        <Tabs value={paymentType} onValueChange={(value) => setPaymentType(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="credit_card" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Cartão
            </TabsTrigger>
            <TabsTrigger value="pix" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              PIX
            </TabsTrigger>
            <TabsTrigger value="boleto" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Boleto
            </TabsTrigger>
          </TabsList>

          <TabsContent value="credit_card" className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="card_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número do Cartão</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="1234 5678 9012 3456"
                          {...field}
                          value={formatCardNumber(field.value)}
                          onChange={(e) => field.onChange(formatCardNumber(e.target.value))}
                          maxLength={19}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="card_holder_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome no Cartão</FormLabel>
                      <FormControl>
                        <Input placeholder="JOÃO DA SILVA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="expiry_month"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mês</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="MM" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {months.map((month) => (
                              <SelectItem key={month.value} value={month.value}>
                                {month.label}
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
                    name="expiry_year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ano</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="AA" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {years.map((year) => (
                              <SelectItem key={year.value} value={year.value}>
                                {year.label}
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
                    name="cvv"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CVV</FormLabel>
                        <FormControl>
                          <Input placeholder="123" maxLength={4} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={addPaymentMethodMutation.isPending}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={addPaymentMethodMutation.isPending}
                    className="bg-primary-500 hover:bg-primary-600"
                  >
                    {addPaymentMethodMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adicionando...
                      </>
                    ) : (
                      'Adicionar Cartão'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="pix" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  PIX
                </CardTitle>
                <CardDescription>
                  O PIX será configurado automaticamente para sua conta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-600 mb-4">
                  Com o PIX, você pode pagar suas faturas instantaneamente usando qualquer banco.
                  Não é necessário cadastrar informações adicionais.
                </p>
                <div className="flex justify-end">
                  <Button
                    onClick={() => {
                      // Handle PIX setup
                      onOpenChange(false)
                    }}
                    className="bg-primary-500 hover:bg-primary-600"
                  >
                    Ativar PIX
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="boleto" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Boleto Bancário
                </CardTitle>
                <CardDescription>
                  Pague suas faturas através de boleto bancário
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-600 mb-4">
                  Com o boleto bancário, você receberá um código de barras para pagamento
                  em qualquer banco, casa lotérica ou app bancário.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                  <p className="text-sm text-yellow-700">
                    ⚠️ O vencimento do boleto é em 3 dias úteis. Após este prazo,
                    será necessário gerar um novo boleto.
                  </p>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={() => {
                      // Handle boleto setup
                      onOpenChange(false)
                    }}
                    className="bg-primary-500 hover:bg-primary-600"
                  >
                    Ativar Boleto
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}