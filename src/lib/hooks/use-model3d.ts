import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  model3dService,
  type Model3DFilters,
  type UpdateModel3DDTO,
} from '@/services/model3d-service'

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
