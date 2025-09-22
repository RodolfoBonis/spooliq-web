'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save, Building2 } from 'lucide-react'
import Link from 'next/link'
import { useCreateBrand } from '@/hooks/useBrands'
import { Button, Card, Input } from '@/components/ui'
import { CreateBrandRequest } from '@/types/api'

const brandSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  description: z.string().optional(),
})

type BrandFormData = z.infer<typeof brandSchema>

export default function NewBrandPage() {
  const router = useRouter()
  const createBrand = useCreateBrand()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
  })

  const onSubmit = async (data: BrandFormData) => {
    createBrand.mutate(data, {
      onSuccess: () => {
        router.push('/brands')
      }
    })
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
            Nova Marca
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Adicione uma nova marca de filamento ao sistema
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
              Dados básicos da marca de filamento
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
                    Pronto para salvar?
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Verifique as informações antes de continuar
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Link href="/brands">
                  <Button
                    variant="outline"
                    disabled={createBrand.isPending}
                    size="lg"
                  >
                    Cancelar
                  </Button>
                </Link>
                <Button
                  type="submit"
                  isLoading={createBrand.isPending}
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl"
                >
                  <Save className="w-5 h-5 mr-2" />
                  {createBrand.isPending ? 'Salvando...' : 'Salvar Marca'}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </form>
    </div>
  )
}