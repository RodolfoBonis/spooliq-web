'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCreatePublicPayment } from '@/lib/hooks/use-public-budget'
import { isInfinitePayUrl } from '@/lib/budgets/infinitepay'
import { PaymentSummaryList, payButtonLabel } from '@/components/public/payment-labels'
import { formatCurrency, formatDateShort } from '@/lib/utils/format'
import type {
  PublicBudgetPayment,
  PublicBudgetPaymentNext,
  PublicBudgetPaymentReceipt,
} from '@/types/models'
import { CreditCard, Loader2, CheckCircle, ExternalLink, Lock, Info } from 'lucide-react'

const CAPTURE_METHOD_LABEL: Record<string, string> = {
  pix: 'Pix',
  credit: 'Cartão de crédito',
  credit_card: 'Cartão de crédito',
  debit: 'Cartão de débito',
}

const UNAVAILABLE_REASON_MESSAGE: Record<string, string> = {
  not_approved: 'Aprove o orçamento acima para liberar o pagamento online.',
  below_minimum: 'O valor restante é menor que o mínimo para pagamento online (R$ 1,00).',
  payments_disabled: 'Pagamento online não está disponível para este orçamento.',
  disconnected: 'Pagamento online está temporariamente indisponível. Fale com a empresa.',
  already_paid: 'Este orçamento já está totalmente pago.',
}

interface PublicPaymentCardProps {
  payment: PublicBudgetPayment
  token: string
}

/**
 * Payment card shown on the public budget page, after the totals block.
 *
 * Renders one of four shapes depending on the API `payment` block:
 * - paid: receipt list;
 * - payable (approved budgets, `can_pay`): summary + "Pagar sinal/agora/restante";
 * - preview (sent budgets, `not_approved`): summary + "ao aprovar você poderá pagar…";
 * - unavailable: a short reason.
 *
 * The card is only rendered when there is something to show (see `shouldRenderPaymentCard`).
 */
export function PublicPaymentCard({ payment, token }: PublicPaymentCardProps) {
  const paidReceipts = payment.payments.filter((p) => !!p.paid_at)

  return (
    <Card className="mt-4">
      <CardContent className="space-y-4 py-5">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary-600" />
          <h3 className="text-base font-semibold text-neutral-900">Pagamento</h3>
        </div>

        {payment.status === 'partial' && (
          <div className="rounded-lg bg-neutral-50 p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-neutral-600">Pago até agora</span>
              <span className="font-medium text-emerald-700">{formatCurrency(payment.paid)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-neutral-600">Saldo</span>
              <span className="font-semibold text-neutral-900">{formatCurrency(payment.balance)}</span>
            </div>
          </div>
        )}

        {paidReceipts.length > 0 && <ReceiptList receipts={paidReceipts} />}

        {payment.status === 'paid' ? (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
            <CheckCircle className="h-5 w-5 shrink-0" />
            <span className="font-medium">Pagamento confirmado. Obrigado!</span>
          </div>
        ) : payment.can_pay && payment.next ? (
          <PayableSection next={payment.next} token={token} />
        ) : payment.next && payment.unavailable_reason === 'not_approved' ? (
          <PreviewSection next={payment.next} />
        ) : (
          <UnavailableSection reason={payment.unavailable_reason} />
        )}
      </CardContent>
    </Card>
  )
}

function PayableSection({ next, token }: { next: PublicBudgetPaymentNext; token: string }) {
  const createPayment = useCreatePublicPayment(token)
  // Keep disabled after success too: a valid checkout_url triggers a full-page redirect,
  // so re-enabling would only allow a pointless second click during navigation.
  const busy = createPayment.isPending || createPayment.isSuccess

  return (
    <div className="space-y-3">
      <PaymentSummaryList next={next} />
      <Button
        onClick={() => createPayment.mutate({ kind: next.kind })}
        disabled={busy}
        className="w-full bg-primary-600 text-white hover:bg-primary-700 sm:w-auto"
      >
        {busy ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <CreditCard className="mr-2 h-4 w-4" />
        )}
        {payButtonLabel(next)}
      </Button>
      <p className="flex items-center gap-1.5 text-xs text-neutral-400">
        <Lock className="h-3 w-3" />
        Pagamento processado com segurança pela InfinitePay.
      </p>
    </div>
  )
}

function PreviewSection({ next }: { next: PublicBudgetPaymentNext }) {
  return (
    <div className="space-y-3">
      <PaymentSummaryList next={next} />
      <p className="flex items-start gap-1.5 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        Ao aprovar o orçamento você poderá pagar online por aqui.
      </p>
    </div>
  )
}

function UnavailableSection({ reason }: { reason?: string | null }) {
  const message =
    (reason && UNAVAILABLE_REASON_MESSAGE[reason]) ||
    'Pagamento online não está disponível para este orçamento.'

  return (
    <p className="flex items-start gap-1.5 text-sm text-neutral-500">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
      {message}
    </p>
  )
}

function ReceiptList({ receipts }: { receipts: PublicBudgetPaymentReceipt[] }) {
  return (
    <ul className="space-y-2">
      {receipts.map((receipt, index) => {
        // Only link receipts that are genuine InfinitePay https URLs; otherwise drop the link.
        const receiptUrl = isInfinitePayUrl(receipt.receipt_url) ? receipt.receipt_url : null
        const method = receipt.capture_method
          ? CAPTURE_METHOD_LABEL[receipt.capture_method] ?? receipt.capture_method
          : null
        const details = [
          method,
          receipt.installments && receipt.installments > 1 ? `${receipt.installments}x` : null,
          receipt.paid_at ? formatDateShort(receipt.paid_at) : null,
        ].filter(Boolean)

        return (
          <li
            key={`${receipt.kind}-${index}`}
            className="flex items-center justify-between gap-3 rounded-lg border border-neutral-100 p-3 text-sm"
          >
            <div>
              <p className="font-medium text-neutral-900">{formatCurrency(receipt.paid_amount)}</p>
              {details.length > 0 && (
                <p className="text-xs text-neutral-500">{details.join(' · ')}</p>
              )}
            </div>
            {receiptUrl && (
              <a
                href={receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex shrink-0 items-center gap-1 text-primary-600 hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                Recibo
              </a>
            )}
          </li>
        )
      })}
    </ul>
  )
}
