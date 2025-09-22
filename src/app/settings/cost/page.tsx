'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, DollarSign, Percent, Star } from 'lucide-react'
import { Card, Button, Input, Modal } from '@/components/ui'
import { useAuthStore } from '@/stores/auth-store'
import {
  useCostPresets,
  useCreateCostPreset,
  useUpdatePreset,
  useDeletePreset
} from '@/hooks/usePresets'
import { CreateCostPresetRequest, CostPreset } from '@/types/api'
import toast from 'react-hot-toast'

interface CostPresetFormData {
  name: string
  description?: string
  overhead_amount: number
  wear_percentage: number
  is_default?: boolean
}

export default function CostPresetsPage() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === "admin"

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPreset, setEditingPreset] = useState<CostPreset | null>(null)
  const [formData, setFormData] = useState<CostPresetFormData>({
    name: '',
    overhead_amount: 0,
    wear_percentage: 0,
  })

  const { data: presets = [], isLoading: presetsLoading } = useCostPresets()
  const createMutation = useCreateCostPreset()
  const updateMutation = useUpdatePreset()
  const deleteMutation = useDeletePreset()

  const handleOpenModal = (preset?: CostPreset) => {
    if (preset) {
      setEditingPreset(preset)
      setFormData({
        name: preset.name,
        description: preset.description,
        overhead_amount: preset.overhead_amount,
        wear_percentage: preset.wear_percentage,
        is_default: preset.is_default
      })
    } else {
      setEditingPreset(null)
      setFormData({
        name: '',
        overhead_amount: 0,
        wear_percentage: 0,
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingPreset(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingPreset) {
        await updateMutation.mutateAsync({
          key: editingPreset.key,
          data: formData
        })
      } else {
        await createMutation.mutateAsync(formData)
      }
      handleCloseModal()
    } catch (error) {
      console.error('Error saving preset:', error)
    }
  }

  const handleDelete = async (preset: CostPreset) => {
    if (confirm('Tem certeza que deseja excluir este preset de custo?')) {
      try {
        await deleteMutation.mutateAsync(preset.key)
      } catch (error) {
        console.error('Error deleting preset:', error)
      }
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Presets de Custo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie os presets de perfis de custo para orçamentos
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => handleOpenModal()}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Preset
          </Button>
        )}
      </div>

      {/* Presets List */}
      <div className="space-y-4">
        {presetsLoading ? (
          <Card>
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
              <p className="mt-4 text-gray-500">Carregando presets...</p>
            </div>
          </Card>
        ) : presets.length === 0 ? (
          <Card>
            <div className="p-8 text-center">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nenhum preset de custo encontrado
              </h3>
              <p className="text-gray-500 mb-4">
                Não há presets de custo cadastrados
              </p>
              {isAdmin && (
                <Button
                  onClick={() => handleOpenModal()}
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Preset
                </Button>
              )}
            </div>
          </Card>
        ) : (
          presets.map((preset) => (
            <Card key={preset.key}>
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {preset.name}
                      </h3>
                      {preset.is_default && (
                        <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          <Star className="w-3 h-3" />
                          Padrão
                        </span>
                      )}
                    </div>

                    {preset.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {preset.description}
                      </p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span className="text-gray-600 dark:text-gray-400">Overhead:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(preset.overhead_amount)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Percent className="w-4 h-4 text-orange-500" />
                        <span className="text-gray-600 dark:text-gray-400">Desgaste:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {preset.wear_percentage.toFixed(2)}%
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-gray-500">
                      Criado em: {new Date(preset.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenModal(preset)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {!preset.is_default && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(preset)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingPreset ? 'Editar Preset de Custo' : 'Novo Preset de Custo'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome do Preset"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Ex: Custo Padrão"
            required
          />

          <Input
            label="Descrição (opcional)"
            value={formData.description || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Descrição do preset de custo"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Overhead (R$)"
              type="number"
              step="0.01"
              min="0"
              value={formData.overhead_amount}
              onChange={(e) => setFormData(prev => ({ ...prev, overhead_amount: parseFloat(e.target.value) || 0 }))}
              placeholder="0.00"
              required
            />
            <Input
              label="Percentual de Desgaste (%)"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={formData.wear_percentage}
              onChange={(e) => setFormData(prev => ({ ...prev, wear_percentage: parseFloat(e.target.value) || 0 }))}
              placeholder="0.00"
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_default"
              checked={formData.is_default || false}
              onChange={(e) => setFormData(prev => ({ ...prev, is_default: e.target.checked }))}
              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <label htmlFor="is_default" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Definir como preset padrão
            </label>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
              Informações sobre os campos:
            </h4>
            <div className="space-y-1 text-xs text-blue-800 dark:text-blue-300">
              <p><strong>Overhead:</strong> Custos fixos adicionais por impressão (energia, manutenção, etc.)</p>
              <p><strong>Desgaste:</strong> Percentual de desgaste da impressora aplicado sobre os custos</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseModal}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={createMutation.isPending || updateMutation.isPending}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
            >
              {editingPreset ? 'Atualizar' : 'Criar'} Preset
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}