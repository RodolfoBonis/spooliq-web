'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { useShareBudget, useRevokeBudgetShare } from '@/lib/hooks/use-budgets'
import { normalizeWhatsappNumber, buildWhatsappLink } from '@/lib/utils/whatsapp'
import type { BudgetWithDetails } from '@/types/models'
import { Copy, Loader2, MessageCircle, Link2Off, RefreshCw } from 'lucide-react'

interface ShareBudgetDialogProps {
  budget: BudgetWithDetails
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShareBudgetDialog({ budget, open, onOpenChange }: ShareBudgetDialogProps) {
  const share = useShareBudget()
  const revoke = useRevokeBudgetShare()
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false)

  // The token comes from the budget itself (already shared) or from the share response
  // we just received. Sharing is idempotent, so re-opening a shared budget reuses it.
  const token = budget.public_token ?? share.data?.public_token ?? null
  const publicUrl =
    token && typeof window !== 'undefined' ? `${window.location.origin}/orcamento/${token}` : ''

  // Ensure a link exists when the dialog opens. Idempotent on the API; guarded here so
  // we only fire once per open while there is no token yet.
  useEffect(() => {
    if (!open) return
    if (budget.public_token || share.data || share.isPending || share.isError) return
    share.mutate(budget.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, budget.public_token, budget.id])

  const quoteLabel = budget.quote_number ? String(budget.quote_number).padStart(4, '0') : null
  const whatsappNumber = normalizeWhatsappNumber(budget.customer?.phone)
  const whatsappText = quoteLabel
    ? `Olá ${budget.customer?.name ?? ''}, segue o orçamento nº ${quoteLabel}: ${publicUrl}`.trim()
    : `Olá ${budget.customer?.name ?? ''}, segue o orçamento: ${publicUrl}`.trim()
  const whatsappHref = buildWhatsappLink(whatsappNumber, whatsappText)

  const handleCopy = async () => {
    if (!publicUrl) return
    try {
      await navigator.clipboard.writeText(publicUrl)
      toast.success('Link copiado para a área de transferência!')
    } catch {
      toast.error('Não foi possível copiar o link.')
    }
  }

  const handleRevoke = () => {
    revoke.mutate(budget.id, {
      onSuccess: () => {
        setShowRevokeConfirm(false)
        onOpenChange(false)
      },
    })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Compartilhar orçamento</DialogTitle>
            <DialogDescription>
              Envie este link ao cliente para que ele veja e responda ao orçamento.
            </DialogDescription>
          </DialogHeader>

          {share.isPending && !token && (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-neutral-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Gerando link...
            </div>
          )}

          {share.isError && !token && (
            <div className="space-y-3 py-4">
              <p className="text-sm text-red-600">
                Não foi possível gerar o link de compartilhamento.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => share.mutate(budget.id)}
                disabled={share.isPending}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Tentar novamente
              </Button>
            </div>
          )}

          {token && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="public-url">Link público</Label>
                <div className="flex items-center gap-2">
                  <Input id="public-url" readOnly value={publicUrl} className="font-mono text-xs" />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                    aria-label="Copiar link"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button asChild className="w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white">
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Enviar no WhatsApp
                </a>
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => setShowRevokeConfirm(true)}
                disabled={revoke.isPending}
              >
                <Link2Off className="mr-2 h-4 w-4" />
                Revogar link
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showRevokeConfirm}
        onOpenChange={setShowRevokeConfirm}
        title="Revogar link"
        description="O link público deixará de funcionar e o cliente não poderá mais acessar o orçamento. Deseja continuar?"
        onConfirm={handleRevoke}
        confirmText="Revogar"
        variant="destructive"
      />
    </>
  )
}
