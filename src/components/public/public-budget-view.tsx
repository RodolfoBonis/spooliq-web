'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatusBadge } from '@/components/budgets/status-badge'
import { PublicResponseDialogs, type ResponseMode } from '@/components/public/public-response-dialogs'
import { useDownloadPublicPDF } from '@/lib/hooks/use-public-budget'
import { formatCurrency, formatDateShort, formatQuoteNumberPadded } from '@/lib/utils/format'
import {
  buildWhatsappLink,
  buildInstagramLink,
  buildWebsiteLink,
  normalizeWhatsappNumber,
  sanitizeHttpUrl,
} from '@/lib/utils/whatsapp'
import type { PublicBudget } from '@/types/models'
import {
  Building2,
  CalendarClock,
  CheckCircle,
  Download,
  Globe,
  Instagram,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  XCircle,
  Ban,
  Clock,
} from 'lucide-react'

interface PublicBudgetViewProps {
  budget: PublicBudget
  token: string
}

export function PublicBudgetView({ budget, token }: PublicBudgetViewProps) {
  const [responseMode, setResponseMode] = useState<ResponseMode>(null)
  const download = useDownloadPublicPDF(token, budget.quote_number ?? undefined)

  const hasResponse = !!budget.customer_response_at
  const isRejected = budget.status === 'rejected' || !!budget.rejection_reason

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      {/* Company header */}
      <CompanyHeader company={budget.company} />

      {/* Quote title + status */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Orçamento{budget.quote_number != null ? ` nº ${formatQuoteNumberPadded(budget.quote_number)}` : ''}
          </h1>
          {budget.name && <p className="text-neutral-600">{budget.name}</p>}
        </div>
        <StatusBadge status={budget.status} />
      </div>

      {/* Status banner */}
      <StatusBanner budget={budget} hasResponse={hasResponse} isRejected={isRejected} />

      {budget.description && (
        <p className="mt-4 text-sm text-neutral-600">{budget.description}</p>
      )}

      {/* Items */}
      <Card className="mt-6">
        <CardContent className="p-0">
          <ItemsTable items={budget.items} />
        </CardContent>
      </Card>

      {/* Totals */}
      <Card className="mt-4">
        <CardContent className="space-y-2 py-5">
          <TotalsBlock budget={budget} />
        </CardContent>
      </Card>

      {/* Commercial info */}
      {(budget.delivery_days || budget.payment_terms || budget.notes || budget.valid_until) && (
        <Card className="mt-4">
          <CardContent className="space-y-4 py-5 text-sm">
            {budget.delivery_days != null && (
              <InfoRow label="Prazo de entrega">
                {budget.delivery_days} {budget.delivery_days === 1 ? 'dia' : 'dias'}
              </InfoRow>
            )}
            {budget.payment_terms && (
              <InfoRow label="Condições de pagamento">{budget.payment_terms}</InfoRow>
            )}
            {budget.notes && <InfoRow label="Observações">{budget.notes}</InfoRow>}
            {budget.valid_until && (
              <InfoRow label="Válido até">
                <span className="flex items-center gap-1">
                  <CalendarClock className="h-4 w-4 text-neutral-400" />
                  {formatDateShort(budget.valid_until)}
                </span>
              </InfoRow>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="outline"
          onClick={() => download.mutate()}
          disabled={download.isPending}
          className="w-full sm:w-auto"
        >
          {download.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Baixar PDF
        </Button>

        {budget.can_respond && (
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setResponseMode('reject')}
              className="w-full border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 sm:w-auto"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Recusar
            </Button>
            <Button
              onClick={() => setResponseMode('approve')}
              className="w-full bg-emerald-600 text-white hover:bg-emerald-700 sm:w-auto"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Aprovar orçamento
            </Button>
          </div>
        )}
      </div>

      <p className="mt-8 text-center text-xs text-neutral-400">
        Orçamento gerado em {formatDateShort(budget.created_at)} · Powered by SpoolIQ
      </p>

      <PublicResponseDialogs token={token} mode={responseMode} onClose={() => setResponseMode(null)} />
    </div>
  )
}

function CompanyHeader({ company }: { company: PublicBudget['company'] }) {
  const whatsapp = normalizeWhatsappNumber(company.whatsapp)
  const instagram = buildInstagramLink(company.instagram)
  const website = buildWebsiteLink(company.website)
  const logoUrl = sanitizeHttpUrl(company.logo_url)
  const location = [company.city, company.state].filter(Boolean).join(' / ')

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-6 text-center sm:flex-row sm:items-center sm:text-left">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-white">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={company.trade_name || company.name}
              className="h-full w-full object-contain"
            />
          ) : (
            <Building2 className="h-10 w-10 text-neutral-300" />
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-neutral-900">
            {company.trade_name || company.name}
          </h2>
          {location && <p className="text-sm text-neutral-500">{location}</p>}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm sm:justify-start">
            {whatsapp && (
              <a
                href={buildWhatsappLink(whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-emerald-700 hover:underline"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            )}
            {instagram && (
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-pink-600 hover:underline"
              >
                <Instagram className="h-4 w-4" />
                Instagram
              </a>
            )}
            {website && (
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary-600 hover:underline"
              >
                <Globe className="h-4 w-4" />
                Site
              </a>
            )}
            {company.email && (
              <a
                href={`mailto:${company.email}`}
                className="flex items-center gap-1 text-neutral-600 hover:underline"
              >
                <Mail className="h-4 w-4" />
                {company.email}
              </a>
            )}
            {company.phone && (
              <span className="flex items-center gap-1 text-neutral-600">
                <Phone className="h-4 w-4" />
                {company.phone}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function StatusBanner({
  budget,
  hasResponse,
  isRejected,
}: {
  budget: PublicBudget
  hasResponse: boolean
  isRejected: boolean
}) {
  if (budget.status === 'cancelled') {
    return (
      <Banner tone="muted" icon={<Ban className="h-5 w-5" />}>
        <p className="font-semibold">Este orçamento foi cancelado.</p>
      </Banner>
    )
  }

  if (budget.is_expired || budget.status === 'expired') {
    return (
      <Banner tone="amber" icon={<Clock className="h-5 w-5" />}>
        <p className="font-semibold">
          Este orçamento expirou{budget.valid_until ? ` em ${formatDateShort(budget.valid_until)}` : ''} e
          não pode mais ser respondido.
        </p>
        <p className="mt-1 text-sm">Entre em contato com a empresa para gerar um novo orçamento.</p>
      </Banner>
    )
  }

  if (hasResponse) {
    const who = budget.customer_response_name
    const when = formatDateShort(budget.customer_response_at)
    if (isRejected) {
      return (
        <Banner tone="red" icon={<XCircle className="h-5 w-5" />}>
          <p className="font-semibold">Orçamento recusado{who ? ` por ${who}` : ''} em {when}</p>
          {budget.rejection_reason && (
            <p className="mt-1 text-sm">Motivo: {budget.rejection_reason}</p>
          )}
        </Banner>
      )
    }
    return (
      <Banner tone="green" icon={<CheckCircle className="h-5 w-5" />}>
        <p className="font-semibold">Orçamento aprovado{who ? ` por ${who}` : ''} em {when}</p>
      </Banner>
    )
  }

  if (budget.can_respond) {
    return (
      <Banner tone="blue" icon={<Clock className="h-5 w-5" />}>
        <p className="font-semibold">Aguardando sua resposta</p>
        <p className="mt-1 text-sm">
          Revise os itens e valores abaixo e aprove ou recuse o orçamento.
        </p>
      </Banner>
    )
  }

  return null
}

const BANNER_TONES = {
  green: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  red: 'bg-red-50 border-red-200 text-red-800',
  amber: 'bg-amber-50 border-amber-200 text-amber-800',
  blue: 'bg-blue-50 border-blue-200 text-blue-800',
  muted: 'bg-neutral-100 border-neutral-200 text-neutral-700',
} as const

function Banner({
  tone,
  icon,
  children,
}: {
  tone: keyof typeof BANNER_TONES
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className={`mt-4 flex items-start gap-3 rounded-lg border p-4 ${BANNER_TONES[tone]}`}>
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div>{children}</div>
    </div>
  )
}

function ItemsTable({ items }: { items: PublicBudget['items'] }) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead className="text-center">Qtd.</TableHead>
              <TableHead className="text-right">Preço unit.</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={`${item.product_name}-${index}`}>
                <TableCell>
                  <p className="font-medium text-neutral-900">{item.product_name}</p>
                  {item.product_description && (
                    <p className="text-xs text-neutral-500">{item.product_description}</p>
                  )}
                  {item.product_dimensions && (
                    <p className="text-xs text-neutral-400">{item.product_dimensions}</p>
                  )}
                </TableCell>
                <TableCell className="text-center">{item.product_quantity}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(item.total_price)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="divide-y sm:hidden">
        {items.map((item, index) => (
          <div key={`${item.product_name}-${index}`} className="p-4">
            <p className="font-medium text-neutral-900">{item.product_name}</p>
            {item.product_description && (
              <p className="mt-0.5 text-xs text-neutral-500">{item.product_description}</p>
            )}
            {item.product_dimensions && (
              <p className="text-xs text-neutral-400">{item.product_dimensions}</p>
            )}
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-neutral-500">
                {item.product_quantity} × {formatCurrency(item.unit_price)}
              </span>
              <span className="font-semibold text-neutral-900">
                {formatCurrency(item.total_price)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function TotalsBlock({ budget }: { budget: PublicBudget }) {
  return (
    <>
      {budget.base_price > 0 && (
        <Row label="Subtotal" value={formatCurrency(budget.base_price)} />
      )}
      {budget.discount_amount > 0 && (
        <Row
          label="Desconto"
          value={`− ${formatCurrency(budget.discount_amount)}`}
          valueClassName="text-red-600"
        />
      )}
      {budget.shipping_cost > 0 && (
        <Row label="Frete" value={formatCurrency(budget.shipping_cost)} />
      )}
      {budget.tax_amount > 0 && (
        <Row
          label={
            budget.tax_rate_applied > 0
              ? `Impostos (${budget.tax_rate_applied}%)`
              : 'Impostos'
          }
          value={formatCurrency(budget.tax_amount)}
        />
      )}
      <Separator className="my-1" />
      <div className="flex items-center justify-between">
        <span className="text-base font-semibold text-neutral-900">Total</span>
        <span className="text-2xl font-bold text-primary-600">{formatCurrency(budget.total)}</span>
      </div>
    </>
  )
}

function Row({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: string
  valueClassName?: string
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-neutral-600">{label}</span>
      <span className={`font-medium ${valueClassName ?? 'text-neutral-900'}`}>{value}</span>
    </div>
  )
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-neutral-500">{label}</p>
      <div className="font-medium text-neutral-900">{children}</div>
    </div>
  )
}
