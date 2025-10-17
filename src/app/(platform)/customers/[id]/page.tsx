'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2, Mail, Phone, MapPin, FileText, DollarSign, AlertTriangle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ConfirmationDialog } from '@/components/common/confirmation-dialog'

import { useCustomer, useDeleteCustomer } from '@/lib/hooks/use-customers'
import { LoadingSkeleton } from '@/components/common/loading-skeleton'
import { formatCurrency, getInitials } from '@/lib/utils/format'
import { useRouter } from 'next/navigation'

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: customer, isLoading } = useCustomer(params.id)
  const { mutate: deleteCustomer, isPending: isDeleting } = useDeleteCustomer()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDelete = () => {
    if (!customer) return
    
    deleteCustomer(customer.id, {
      onSuccess: () => {
        router.push('/customers')
      },
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton count={3} />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            Cliente não encontrado
          </h2>
          <p className="text-neutral-600 mb-4">
            O cliente que você está procurando não existe ou foi removido.
          </p>
          <Button asChild>
            <Link href="/customers">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Clientes
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/customers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">
              Detalhes do Cliente
            </h1>
            <p className="text-neutral-600 mt-1">
              Informações completas e histórico de orçamentos
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/customers/${customer.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowDeleteDialog(true)} 
            className="text-error hover:bg-error/10"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Deletar
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title="Deletar Cliente"
        description={`Tem certeza que deseja deletar o cliente "${customer?.name}"? Esta ação não pode ser desfeita e todos os orçamentos associados serão mantidos, mas sem vínculo com este cliente.`}
        confirmText="Sim, deletar"
        cancelText="Cancelar"
        variant="danger"
        icon={AlertTriangle}
        isLoading={isDeleting}
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Customer Info Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar and Name */}
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarFallback className="bg-primary-100 text-primary-700 text-2xl">
                  {getInitials(customer.name)}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold text-neutral-900">
                {customer.name}
              </h2>
              {customer.document && (
                <p className="text-sm text-neutral-500 mt-1">
                  {customer.document}
                </p>
              )}
            </div>

            <Separator />

            {/* Contact Info */}
            <div className="space-y-3">
              {customer.email && (
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-neutral-400 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-700">Email</p>
                    <p className="text-sm text-neutral-600 truncate">{customer.email}</p>
                  </div>
                </div>
              )}

              {customer.phone && (
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-neutral-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-700">Telefone / WhatsApp</p>
                    <p className="text-sm text-neutral-600">{customer.phone}</p>
                  </div>
                </div>
              )}

              {(customer.address || customer.city || customer.state) && (
                <>
                  <Separator />
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-neutral-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-700 mb-1">Endereço</p>
                      {customer.address && (
                        <p className="text-sm text-neutral-600">{customer.address}</p>
                      )}
                      {(customer.city || customer.state) && (
                        <p className="text-sm text-neutral-600">
                          {[customer.city, customer.state].filter(Boolean).join(', ')}
                        </p>
                      )}
                      {customer.zip_code && (
                        <p className="text-sm text-neutral-600">CEP: {customer.zip_code}</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {customer.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-neutral-700 mb-2">Observações</p>
                  <p className="text-sm text-neutral-600 whitespace-pre-wrap">
                    {customer.notes}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Stats and Activity */}
        <div className="md:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                    <FileText className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-600">
                      Orçamentos
                    </p>
                    <p className="text-2xl font-bold text-neutral-900">
                      {customer.budgets_count || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                    <DollarSign className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-600">
                      Total Gasto
                    </p>
                    <p className="text-2xl font-bold text-neutral-900">
                      {formatCurrency(customer.total_spent || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Budgets List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Orçamentos</CardTitle>
                <Button size="sm" asChild>
                  <Link href={`/budgets/new?customer=${customer.id}`}>
                    Novo Orçamento
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <p className="text-sm text-neutral-600 mb-4">
                  Nenhum orçamento encontrado para este cliente
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/budgets/new?customer=${customer.id}`}>
                    Criar Primeiro Orçamento
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

