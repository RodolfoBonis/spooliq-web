'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '@/lib/hooks/use-users'
import { useAuthStore } from '@/stores/auth-store'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createUserSchema, type CreateUserFormData } from '@/lib/validations/user'
import { Plus, Edit, Trash2, Users, Shield, User as UserIcon } from 'lucide-react'
import type { User } from '@/services/user-service'
import { formatDate } from '@/lib/utils/format'

export default function UsersPage() {
  const { data: users, isLoading } = useUsers()
  const { mutate: createUser, isPending: isCreating } = useCreateUser()
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser()
  const { mutate: deleteUser } = useDeleteUser()
  const { user: currentUser } = useAuthStore()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)

  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      user_type: 'user',
    },
  })

  const handleOpenCreate = () => {
    setEditingUser(null)
    form.reset({
      name: '',
      email: '',
      password: '',
      user_type: 'user',
    })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (user: User) => {
    setEditingUser(user)
    form.reset({
      name: user.name,
      email: user.email,
      password: '',
      user_type: user.user_type === 'admin' ? 'admin' : 'user',
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = (data: CreateUserFormData) => {
    if (editingUser) {
      const { password, user_type, email, ...updateData } = data
      updateUser(
        { id: editingUser.id, data: updateData },
        {
          onSuccess: () => {
            setIsDialogOpen(false)
            form.reset()
          },
        }
      )
    } else {
      createUser(data, {
        onSuccess: () => {
          setIsDialogOpen(false)
          form.reset()
        },
      })
    }
  }

  const handleDelete = () => {
    if (deletingUser) {
      deleteUser(deletingUser.id)
      setDeletingUser(null)
    }
  }

  const getRoleBadge = (userType: string) => {
    if (userType === 'owner') {
      return (
        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
          <Shield className="mr-1 h-3 w-3" />
          Proprietário
        </Badge>
      )
    }
    if (userType === 'admin') {
      return (
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
          <Shield className="mr-1 h-3 w-3" />
          Administrador
        </Badge>
      )
    }
    return (
      <Badge variant="secondary">
        <UserIcon className="mr-1 h-3 w-3" />
        Usuário
      </Badge>
    )
  }

  const canEditUser = (user: User) => {
    if (!currentUser) return false
    // Owner can't be edited/deleted
    if (user.user_type === 'owner') return false
    // Current user can't delete themselves
    if (user.id === currentUser.id) return false
    // Only Owner and OrgAdmin can manage users
    return currentUser.roles?.includes('owner') || currentUser.roles?.includes('admin')
  }

  if (isLoading) {
    return (
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-2">
            <Users className="h-8 w-8 text-primary-500" />
            Gerenciamento de Usuários
          </h1>
          <p className="text-neutral-600 mt-1">
            Gerencie os usuários da sua organização
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-primary-500 hover:bg-primary-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          Convidar Usuário
        </Button>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {!users || users.length === 0 ? (
            <div className="p-12">
              <EmptyState
                icon={Users}
                title="Nenhum usuário encontrado"
                description="Convide usuários para colaborar na sua organização"
                action={
                  <Button
                    onClick={handleOpenCreate}
                    className="bg-primary-500 hover:bg-primary-600"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Convidar Usuário
                  </Button>
                }
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Papel</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-neutral-600">{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.user_type)}</TableCell>
                    <TableCell className="text-neutral-600">
                      {formatDate(user.created_at, 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      {canEditUser(user) ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingUser(user)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-400">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Editar Usuário' : 'Convidar Usuário'}
            </DialogTitle>
            <DialogDescription>
              {editingUser
                ? 'Atualize as informações do usuário'
                : 'Convide um novo usuário para sua organização'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                placeholder="Nome completo"
                {...form.register('name')}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@exemplo.com"
                {...form.register('email')}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            {!editingUser && (
              <div>
                <Label htmlFor="password">Senha *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  {...form.register('password')}
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="user_type">Papel *</Label>
              <Select
                value={form.watch('user_type')}
                onValueChange={(value) => form.setValue('user_type', value as 'admin' | 'user')}
              >
                <SelectTrigger id="user_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      <span>Usuário</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span>Administrador</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.user_type && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.user_type.message}
                </p>
              )}
              <p className="text-xs text-neutral-500 mt-1">
                {form.watch('user_type') === 'admin'
                  ? 'Administradores podem gerenciar usuários e configurações'
                  : 'Usuários podem criar e gerenciar orçamentos'}
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isCreating || isUpdating}
                className="bg-primary-500 hover:bg-primary-600"
              >
                {isCreating || isUpdating
                  ? 'Salvando...'
                  : editingUser
                  ? 'Atualizar'
                  : 'Convidar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deletingUser}
        onOpenChange={(open) => !open && setDeletingUser(null)}
        title="Deletar usuário"
        description={`Tem certeza que deseja remover ${deletingUser?.name} da organização? Esta ação não pode ser desfeita.`}
        onConfirm={handleDelete}
        confirmText="Deletar"
        variant="destructive"
      />
    </div>
  )
}

