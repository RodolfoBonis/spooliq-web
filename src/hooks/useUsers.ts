import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UserService, UserFilters, CreateUserRequest, UpdateUserRequest, UpdatePasswordRequest } from '@/services/user.service'
import { User, PaginatedResponse } from '@/types/api'
import toast from 'react-hot-toast'

// Get users with pagination and filters
export function useUsers(filters: UserFilters = {}, page = 1, perPage = 12) {
  return useQuery({
    queryKey: ['users', filters, page, perPage],
    queryFn: () => UserService.getUsers(filters, page, perPage),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Get single user
export function useUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => UserService.getUser(id),
    enabled: !!id,
  })
}

// Get user stats
export function useUserStats() {
  return useQuery({
    queryKey: ['user-stats'],
    queryFn: () => UserService.getUserStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Get available roles
export function useRoles() {
  return useQuery({
    queryKey: ['user-roles'],
    queryFn: () => UserService.getRoles(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  })
}

// Create user mutation
export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateUserRequest) => UserService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user-stats'] })
      toast.success('Usuário criado com sucesso!')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Erro ao criar usuário'
      toast.error(message)
    },
  })
}

// Update user mutation
export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      UserService.updateUser(id, data),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user', updatedUser.id] })
      queryClient.invalidateQueries({ queryKey: ['user-stats'] })
      toast.success('Usuário atualizado com sucesso!')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Erro ao atualizar usuário'
      toast.error(message)
    },
  })
}

// Update password mutation
export function useUpdatePassword() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePasswordRequest }) =>
      UserService.updatePassword(id, data),
    onSuccess: () => {
      toast.success('Senha atualizada com sucesso!')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Erro ao atualizar senha'
      toast.error(message)
    },
  })
}

// Delete user mutation
export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => UserService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user-stats'] })
      toast.success('Usuário excluído com sucesso!')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Erro ao excluir usuário'
      toast.error(message)
    },
  })
}

// Toggle user status mutation
export function useToggleUserStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => UserService.toggleUserStatus(id),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user', updatedUser.id] })
      queryClient.invalidateQueries({ queryKey: ['user-stats'] })

      const status = updatedUser.status || 'active'
      const statusText = status === 'active' ? 'ativado' : 'desativado'
      toast.success(`Usuário ${statusText} com sucesso!`)
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Erro ao alterar status do usuário'
      toast.error(message)
    },
  })
}

// Reset password mutation
export function useResetPassword() {
  return useMutation({
    mutationFn: (id: string) => UserService.resetPassword(id),
    onSuccess: (data) => {
      toast.success(`Senha resetada! Nova senha temporária: ${data.temporary_password}`)
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Erro ao resetar senha'
      toast.error(message)
    },
  })
}