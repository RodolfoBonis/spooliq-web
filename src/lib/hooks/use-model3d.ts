import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api/errors'
import {
  model3dService,
  type Model3DFilters,
  type UpdateModel3DDTO,
} from '@/services/model3d-service'
import type { Model3D } from '@/types/models'

export function useModels3D(filters?: Model3DFilters) {
  return useQuery({
    queryKey: ['models3d', filters],
    queryFn: () => model3dService.list(filters),
  })
}

export function useModel3D(id?: string) {
  return useQuery({
    queryKey: ['models3d', id],
    queryFn: () => model3dService.getById(id!),
    enabled: !!id,
  })
}

export function useModels3DByCustomer(customerId?: string) {
  return useQuery({
    queryKey: ['models3d', 'customer', customerId],
    queryFn: () => model3dService.getByCustomer(customerId!),
    enabled: !!customerId,
  })
}

export function useUploadModel3D() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData: FormData) => model3dService.upload(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models3d'] })
    },
  })
}

export function useUpdateModel3D() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateModel3DDTO }) =>
      model3dService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['models3d'] })
      queryClient.invalidateQueries({ queryKey: ['models3d', variables.id] })
    },
  })
}

export function useDeleteModel3D() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => model3dService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models3d'] })
    },
  })
}

/**
 * Downloads a model's binary file through the authenticated axios client
 * (blob → object URL → `a.download`), surfacing a pt-BR toast on failure.
 */
export function useDownloadModel3D() {
  return useMutation({
    mutationFn: (model: Pick<Model3D, 'id' | 'file_name'>) =>
      model3dService.downloadFile(model),
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Erro ao baixar o arquivo'))
    },
  })
}
