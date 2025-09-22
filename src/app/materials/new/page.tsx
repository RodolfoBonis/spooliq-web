'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save, Layers, Code } from 'lucide-react'
import Link from 'next/link'
import { useCreateMaterial } from '@/hooks/useMaterials'
import { Button, Card, Input } from '@/components/ui'
import { CreateMaterialRequest } from '@/types/api'
import { MaterialService } from '@/services/material.service'

const materialSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(50, 'Nome muito longo'),
  description: z.string().optional(),
  properties: z.string().optional().refine((value) => {
    if (!value) return true
    return MaterialService.validateProperties(value)
  }, {
    message: 'JSON inválido nas propriedades'
  }),
})

type MaterialFormData = z.infer<typeof materialSchema>

export default function NewMaterialPage() {
  const router = useRouter()
  const createMaterial = useCreateMaterial()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<MaterialFormData>({
    resolver: zodResolver(materialSchema),
  })

  const propertiesValue = watch('properties')

  const onSubmit = async (data: MaterialFormData) => {
    createMaterial.mutate(data, {
      onSuccess: () => {
        router.push('/materials')
      }
    })
  }

  const formatJSON = () => {
    if (propertiesValue) {
      try {
        const parsed = JSON.parse(propertiesValue)
        const formatted = JSON.stringify(parsed, null, 2)
        register('properties').onChange({ target: { value: formatted } })
      } catch {
        // Invalid JSON, do nothing
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/materials">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Novo Material
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Adicione um novo tipo de material de filamento
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card variant="elevated" className="overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Layers className="w-3 h-3 text-white" />
              </div>
              Informações do Material
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Dados básicos do tipo de material
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <Input
                  label="Nome do Material"
                  {...register('name')}
                  error={errors.name?.message}
                  placeholder="Ex: PLA, ABS, PETG, TPU..."
                  required
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Nome oficial do tipo de material de filamento
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Descrição (opcional)
                </label>
                <textarea
                  {...register('description')}
                  placeholder="Descreva as características, aplicações ou propriedades do material..."
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                  rows={3}
                />
                {errors.description && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Propriedades (JSON opcional)
                  </label>
                  <button
                    type="button"
                    onClick={formatJSON}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 bg-purple-50 dark:bg-purple-900/20 rounded transition-colors"
                  >
                    <Code className="w-3 h-3" />
                    Formatar
                  </button>
                </div>
                <textarea
                  {...register('properties')}
                  placeholder='{"temp_extrusao": 200, "temp_mesa": 60, "velocidade": "media"}'
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none font-mono text-sm"
                  rows={5}
                />
                {errors.properties && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {errors.properties.message}
                  </p>
                )}
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Propriedades técnicas do material em formato JSON (temperatura de extrusão, mesa, etc.)
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
                    Pronto para salvar?
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Verifique as informações antes de continuar
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Link href="/materials">
                  <Button
                    variant="outline"
                    disabled={createMaterial.isPending}
                    size="lg"
                  >
                    Cancelar
                  </Button>
                </Link>
                <Button
                  type="submit"
                  isLoading={createMaterial.isPending}
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl"
                >
                  <Save className="w-5 h-5 mr-2" />
                  {createMaterial.isPending ? 'Salvando...' : 'Salvar Material'}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </form>
    </div>
  )
}