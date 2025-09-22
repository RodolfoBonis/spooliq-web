'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, Cog, Zap, Thermometer, Ruler, Box } from 'lucide-react'
import { Card, Button, Input, Modal } from '@/components/ui'
import { useAuthStore } from '@/stores/auth-store'
import {
  useMachinePresets,
  useCreateMachinePreset,
  useUpdatePreset,
  useDeletePreset
} from '@/hooks/usePresets'
import { CreateMachinePresetRequest, MachinePreset } from '@/types/api'
import toast from 'react-hot-toast'

interface MachinePresetFormData {
  name: string
  brand: string
  model: string
  watt: number
  idle_factor: number
  build_volume?: {
    x: number
    y: number
    z: number
  }
  nozzle_diameter?: number
  max_temperature?: number
  heated_bed?: boolean
}

export default function MachinePresetsPage() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === "admin"

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPreset, setEditingPreset] = useState<MachinePreset | null>(null)
  const [formData, setFormData] = useState<MachinePresetFormData>({
    name: '',
    brand: '',
    model: '',
    watt: 0,
    idle_factor: 0.1
  })

  const { data: presets = [], isLoading: presetsLoading } = useMachinePresets()
  const createMutation = useCreateMachinePreset()
  const updateMutation = useUpdatePreset()
  const deleteMutation = useDeletePreset()

  const handleOpenModal = (preset?: MachinePreset) => {
    if (preset) {
      setEditingPreset(preset)
      setFormData({
        name: preset.name,
        brand: preset.brand,
        model: preset.model,
        watt: preset.watt,
        idle_factor: preset.idle_factor,
        build_volume: preset.build_volume,
        nozzle_diameter: preset.nozzle_diameter,
        max_temperature: preset.max_temperature,
        heated_bed: preset.heated_bed
      })
    } else {
      setEditingPreset(null)
      setFormData({
        name: '',
        brand: '',
        model: '',
        watt: 0,
        idle_factor: 0.1
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

  const handleDelete = async (preset: MachinePreset) => {
    if (confirm('Tem certeza que deseja excluir este preset de máquina?')) {
      try {
        await deleteMutation.mutateAsync(preset.key)
      } catch (error) {
        console.error('Error deleting preset:', error)
      }
    }
  }

  const formatVolume = (volume?: { x: number; y: number; z: number }) => {
    if (!volume) return 'Não especificado'
    return `${volume.x} × ${volume.y} × ${volume.z} mm`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Presets de Máquina
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie os presets de impressoras 3D e suas especificações
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
              <Cog className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nenhum preset de máquina encontrado
              </h3>
              <p className="text-gray-500 mb-4">
                Não há presets de máquina cadastrados
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
            <Card key={preset.key || preset.name}>
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {preset.name}
                      </h3>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {preset.brand}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Modelo: {preset.model}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <span className="text-gray-600 dark:text-gray-400">Potência:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {preset.watt}W
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Cog className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">Fator Idle:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {(preset.idle_factor * 100).toFixed(1)}%
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Box className="w-4 h-4 text-purple-500" />
                        <span className="text-gray-600 dark:text-gray-400">Volume:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatVolume(preset.build_volume)}
                        </span>
                      </div>

                      {preset.nozzle_diameter && (
                        <div className="flex items-center gap-2">
                          <Ruler className="w-4 h-4 text-green-500" />
                          <span className="text-gray-600 dark:text-gray-400">Bico:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {preset.nozzle_diameter}mm
                          </span>
                        </div>
                      )}

                      {preset.max_temperature && (
                        <div className="flex items-center gap-2">
                          <Thermometer className="w-4 h-4 text-red-500" />
                          <span className="text-gray-600 dark:text-gray-400">Temp. Máx:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {preset.max_temperature}°C
                          </span>
                        </div>
                      )}

                      {preset.heated_bed !== undefined && (
                        <div className="flex items-center gap-2">
                          <Thermometer className="w-4 h-4 text-orange-500" />
                          <span className="text-gray-600 dark:text-gray-400">Mesa Aquecida:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {preset.heated_bed ? 'Sim' : 'Não'}
                          </span>
                        </div>
                      )}
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(preset)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
        title={editingPreset ? 'Editar Preset de Máquina' : 'Novo Preset de Máquina'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome da Máquina"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Ender 3 V2"
              required
            />
            <Input
              label="Marca"
              value={formData.brand}
              onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
              placeholder="Ex: Creality"
              required
            />
          </div>

          <Input
            label="Modelo"
            value={formData.model}
            onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
            placeholder="Ex: Ender-3 V2"
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Potência (W)"
              type="number"
              min="0"
              value={formData.watt}
              onChange={(e) => setFormData(prev => ({ ...prev, watt: parseInt(e.target.value) || 0 }))}
              placeholder="220"
              required
            />
            <Input
              label="Fator Idle (0-1)"
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={formData.idle_factor}
              onChange={(e) => setFormData(prev => ({ ...prev, idle_factor: parseFloat(e.target.value) || 0 }))}
              placeholder="0.1"
              required
            />
          </div>

          {/* Optional fields */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Especificações Opcionais
            </h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Volume de Impressão (mm)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    type="number"
                    min="0"
                    value={formData.build_volume?.x || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      build_volume: {
                        ...prev.build_volume,
                        x: parseInt(e.target.value) || 0,
                        y: prev.build_volume?.y || 0,
                        z: prev.build_volume?.z || 0
                      }
                    }))}
                    placeholder="X (220)"
                  />
                  <Input
                    type="number"
                    min="0"
                    value={formData.build_volume?.y || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      build_volume: {
                        ...prev.build_volume,
                        x: prev.build_volume?.x || 0,
                        y: parseInt(e.target.value) || 0,
                        z: prev.build_volume?.z || 0
                      }
                    }))}
                    placeholder="Y (220)"
                  />
                  <Input
                    type="number"
                    min="0"
                    value={formData.build_volume?.z || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      build_volume: {
                        ...prev.build_volume,
                        x: prev.build_volume?.x || 0,
                        y: prev.build_volume?.y || 0,
                        z: parseInt(e.target.value) || 0
                      }
                    }))}
                    placeholder="Z (250)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Diâmetro do Bico (mm)"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.nozzle_diameter || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, nozzle_diameter: parseFloat(e.target.value) || undefined }))}
                  placeholder="0.4"
                />
                <Input
                  label="Temperatura Máxima (°C)"
                  type="number"
                  min="0"
                  value={formData.max_temperature || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_temperature: parseInt(e.target.value) || undefined }))}
                  placeholder="260"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="heated_bed"
                  checked={formData.heated_bed || false}
                  onChange={(e) => setFormData(prev => ({ ...prev, heated_bed: e.target.checked }))}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <label htmlFor="heated_bed" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Possui mesa aquecida
                </label>
              </div>
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