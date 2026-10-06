'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Mail, Phone, MoreVertical, Edit, Trash2, AlertTriangle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { ConfirmationDialog } from '@/components/common/confirmation-dialog'

import { useCustomers, useDeleteCustomer } from '@/lib/hooks/use-customers'
import { TableSkeleton } from '@/components/common/loading-skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { PaginationControls } from '@/components/common/pagination-controls'
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value'
import { formatCurrency, getInitials } from '@/lib/utils/format'

export default function CustomersPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebouncedValue(search, 300)

  const { data, isLoading } = useCustomers({ search: debouncedSearch, page, pageSize: 12 })
  const { mutate: deleteCustomer, isPending: isDeleting } = useDeleteCustomer()
  const [customerToDelete, setCustomerToDelete] = useState<{ id: string; name: string } | null>(null)

  const handleDelete = () => {
    if (!customerToDelete) return
    deleteCustomer(customerToDelete.id)
    setCustomerToDelete(null)
  }

  const customers = data?.data || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Clientes</h1>
          <p className="text-neutral-600 mt-2">
            Gerencie seus clientes e histórico de orçamentos
          </p>
        </div>
        <Button asChild className="bg-primary-500 hover:bg-primary-600 text-white">
          <Link href="/customers/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Link>
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Loading State or Table */}
      {isLoading ? (
        <TableSkeleton rows={8} columns={6} />
      ) : customers.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="Nenhum cliente encontrado"
          description="Comece adicionando seu primeiro cliente para começar a criar orçamentos"
          action={
            <Button
              onClick={() => (window.location.href = '/customers/new')}
              className="bg-primary-500 hover:bg-primary-600 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          }
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Orçamentos</TableHead>
                <TableHead>Total Gasto</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary-100 text-primary-700">
                          {getInitials(customer.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Link
                          href={`/customers/${customer.id}`}
                          className="font-medium text-neutral-900 hover:text-primary-600"
                        >
                          {customer.name}
                        </Link>
                        {customer.document && (
                          <p className="text-xs text-neutral-500">
                            {customer.document}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-neutral-600">
                      <Mail className="mr-2 h-4 w-4 text-neutral-400" />
                      {customer.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    {customer.phone && (
                      <div className="flex items-center text-sm text-neutral-600">
                        <Phone className="mr-2 h-4 w-4 text-neutral-400" />
                        {customer.phone}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-neutral-900">
                      {customer.budgets_count || 0}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium text-neutral-900">
                      {formatCurrency(customer.total_spent || 0)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/customers/${customer.id}`}>
                            Ver Detalhes
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/customers/${customer.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setCustomerToDelete({ id: customer.id, name: customer.name })}
                          className="text-error"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Deletar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {!isLoading && customers.length > 0 && (
        <PaginationControls
          page={page}
          totalPages={data?.totalPages ?? 1}
          onPageChange={setPage}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={!!customerToDelete}
        onOpenChange={(open) => !open && setCustomerToDelete(null)}
        onConfirm={handleDelete}
        title="Deletar Cliente"
        description={`Tem certeza que deseja deletar o cliente "${customerToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Sim, deletar"
        cancelText="Cancelar"
        variant="danger"
        icon={AlertTriangle}
        isLoading={isDeleting}
      />
    </div>
  )
}

