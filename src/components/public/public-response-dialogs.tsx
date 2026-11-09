'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  useApprovePublicBudget,
  useRejectPublicBudget,
  useCreatePublicPayment,
  getPublicBudgetErrorMessage,
} from '@/lib/hooks/use-public-budget'
import { PaymentSummaryList, payButtonLabel } from '@/components/public/payment-labels'
import type { PublicBudgetPaymentNext } from '@/types/models'
import {
  publicApproveSchema,
  publicRejectSchema,
  type PublicApproveFormData,
  type PublicRejectFormData,
} from '@/lib/validations/public-budget'
import { CheckCircle, CreditCard, Loader2, XCircle } from 'lucide-react'

export type ResponseMode = 'approve' | 'reject' | null

interface PublicResponseDialogsProps {
  token: string
  mode: ResponseMode
  onClose: () => void
}

export function PublicResponseDialogs({ token, mode, onClose }: PublicResponseDialogsProps) {
  return (
    <>
      <ApproveDialog token={token} open={mode === 'approve'} onClose={onClose} />
      <RejectDialog token={token} open={mode === 'reject'} onClose={onClose} />
    </>
  )
}

function ApproveDialog({
  token,
  open,
  onClose,
}: {
  token: string
  open: boolean
  onClose: () => void
}) {
  const approve = useApprovePublicBudget(token)
  const form = useForm<PublicApproveFormData>({
    resolver: zodResolver(publicApproveSchema),
    defaultValues: { name: '' },
  })

  useEffect(() => {
    if (open) {
      form.reset({ name: '' })
      approve.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const onSubmit = (data: PublicApproveFormData) => {
    if (approve.isPending) return
    approve.mutate(
      { name: data.name },
      {
        // When the approved budget can be paid right away we keep the dialog open and
        // offer "Pagar agora"; otherwise we close as before.
        onSuccess: (budget) => {
          if (!budget.payment?.can_pay || !budget.payment.next) onClose()
        },
      }
    )
  }

  const payNext =
    approve.isSuccess && approve.data.payment?.can_pay ? approve.data.payment.next : null

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            {payNext ? 'Orçamento aprovado!' : 'Aprovar orçamento'}
          </DialogTitle>
          <DialogDescription>
            {payNext
              ? 'Você já pode pagar online agora ou fechar e pagar mais tarde pelo mesmo link.'
              : 'Confirme seu nome para registrar a aprovação deste orçamento.'}
          </DialogDescription>
        </DialogHeader>

        {payNext ? (
          <ApprovedPayStep next={payNext} token={token} onClose={onClose} />
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="approve-name">Seu nome</Label>
              <Input id="approve-name" autoFocus {...form.register('name')} />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
              )}
            </div>

            {approve.isError && (
              <p className="text-sm text-red-600">
                {getPublicBudgetErrorMessage(approve.error, 'Erro ao aprovar o orçamento')}
              </p>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={approve.isPending}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={approve.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {approve.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmar aprovação
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}


/** Post-approval step: shows the payment summary and a "Pagar agora" CTA. */
function ApprovedPayStep({
  next,
  token,
  onClose,
}: {
  next: PublicBudgetPaymentNext
  token: string
  onClose: () => void
}) {
  const createPayment = useCreatePublicPayment(token)
  // Keep disabled after success too: a valid checkout_url triggers a full-page redirect.
  const busy = createPayment.isPending || createPayment.isSuccess

  return (
    <div className="space-y-4">
      <PaymentSummaryList next={next} />

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
          Pagar depois
        </Button>
        <Button
          type="button"
          onClick={() => createPayment.mutate({ kind: next.kind })}
          disabled={busy}
          className="bg-primary-600 hover:bg-primary-700 text-white"
        >
          {busy ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CreditCard className="mr-2 h-4 w-4" />
          )}
          {payButtonLabel(next)}
        </Button>
      </DialogFooter>
    </div>
  )
}

function RejectDialog({
  token,
  open,
  onClose,
}: {
  token: string
  open: boolean
  onClose: () => void
}) {
  const reject = useRejectPublicBudget(token)
  const form = useForm<PublicRejectFormData>({
    resolver: zodResolver(publicRejectSchema),
    defaultValues: { name: '', reason: '' },
  })

  useEffect(() => {
    if (open) {
      form.reset({ name: '', reason: '' })
      reject.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const onSubmit = (data: PublicRejectFormData) => {
    if (reject.isPending) return
    const reason = data.reason?.trim()
    reject.mutate(
      { name: data.name, reason: reason ? reason : undefined },
      { onSuccess: () => onClose() }
    )
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            Recusar orçamento
          </DialogTitle>
          <DialogDescription>
            Confirme seu nome e, se quiser, informe o motivo da recusa.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="reject-name">Seu nome</Label>
            <Input id="reject-name" autoFocus {...form.register('name')} />
            {form.formState.errors.name && (
              <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reject-reason">Motivo (opcional)</Label>
            <Textarea
              id="reject-reason"
              rows={3}
              maxLength={1000}
              placeholder="Ex: Prazo muito longo, valor acima do esperado..."
              {...form.register('reason')}
            />
            {form.formState.errors.reason && (
              <p className="text-sm text-red-600">{form.formState.errors.reason.message}</p>
            )}
          </div>

          {reject.isError && (
            <p className="text-sm text-red-600">
              {getPublicBudgetErrorMessage(reject.error, 'Erro ao recusar o orçamento')}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={reject.isPending}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={reject.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {reject.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar recusa
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
