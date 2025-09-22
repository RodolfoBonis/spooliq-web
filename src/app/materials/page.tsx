'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Edit, Trash2, Layers, Filter, X, Code } from 'lucide-react'
import { useMaterials, useDeleteMaterial } from '@/hooks/useMaterials'
import { useAuthStore } from '@/stores/auth-store'
import { Button, Card, Input, Badge, AnimatedContainer, StaggerContainer, StaggerItem } from '@/components/ui'
import { MaterialFilters } from '@/types/api'
import { formatDate } from '@/lib/utils'
import { MaterialService } from '@/services/material.service'

export default function MaterialsPage() {
  const [filters, setFilters] = useState<MaterialFilters>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [showInactive, setShowInactive] = useState(false)

  const { user } = useAuthStore()
  const isAdmin = user?.role === 'admin'

  const { data: materials, isLoading, error } = useMaterials({
    ...filters,
    active_only: !showInactive,
    search: searchTerm || undefined
  })

  const deleteMaterial = useDeleteMaterial()

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Tem certeza que deseja excluir o material "${name}"?`)) {
      deleteMaterial.mutate(id)
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setShowInactive(false)
  }

  const hasActiveFilters = searchTerm || showInactive

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card variant="elevated" className="max-w-md mx-auto text-center">
          <div className="p-8">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Layers className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Erro ao carregar materiais
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Não foi possível conectar com o servidor. Verifique sua conexão e tente novamente.
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <AnimatedContainer animation="fadeIn" className="space-y-8">
      {/* Header Section */}
      <AnimatedContainer animation="slideUp" delay={0.1} className="relative">
        <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-500/10 dark:to-purple-500/5 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-green-100 to-green-50 dark:from-green-500/10 dark:to-green-500/5 rounded-full blur-2xl"></div>

        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Materiais
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    {hasActiveFilters
                      ? `${materials?.length || 0} de ${materials?.length || 0} materiais`
                      : `${materials?.length || 0} materiais cadastrados`
                    }
                  </span>
                  {hasActiveFilters && materials && materials.length > 0 && (
                    <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full">
                      Filtrado
                    </span>
                  )}
                </div>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Gerencie os tipos de materiais de filamentos disponíveis
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 min-w-0">
            {isAdmin && (
              <Link href="/materials/new">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 group"
                >
                  <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-200" />
                  Novo Material
                </Button>
              </Link>
            )}
          </div>
        </div>
      </AnimatedContainer>

      {/* Search and Filters */}
      <Card variant="elevated">
        <div className="p-6">
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Pesquisar materiais por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Filter Row */}
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Mostrar materiais inativos
                </span>
              </label>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20 rounded-lg transition-colors"
                >
                  <X className="w-3 h-3" />
                  Limpar filtros
                </button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Results */}
      {isLoading ? (
        <AnimatedContainer animation="fadeIn" delay={0.3}>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <StaggerItem key={i} animation="slideUp">
                <Card variant="elevated" className="h-full flex flex-col overflow-hidden animate-pulse">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-2"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                      </div>
                      <div className="w-12 h-6 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                    </div>
                    <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded mb-4"></div>
                    <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded mb-4"></div>
                    <div className="flex gap-2">
                      <div className="flex-1 h-10 bg-slate-100 dark:bg-slate-800 rounded"></div>
                      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded"></div>
                    </div>
                  </div>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </AnimatedContainer>
      ) : !materials || materials.length === 0 ? (
        <AnimatedContainer animation="scale" delay={0.3}>
          <Card variant="elevated" className="text-center border border-slate-200 dark:border-slate-700">
            <div className="p-16">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl flex items-center justify-center mx-auto">
                  <Layers className="w-12 h-12 text-slate-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                {hasActiveFilters ? 'Nenhum material encontrado' : 'Nenhum material cadastrado'}
              </h3>

              <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-lg mx-auto text-lg">
                {hasActiveFilters
                  ? `Não encontramos materiais que correspondam aos filtros aplicados.`
                  : 'Comece adicionando o primeiro material ao sistema para organizar os tipos de filamentos.'
                }
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {hasActiveFilters ? (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={clearFilters}
                    className="group"
                  >
                    <Search className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Limpar Filtros
                  </Button>
                ) : isAdmin ? (
                  <Link href="/materials/new">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl group"
                    >
                      <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-200" />
                      Adicionar Primeiro Material
                    </Button>
                  </Link>
                ) : null}
              </div>
            </div>
          </Card>
        </AnimatedContainer>
      ) : (
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((material, index) => (
            <StaggerItem key={material.id} animation="slideUp" className="h-full">
              <Card
                variant="elevated"
                className="h-full flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-900/10 dark:hover:shadow-slate-900/50"
              >
                <div className="p-6 flex-1">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate">
                        {material.name}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Criado em {formatDate(material.created_at)}
                      </p>
                    </div>
                    <Badge
                      variant={material.active ? 'success' : 'error'}
                      className="ml-2 shrink-0"
                    >
                      {material.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>

                  {/* Description */}
                  {material.description && (
                    <div className="mb-4">
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                        {material.description}
                      </p>
                    </div>
                  )}

                  {/* Properties */}
                  {material.properties && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Code className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Propriedades
                        </span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                        <pre className="text-xs text-slate-600 dark:text-slate-400 font-mono overflow-x-auto">
                          {JSON.stringify(MaterialService.formatProperties(material.properties), null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-auto">
                    {isAdmin && (
                      <Link href={`/materials/${material.id}/edit`} className="flex-1">
                        <button className="w-full h-10 flex items-center justify-center gap-2 border-2 border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-800 dark:hover:text-purple-200 bg-white dark:bg-slate-800 rounded-lg transition-all duration-200">
                          <Edit className="w-4 h-4" />
                          <span className="text-sm font-medium">Editar</span>
                        </button>
                      </Link>
                    )}

                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(material.id, material.name)}
                        disabled={deleteMaterial.isPending}
                        className="w-10 h-10 flex items-center justify-center border-2 border-red-300 dark:border-red-600 hover:border-red-400 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 bg-white dark:bg-slate-800 rounded-lg transition-all duration-200 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4 text-red-600 hover:text-red-700" />
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}
    </AnimatedContainer>
  )
}