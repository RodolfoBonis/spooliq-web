'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'

import { Button, Card, Input, Combobox, AdvancedColorPicker } from '@/components/ui'
import { FilamentService } from '@/services/filament.service'
import { CreateFilamentRequest, ColorData } from '@/types/api'
import { generateColorPreview } from '@/lib/color-utils'
import { useBrandOptions } from '@/hooks/useBrands'
import { useMaterialOptions } from '@/hooks/useMaterials'

const filamentSchema = z.object({
  brand_id: z.string().min(1, 'Marca é obrigatória'),
  name: z.string().min(1, 'Nome é obrigatório'),
  material_id: z.string().min(1, 'Material é obrigatório'),
  color: z.string().optional(),
  color_hex: z.string().optional(),
  color_data: z.any().optional(), // ColorData type
  diameter: z.number().positive('Diâmetro deve ser um número positivo'),
  weight: z.number().min(1, 'Peso deve ser maior que 0').max(10000, 'Peso muito grande'),
  price_per_kg: z.number().min(0.01, 'Preço deve ser maior que 0'),
  price_per_meter: z.number().optional(),
  url: z.string().url('URL deve ser válida').optional().or(z.literal('')),
})

type FilamentFormData = z.infer<typeof filamentSchema>


export default function EditFilamentPage() {
  const router = useRouter()
  const params = useParams()
  const filamentId = params.id as string
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: brandOptions = [], isLoading: brandsLoading } = useBrandOptions()
  const { data: materialOptions = [], isLoading: materialsLoading } = useMaterialOptions()

  const { data: filament, isLoading, error } = useQuery({
    queryKey: ['filament', filamentId],
    queryFn: () => FilamentService.getFilament(filamentId),
    enabled: !!filamentId,
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FilamentFormData>({
    resolver: zodResolver(filamentSchema),
  })

  useEffect(() => {
    if (filament && brandOptions.length > 0 && materialOptions.length > 0) {
      // Encontrar os IDs das marcas e materiais pelo nome
      const brandOption = brandOptions.find(b => b.label === filament.brand)
      const materialOption = materialOptions.find(m => m.label === filament.material)

      // Processar color_data para compatibilidade com o componente AdvancedColorPicker
      let colorData = undefined
      if (filament.color_data && filament.color_type) {
        // Se color_data não tem type, usar o color_type do nível superior
        colorData = filament.color_data.type
          ? filament.color_data
          : { ...filament.color_data, type: filament.color_type }
      }

      reset({
        brand_id: brandOption?.value || '',
        name: filament.name,
        material_id: materialOption?.value || '',
        color: filament.color || '',
        color_hex: filament.color_hex || '',
        color_data: colorData,
        diameter: filament.diameter,
        weight: filament.weight,
        price_per_kg: filament.price_per_kg,
        url: filament.url || '',
      })
    }
  }, [filament, reset, brandOptions, materialOptions])


  const updateMutation = useMutation({
    mutationFn: (data: FilamentFormData) => {
      // Converter os IDs de string para number e processar dados de cor
      const filamentData: CreateFilamentRequest = {
        ...data,
        brand_id: parseInt(data.brand_id),
        material_id: parseInt(data.material_id),
        color_type: data.color_data?.type,
        color_preview: data.color_data ? generateColorPreview(data.color_data) : undefined
      }
      return FilamentService.updateFilament(filamentId, filamentData)
    },
    onSuccess: () => {
      toast.success('Filamento atualizado com sucesso!')
      router.push('/filaments')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao atualizar filamento')
    },
    onSettled: () => {
      setIsSubmitting(false)
    },
  })

  const onSubmit = async (data: FilamentFormData) => {
    setIsSubmitting(true)
    updateMutation.mutate(data)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Carregando filamento...</p>
        </div>
      </div>
    )
  }

  if (error || !filament) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Filamento não encontrado
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            O filamento que você está procurando não existe ou foi removido
          </p>
          <Link href="/filaments">
            <Button>Voltar para Filamentos</Button>
          </Link>
        </div>
      </div>
    )
  }

  const selectedMaterialId = watch('material_id')
  const selectedBrandId = watch('brand_id')

  // Encontrar os labels dos IDs selecionados
  const selectedBrand = brandOptions.find(b => b.value === selectedBrandId)?.label || ''
  const selectedMaterial = materialOptions.find(m => m.value === selectedMaterialId)?.label || ''

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/filaments">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Editar Filamento
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {filament.brand} - {filament.name}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card variant="elevated" className="overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-xs text-white font-bold">1</span>
              </div>
              Informações Básicas
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Dados principais do filamento para identificação
            </p>
          </div>
          <div className="p-6">

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <Combobox
                  label="Marca"
                  value={watch('brand_id')}
                  onChange={(value) => setValue('brand_id', value)}
                  error={errors.brand_id?.message}
                  placeholder="Digite ou selecione uma marca..."
                  options={brandOptions}
                  isLoading={brandsLoading}
                  required
                />
              </div>

              <div>
                <Input
                  label="Nome do Produto"
                  {...register('name')}
                  error={errors.name?.message}
                  placeholder="Ex: PLA+ Silk Red"
                />
              </div>

              <div>
                <Combobox
                  label="Material"
                  value={watch('material_id')}
                  onChange={(value) => setValue('material_id', value)}
                  error={errors.material_id?.message}
                  placeholder="Digite ou selecione um material..."
                  options={materialOptions}
                  isLoading={materialsLoading}
                  required
                />
              </div>

              <div>
                <Input
                  label="Cor (opcional)"
                  {...register('color')}
                  error={errors.color?.message}
                  placeholder="Ex: Vermelho, Azul, Transparente..."
                />
              </div>

              <div>
                <AdvancedColorPicker
                  label="Cor Avançada (opcional)"
                  value={watch('color_data')}
                  onChange={(colorData) => {
                    setValue('color_data', colorData)
                    // Atualizar também o color_hex para compatibilidade
                    if (colorData.type === 'solid') {
                      setValue('color_hex', colorData.color)
                    }
                  }}
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <Input
                  label="URL de Compra (opcional)"
                  {...register('url')}
                  error={errors.url?.message}
                  placeholder="https://loja.exemplo.com/filamento-pla-vermelho"
                  type="url"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Link para onde os clientes podem comprar este filamento
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-xs text-white font-bold">2</span>
              </div>
              Especificações Técnicas
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Características físicas e informações de preço
            </p>
          </div>
          <div className="p-6">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Input
                  label="Diâmetro (mm)"
                  type="number"
                  step="0.01"
                  min="0.1"
                  max="10"
                  {...register('diameter', { valueAsNumber: true })}
                  error={errors.diameter?.message}
                  placeholder="1.75"
                />
              </div>

              <div>
                <Input
                  label="Peso (g)"
                  type="number"
                  {...register('weight', { valueAsNumber: true })}
                  error={errors.weight?.message}
                  placeholder="1000"
                />
              </div>

              <div>
                <Input
                  label="Preço por kg (R$)"
                  type="number"
                  step="0.01"
                  {...register('price_per_kg', { valueAsNumber: true })}
                  error={errors.price_per_kg?.message}
                  placeholder="75.00"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Preview */}
        {(selectedBrand || selectedMaterial) && (
          <Card variant="elevated" className="overflow-hidden border-2 border-amber-200 dark:border-amber-800">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 px-6 py-4 border-b border-amber-200 dark:border-amber-800">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-xs text-white font-bold">👁</span>
                </div>
                Prévia do Filamento
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Visualização de como aparecerá no catálogo
              </p>
            </div>
            <div className="p-6">
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-4">
                    {(watch('color_data') || watch('color_hex')) && (
                      <div className="relative">
                        <div
                          className="w-12 h-12 rounded-xl border-2 border-white dark:border-slate-900 shadow-lg"
                          style={{
                            background: watch('color_data')
                              ? generateColorPreview(watch('color_data'))
                              : watch('color_hex') || '#FF0000'
                          }}
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-900"></div>
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-lg">
                        {selectedBrand || 'Marca'}
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400 font-medium">
                        {watch('name') || 'Nome do produto'}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-sm text-slate-500 dark:text-slate-400">
                        <span className="bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-lg font-medium">
                          {selectedMaterial || 'Material'}
                        </span>
                        <span>•</span>
                        <span>{watch('diameter') || 1.75}mm</span>
                        <span>•</span>
                        <span>{watch('weight') || 1000}g</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      R$ {(watch('price_per_kg') || 0).toFixed(2)}/kg
                    </div>
                    {watch('color') && (
                      <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {watch('color')}
                      </div>
                    )}
                    {watch('url') && (
                      <div className="mt-2">
                        <a
                          href={watch('url')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors"
                        >
                          🛒 Ver na loja
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

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
                <Link href="/filaments">
                  <Button variant="outline" disabled={isSubmitting} size="lg">
                    Cancelar
                  </Button>
                </Link>
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  size="lg"
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl"
                >
                  <Save className="w-5 h-5 mr-2" />
                  {isSubmitting ? 'Atualizando...' : 'Atualizar Filamento'}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </form>
    </div>
  )
}