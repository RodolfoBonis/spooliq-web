'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { usePublicBudget, useConfirmPublicPayment } from '@/lib/hooks/use-public-budget'
import { CheckCircle, Clock, Loader2 } from 'lucide-react'

const POLL_INTERVAL_MS = 3000
const POLL_TIMEOUT_MS = 30000

type Phase = 'confirming' | 'paid' | 'processing' | 'timeout'

interface ReturnParams {
  order_nsu: string
  transaction_nsu: string
  slug: string
  receipt_url?: string
}

/**
 * Handles the `?pagamento=retorno&order_nsu=…&transaction_nsu=…&slug=…&receipt_url=…`
 * return from the InfinitePay checkout.
 *
 * It confirms the payment exactly once, then shows "Pagamento confirmado" or, while the
 * confirmation is still settling, "Processando…" — refetching the budget every 3s for up
 * to 30s before falling back to a friendly message. The URL is cleaned on mount so a
 * refresh doesn't re-trigger the flow; the params are captured once up front so the clean
 * doesn't tear the flow down.
 */
export function PublicPaymentReturn({ token }: { token: string }) {
  const search = useSearchParams()

  const [isReturn] = useState(() => search.get('pagamento') === 'retorno')
  const [params] = useState<ReturnParams | null>(() => {
    if (search.get('pagamento') !== 'retorno') return null
    const order_nsu = search.get('order_nsu')
    const transaction_nsu = search.get('transaction_nsu')
    const slug = search.get('slug')
    if (!order_nsu || !transaction_nsu || !slug) return null
    return { order_nsu, transaction_nsu, slug, receipt_url: search.get('receipt_url') || undefined }
  })
  const [open, setOpen] = useState(isReturn)

  if (!isReturn || !open) return null
  return <PaymentReturnDialog token={token} params={params} onClose={() => setOpen(false)} />
}

function PaymentReturnDialog({
  token,
  params,
  onClose,
}: {
  token: string
  params: ReturnParams | null
  onClose: () => void
}) {
  const router = useRouter()
  const confirm = useConfirmPublicPayment(token)
  const { refetch } = usePublicBudget(token)
  const [phase, setPhase] = useState<Phase>('confirming')
  const started = useRef(false)

  // Remove the payment query string so a refresh won't re-run the confirmation.
  useEffect(() => {
    router.replace(`/orcamento/${encodeURIComponent(token)}`, { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Confirm exactly once.
  useEffect(() => {
    if (started.current) return
    started.current = true
    if (!params) {
      setPhase('timeout')
      return
    }
    confirm.mutate(params, {
      onSuccess: (data) => setPhase(data.confirmation === 'paid' ? 'paid' : 'processing'),
      onError: () => setPhase('processing'),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // While processing, poll the budget until it flips to paid or we hit the timeout.
  useEffect(() => {
    if (phase !== 'processing') return
    const start = Date.now()
    const id = setInterval(() => {
      void refetch().then((res) => {
        if (res.data?.payment?.status === 'paid') {
          setPhase('paid')
        } else if (Date.now() - start >= POLL_TIMEOUT_MS) {
          setPhase('timeout')
        }
      })
    }, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [phase, refetch])

  const content = RETURN_CONTENT[phase]

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <content.icon
              className={`h-5 w-5 ${content.spin ? 'animate-spin text-primary-600' : content.iconClass}`}
            />
            {content.title}
          </DialogTitle>
          <DialogDescription>{content.description}</DialogDescription>
        </DialogHeader>

        {phase !== 'confirming' && (
          <DialogFooter>
            <Button type="button" onClick={onClose} className="w-full sm:w-auto">
              Fechar
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

const RETURN_CONTENT = {
  confirming: {
    icon: Loader2,
    spin: true,
    iconClass: '',
    title: 'Confirmando seu pagamento…',
    description: 'Aguarde um instante enquanto confirmamos a transação.',
  },
  paid: {
    icon: CheckCircle,
    spin: false,
    iconClass: 'text-emerald-600',
    title: 'Pagamento confirmado',
    description: 'Recebemos seu pagamento. Obrigado! O status do orçamento já foi atualizado.',
  },
  processing: {
    icon: Loader2,
    spin: true,
    iconClass: '',
    title: 'Processando…',
    description: 'Seu pagamento está sendo processado. Isso pode levar alguns instantes.',
  },
  timeout: {
    icon: Clock,
    spin: false,
    iconClass: 'text-amber-500',
    title: 'Estamos processando seu pagamento',
    description:
      'Assim que a confirmação chegar, o status deste orçamento será atualizado automaticamente. Você pode fechar esta janela com segurança.',
  },
} as const satisfies Record<
  Phase,
  { icon: typeof Loader2; spin: boolean; iconClass: string; title: string; description: string }
>
