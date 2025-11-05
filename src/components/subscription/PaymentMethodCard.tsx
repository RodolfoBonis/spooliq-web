'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CreditCard, 
  Smartphone, 
  FileText, 
  MoreVertical, 
  Star,
  Trash2,
  Check
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSetPrimaryPaymentMethod, useDeletePaymentMethod } from '@/lib/hooks/use-payment-methods'
import type { PaymentMethod } from '@/types/models'

interface PaymentMethodCardProps {
  paymentMethod: PaymentMethod
  onEdit?: () => void
}

export function PaymentMethodCard({ paymentMethod, onEdit }: PaymentMethodCardProps) {
  const setPrimaryMutation = useSetPrimaryPaymentMethod()
  const deleteMutation = useDeletePaymentMethod()

  const getIcon = () => {
    switch (paymentMethod.type) {
      case 'credit_card':
      case 'debit_card':
        return <CreditCard className="h-5 w-5" />
      case 'pix':
        return <Smartphone className="h-5 w-5" />
      case 'boleto':
        return <FileText className="h-5 w-5" />
      default:
        return <CreditCard className="h-5 w-5" />
    }
  }

  const getTypeLabel = () => {
    switch (paymentMethod.type) {
      case 'credit_card':
        return 'Cartão de Crédito'
      case 'debit_card':
        return 'Cartão de Débito'
      case 'pix':
        return 'PIX'
      case 'boleto':
        return 'Boleto'
      default:
        return paymentMethod.type
    }
  }

  const getCardBrand = () => {
    if (!paymentMethod.card_brand) return ''
    
    const brands: Record<string, string> = {
      visa: 'Visa',
      mastercard: 'Mastercard',
      elo: 'Elo',
      amex: 'American Express',
      hipercard: 'Hipercard',
    }
    
    return brands[paymentMethod.card_brand.toLowerCase()] || paymentMethod.card_brand
  }

  const handleSetPrimary = () => {
    setPrimaryMutation.mutate(paymentMethod.id)
  }

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja remover este método de pagamento?')) {
      deleteMutation.mutate(paymentMethod.id)
    }
  }

  return (
    <Card className={`relative ${paymentMethod.is_primary ? 'ring-2 ring-primary-500' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100">
              {getIcon()}
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-neutral-900">
                  {getTypeLabel()}
                </p>
                {paymentMethod.is_primary && (
                  <Badge className="bg-primary-100 text-primary-700 text-xs">
                    <Star className="mr-1 h-3 w-3" />
                    Principal
                  </Badge>
                )}
              </div>
              
              <div className="text-sm text-neutral-600 mt-1">
                {paymentMethod.type === 'credit_card' || paymentMethod.type === 'debit_card' ? (
                  <span>
                    {getCardBrand()} •••• {paymentMethod.last_four_digits}
                    {paymentMethod.holder_name && (
                      <span className="block">{paymentMethod.holder_name}</span>
                    )}
                    {paymentMethod.expiry_month && paymentMethod.expiry_year && (
                      <span className="block text-xs">
                        Válido até {paymentMethod.expiry_month}/{paymentMethod.expiry_year}
                      </span>
                    )}
                  </span>
                ) : paymentMethod.type === 'pix' ? (
                  <span>PIX cadastrado</span>
                ) : (
                  <span>Boleto bancário</span>
                )}
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!paymentMethod.is_primary && (
                <DropdownMenuItem
                  onClick={handleSetPrimary}
                  disabled={setPrimaryMutation.isPending}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Definir como principal
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  Editar
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remover
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Expiry warning for cards */}
        {(paymentMethod.type === 'credit_card' || paymentMethod.type === 'debit_card') &&
          paymentMethod.expiry_month &&
          paymentMethod.expiry_year && (
            (() => {
              const now = new Date()
              const expiry = new Date(
                parseInt(`20${paymentMethod.expiry_year}`),
                parseInt(paymentMethod.expiry_month) - 1,
                1
              )
              const monthsUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)
              
              if (monthsUntilExpiry <= 2 && monthsUntilExpiry > 0) {
                return (
                  <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded-md">
                    <p className="text-sm text-orange-700">
                      ⚠️ Este cartão expira em breve. Considere atualizar suas informações.
                    </p>
                  </div>
                )
              }
              
              if (monthsUntilExpiry <= 0) {
                return (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-700">
                      ❌ Este cartão está expirado. Atualize suas informações de pagamento.
                    </p>
                  </div>
                )
              }
              
              return null
            })()
          )}
      </CardContent>
    </Card>
  )
}