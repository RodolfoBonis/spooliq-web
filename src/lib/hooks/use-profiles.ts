import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { profileService } from '@/services/profile-service'
import type { CreateProfileDTO, UpdateProfileDTO } from '@/services/profile-service'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api/errors'

const PROFILES_KEY = ['profiles'] as const

const FORBIDDEN_DEFAULT = 'Apenas proprietários e administradores podem realizar esta ação.'

export function useProfiles() {
  return useQuery({
    queryKey: PROFILES_KEY,
    queryFn: () => profileService.list(),
  })
}

export function useCreateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateProfileDTO) => profileService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILES_KEY })
      toast.success('Perfil de impressão criado com sucesso!')
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Erro ao criar perfil'))
    },
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProfileDTO }) =>
      profileService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILES_KEY })
      toast.success('Perfil de impressão atualizado com sucesso!')
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Erro ao atualizar perfil'))
    },
  })
}

export function useDeleteProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => profileService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILES_KEY })
      toast.success('Perfil de impressão excluído com sucesso!')
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Erro ao excluir perfil', { 403: FORBIDDEN_DEFAULT }))
    },
  })
}

export function useSetDefaultProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => profileService.setDefault(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILES_KEY })
      toast.success('Perfil definido como padrão!')
    },
    onError: (error: unknown) => {
      toast.error(
        getApiErrorMessage(error, 'Erro ao definir perfil padrão', { 403: FORBIDDEN_DEFAULT })
      )
    },
  })
}

export function useDuplicateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => profileService.duplicate(id),
    onSuccess: (profile) => {
      queryClient.invalidateQueries({ queryKey: PROFILES_KEY })
      toast.success(`Perfil duplicado como "${profile.name}"`)
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Erro ao duplicar perfil'))
    },
  })
}
