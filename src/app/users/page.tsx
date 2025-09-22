'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Users, Crown, Shield, UserPlus, Search, Filter, Eye, Edit, Trash2, ToggleLeft, ToggleRight, Key, X } from 'lucide-react'
import { Card, Button, Badge, AnimatedContainer, StaggerContainer, StaggerItem } from '@/components/ui'
import { useUsers, useDeleteUser, useToggleUserStatus, useUserStats } from '@/hooks/useUsers'
import { useAuthStore } from '@/stores/auth-store'
import { UserFilters } from '@/services/user.service'
import { formatDate } from '@/lib/utils'

export default function UsersPage() {
  const [filters, setFilters] = useState<UserFilters>({})
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'suspended' | ''>('')

  const { user: currentUser } = useAuthStore()
  const isAdmin = currentUser?.role === 'admin'

  const { data: usersData, isLoading, error } = useUsers({
    ...filters,
    search: searchTerm || undefined,
    role: roleFilter || undefined,
    status: statusFilter || undefined
  }, page, 12)

  const { data: stats } = useUserStats()
  const deleteUser = useDeleteUser()
  const toggleStatus = useToggleUserStatus()

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir o usuário "${name}"?`)) {
      deleteUser.mutate(id)
    }
  }

  const handleToggleStatus = (id: string) => {
    toggleStatus.mutate(id)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setRoleFilter('')
    setStatusFilter('')
  }

  const hasActiveFilters = searchTerm || roleFilter || statusFilter

  const users = usersData?.data || []

  const getRoleBadge = (role?: string) => {
    const userRole = role || (users.find(u => u.id === currentUser?.id)?.roles?.[0])
    switch (userRole) {
      case 'admin':
        return (
          <Badge variant="success" className="gap-1">
            <Crown className="w-3 h-3" />
            Admin
          </Badge>
        )
      case 'user':
        return (
          <Badge variant="secondary" className="gap-1">
            <Shield className="w-3 h-3" />
            Usuário
          </Badge>
        )
      default:
        return <Badge variant="secondary">{userRole || 'Usuário'}</Badge>
    }
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Ativo</Badge>
      case 'inactive':
        return <Badge variant="secondary">Inativo</Badge>
      case 'suspended':
        return <Badge variant="error">Suspenso</Badge>
      default:
        return <Badge variant="success">Ativo</Badge>
    }
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card variant="elevated" className="max-w-md mx-auto text-center">
          <div className="p-8">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Erro ao carregar usuários
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

  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card variant="elevated" className="max-w-md mx-auto text-center">
          <div className="p-8">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Acesso Negado
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Você precisa de permissões de administrador para acessar esta página.
            </p>
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
        <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-500/10 dark:to-blue-500/5 rounded-full blur-2xl"></div>

        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Usuários
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    {hasActiveFilters
                      ? `${users.length} de ${usersData?.total || 0} usuários`
                      : `${usersData?.total || 0} usuários cadastrados`
                    }
                  </span>
                  {hasActiveFilters && users.length > 0 && (
                    <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full">
                      Filtrado
                    </span>
                  )}
                </div>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Gerencie usuários e permissões do sistema
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 min-w-0">
            <Link href="/users/new">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 group"
              >
                <UserPlus className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-200" />
                Novo Usuário
              </Button>
            </Link>
          </div>
        </div>
      </AnimatedContainer>

      {/* Stats Cards */}
      {stats && (
        <AnimatedContainer animation="slideUp" delay={0.2}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="border-slate-200 dark:border-slate-700">
              <div className="p-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.total}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Total</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700">
              <div className="p-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.active}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Ativos</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700">
              <div className="p-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.inactive}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Inativos</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700">
              <div className="p-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                    <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.suspended}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Suspensos</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700">
              <div className="p-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                    <Crown className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.admins}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Admins</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </AnimatedContainer>
      )}

      {/* Search and Filters */}
      <Card variant="elevated">
        <div className="p-6">
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Pesquisar usuários por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Filter Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Função</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Todas as funções</option>
                  <option value="admin">Administrador</option>
                  <option value="user">Usuário</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Todos os status</option>
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                  <option value="suspended">Suspenso</option>
                </select>
              </div>

              <div className="flex items-end">
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
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                      <div className="ml-4 flex-1">
                        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                      </div>
                    </div>
                    <div className="flex gap-2 mb-4">
                      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
                      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-12"></div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded flex-1"></div>
                      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-8"></div>
                    </div>
                  </div>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </AnimatedContainer>
      ) : !users || users.length === 0 ? (
        <AnimatedContainer animation="scale" delay={0.3}>
          <Card variant="elevated" className="text-center border border-slate-200 dark:border-slate-700">
            <div className="p-16">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl flex items-center justify-center mx-auto">
                  <Users className="w-12 h-12 text-slate-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                {hasActiveFilters ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
              </h3>

              <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-lg mx-auto text-lg">
                {hasActiveFilters
                  ? `Não encontramos usuários que correspondam aos filtros aplicados.`
                  : 'Comece adicionando usuários ao sistema para gerenciar acessos e permissões.'
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
                ) : (
                  <Link href="/users/new">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl group"
                    >
                      <UserPlus className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-200" />
                      Adicionar Primeiro Usuário
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </Card>
        </AnimatedContainer>
      ) : (
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user, index) => (
            <StaggerItem key={user.id} animation="slideUp" className="h-full">
              <Card
                variant="elevated"
                className="h-full flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-900/10 dark:hover:shadow-slate-900/50"
              >
                <div className="p-6 flex-1">
                  {/* Header */}
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-semibold text-lg">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4 flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate">
                        {user.name}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {getRoleBadge(user.role || user.roles?.[0])}
                    {getStatusBadge(user.status)}
                  </div>

                  {/* Info */}
                  <div className="space-y-2 mb-6 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Cadastrado:</span>
                      <span className="text-slate-900 dark:text-slate-100 font-medium">
                        {formatDate(user.created_at)}
                      </span>
                    </div>
                    {user.last_login_at && (
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Último login:</span>
                        <span className="text-slate-900 dark:text-slate-100 font-medium">
                          {formatDate(user.last_login_at)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-auto">
                    <Link href={`/users/${user.id}`} className="flex-1">
                      <button className="w-full h-10 flex items-center justify-center gap-2 border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:border-slate-400 dark:hover:border-slate-500 rounded-lg font-medium transition-all duration-200 group">
                        <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span className="text-sm">Ver</span>
                      </button>
                    </Link>

                    <button
                      onClick={() => handleToggleStatus(user.id)}
                      disabled={toggleStatus.isPending}
                      className={`h-10 px-3 flex items-center justify-center gap-2 border-2 bg-white dark:bg-slate-800 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 group ${
                        user.status === 'active'
                          ? 'border-green-400 dark:border-green-500 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-500 dark:hover:border-green-400'
                          : 'border-amber-400 dark:border-amber-500 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-500 dark:hover:border-amber-400'
                      }`}
                      title={user.status === 'active' ? 'Desativar usuário' : 'Ativar usuário'}
                    >
                      {user.status === 'active' ? (
                        <ToggleRight className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      ) : (
                        <ToggleLeft className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      )}
                    </button>

                    {user.id !== currentUser?.id && (
                      <button
                        onClick={() => handleDelete(user.id, user.name)}
                        disabled={deleteUser.isPending}
                        className="h-10 px-3 flex items-center justify-center border-2 border-red-400 dark:border-red-500 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 hover:border-red-500 dark:hover:border-red-400 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 group"
                        title="Excluir usuário"
                      >
                        <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}

      {/* Pagination */}
      {usersData && usersData.last_page > 1 && (
        <AnimatedContainer animation="slideUp" delay={0.4}>
          <Card variant="elevated" className="overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 px-6 py-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{page}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Página {page} de {usersData.last_page}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {usersData.total || 0} usuários no total
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="group border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600"
                  >
                    <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
                    <span className="ml-2">Anterior</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setPage(page + 1)}
                    disabled={page === usersData.last_page}
                    className="group border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600"
                  >
                    <span className="mr-2">Próxima</span>
                    <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </AnimatedContainer>
      )}
    </AnimatedContainer>
  )
}