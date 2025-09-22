'use client'

import { Users, Crown, Shield, UserPlus } from 'lucide-react'
import { Card, Button, Badge } from '@/components/ui'

export default function UsersPage() {
  // Mock data for demonstration
  const users = [
    {
      id: '1',
      name: 'Rodolfo De Bonis',
      email: 'dev@rodolfodebonis.com.br',
      role: 'admin',
      status: 'active',
      lastLogin: '2025-01-19',
    },
    {
      id: '2',
      name: 'João Silva',
      email: 'joao@example.com',
      role: 'user',
      status: 'active',
      lastLogin: '2025-01-18',
    },
  ]

  const getRoleBadge = (role: string) => {
    switch (role) {
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
        return <Badge variant="secondary">{role}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Ativo</Badge>
      case 'inactive':
        return <Badge variant="secondary">Inativo</Badge>
      case 'suspended':
        return <Badge variant="danger">Suspenso</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Usuários
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie usuários e permissões do sistema
          </p>
        </div>
        <Button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700">
          <UserPlus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {users.map((user) => (
          <Card key={user.id} variant="elevated" hover>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {user.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {user.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {user.email}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Último login: {user.lastLogin}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getRoleBadge(user.role)}
                  {getStatusBadge(user.status)}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State for No Users */}
      {users.length === 0 && (
        <Card>
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nenhum usuário encontrado
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Comece adicionando usuários ao sistema
            </p>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Adicionar Usuário
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}