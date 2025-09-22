'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save, Building2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useBrand, useUpdateBrand } from '@/hooks/useBrands'
import { Button, Card, Input } from '@/components/ui'
import { UpdateBrandRequest } from '@/types/api'

const brandSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  description: z.string().optional(),
  active: z.boolean(),
})

type BrandFormData = z.infer<typeof brandSchema>

export default function EditBrandPage() {
  const router = useRouter()
  const params = useParams()
  const brandId = parseInt(params.id as string)

  const { data: brand, isLoading, error } = useBrand(brandId)
  const updateBrand = useUpdateBrand()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
  })

  useEffect(() => {
    if (brand) {
      reset({
        name: brand.name,
        description: brand.description || '',
        active: brand.active,
      })
    }
  }, [brand, reset])

  const onSubmit = async (data: BrandFormData) => {
    updateBrand.mutate({
      id: brandId,
      data
    }, {
      onSuccess: () => {
        router.push('/brands')
      }
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Carregando marca...</p>
        </div>
      </div>
    )
  }

  if (error || !brand) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Marca não encontrada
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            A marca que você está procurando não existe ou foi removida
          </p>
          <Link href="/brands">
            <Button>Voltar para Marcas</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/brands">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Editar Marca
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {brand.name}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card variant="elevated" className="overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-3 h-3 text-white" />
              </div>
              Informações da Marca
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Edite os dados da marca de filamento
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <Input
                  label="Nome da Marca"
                  {...register('name')}
                  error={errors.name?.message}
                  placeholder="Ex: SUNLU, Creality, eSUN..."
                  required
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Nome oficial da marca de filamentos
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Descrição (opcional)
                </label>
                <textarea
                  {...register('description')}
                  placeholder="Descreva a marca, suas características ou qualidade dos produtos..."
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  rows={4}
                />
                {errors.description && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('active')}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Marca ativa
                  </span>
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Marcas inativas não aparecerão nos dropdowns de seleção
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <Card variant="elevated">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                  <Save className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    Pronto para atualizar?
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Verifique as alterações antes de continuar
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Link href="/brands">
                  <Button
                    variant="outline"
                    disabled={updateBrand.isPending}
                    size="lg"
                  >
                    Cancelar
                  </Button>
                </Link>
                <Button
                  type="submit"
                  isLoading={updateBrand.isPending}
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl"
                >
                  <Save className="w-5 h-5 mr-2" />
                  {updateBrand.isPending ? 'Atualizando...' : 'Atualizar Marca'}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </form>
    </div>
  )
}