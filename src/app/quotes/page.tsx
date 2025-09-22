'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Filter, FileText, Eye, Edit, Trash2, Copy, Download } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { Button, Card, Input, Badge } from '@/components/ui'
import { QuoteService } from '@/services/quote.service'
import { Quote, QuoteFilters } from '@/types/api'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function QuotesPage() {
  const [filters, setFilters] = useState<QuoteFilters>({})
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['quotes', filters, page],
    queryFn: () => QuoteService.getQuotes(filters, page, 12),
  })

  const deleteMutation = useMutation({
    mutationFn: QuoteService.deleteQuote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
      toast.success('Orçamento excluído com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao excluir orçamento')
    },
  })

  const duplicateMutation = useMutation({
    mutationFn: QuoteService.duplicateQuote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
      toast.success('Orçamento duplicado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao duplicar orçamento')
    },
  })

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este orçamento?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleDuplicate = (id: string) => {
    duplicateMutation.mutate(id)
  }

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search }))
    setPage(1)
  }

  const getStatusBadge = (quote: Quote) => {
    // Simple status logic based on creation date
    const daysSinceCreated = Math.floor(
      (new Date().getTime() - new Date(quote.created_at).getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysSinceCreated < 1) {
      return <Badge variant="success">Novo</Badge>
    } else if (daysSinceCreated < 7) {
      return <Badge variant="warning">Recente</Badge>
    } else {
      return <Badge variant="secondary">Arquivado</Badge>
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Erro ao carregar orçamentos
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Tente novamente mais tarde
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Orçamentos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie seus orçamentos de impressão 3D
          </p>
        </div>
        <Link href="/quotes/new">
          <Button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Orçamento
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar orçamentos..."
                  className="pl-10"
                  value={filters.search || ''}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-1/3"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-3/4"></div>
                <div className="flex gap-2">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : !data?.data || data.data.length === 0 ? (
        <Card>
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nenhum orçamento encontrado
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Comece criando seu primeiro orçamento
            </p>
            <Link href="/quotes/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Criar Orçamento
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {data?.data?.map((quote) => (
              <Card key={quote.id} variant="elevated" hover>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {quote.title}
                        </h3>
                        {getStatusBadge(quote)}
                      </div>
                      {quote.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {quote.notes}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Criado em {formatDate(quote.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Filamentos</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {quote.filament_lines.length} item(s)
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Máquina</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {quote.machine_profile.brand} {quote.machine_profile.model}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Potência</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {quote.machine_profile.watt}W
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/quotes/${quote.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Visualizar
                        </Button>
                      </Link>
                      <Link href={`/quotes/${quote.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDuplicate(quote.id)}
                        disabled={duplicateMutation.isPending}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => handleDelete(quote.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {data && data.last_page > 1 && (
            <div className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                Página {page} de {data.last_page}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={page === data.last_page}
              >
                Próxima
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}