'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, Zap, MapPin, Calendar, DollarSign } from 'lucide-react'
import { Card, Button, Input, Select, Modal } from '@/components/ui'
import { useAuthStore } from '@/stores/auth-store'
import {
  useEnergyPresets,
  useEnergyLocations,
  useCreateEnergyPreset,
  useUpdatePreset,
  useDeletePreset
} from '@/hooks/usePresets'
import { CreateEnergyPresetRequest, EnergyPreset } from '@/types/api'
import toast from 'react-hot-toast'

interface EnergyPresetFormData {
  location: string
  state: string
  city: string
  base_tariff: number
  flag_surcharge: number
  year: number
  month?: number
  flag_type: 'green' | 'yellow' | 'red'
  description?: string
}

export default function EnergyPresetsPage() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === "admin"

  const [selectedLocation, setSelectedLocation] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPreset, setEditingPreset] = useState<EnergyPreset | null>(null)
  const [formData, setFormData] = useState<EnergyPresetFormData>({
    location: '',
    base_tariff: 0,
    flag_surcharge: 0,
    year: new Date().getFullYear()
  })

  const { data: locations = [], isLoading: locationsLoading } = useEnergyLocations()
  const { data: presets = [], isLoading: presetsLoading } = useEnergyPresets(selectedLocation)
  const createMutation = useCreateEnergyPreset()
  const updateMutation = useUpdatePreset()
  const deleteMutation = useDeletePreset()

  const handleOpenModal = (preset?: EnergyPreset) => {
    if (preset) {
      setEditingPreset(preset)
      setFormData({
        location: preset.location,
        state: preset.state,
        city: preset.city,
        base_tariff: preset.base_tariff,
        flag_surcharge: preset.flag_surcharge,
        year: preset.year,
        month: preset.month,
        flag_type: preset.flag_type
      })
    } else {
      setEditingPreset(null)
      setFormData({
        location: selectedLocation || '',
        state: '',
        city: '',
        base_tariff: 0,
        flag_surcharge: 0,
        year: new Date().getFullYear(),
        flag_type: 'green'
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

  const handleDelete = async (preset: EnergyPreset) => {
    if (confirm('Tem certeza que deseja excluir este preset de energia?')) {
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

  const getFlagColor = (flagType?: string) => {
    switch (flagType) {
      case 'green': return 'bg-green-100 text-green-800'
      case 'yellow': return 'bg-yellow-100 text-yellow-800'
      case 'red': return 'bg-red-100 text-red-800'
      case 'red_level_1': return 'bg-red-200 text-red-900'
      case 'red_level_2': return 'bg-red-300 text-red-900'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getFlagLabel = (flagType?: string) => {
    switch (flagType) {
      case 'green': return 'Verde'
      case 'yellow': return 'Amarela'
      case 'red': return 'Vermelha'
      case 'red_level_1': return 'Vermelha Nível 1'
      case 'red_level_2': return 'Vermelha Nível 2'
      default: return 'Não especificada'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Presets de Energia
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie os presets de tarifas de energia por localização
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

      {/* Location Filter */}
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-900 dark:text-white">Localização:</span>
            </div>
            <Select
              value={selectedLocation}
              onValueChange={setSelectedLocation}
              placeholder="Selecione uma localização"
              disabled={locationsLoading}
            >
              <option value="">Todas as localizações</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

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
              <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nenhum preset encontrado
              </h3>
              <p className="text-gray-500 mb-4">
                {selectedLocation
                  ? `Não há presets para a localização "${selectedLocation}"`
                  : 'Não há presets de energia cadastrados'
                }
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
            <Card key={preset.key || preset.location}>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {preset.location}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFlagColor(preset.flag_type)}`}>
                        {getFlagLabel(preset.flag_type)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">Tarifa Base:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(preset.base_tariff)}/kWh
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">Adicional Bandeira:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(preset.flag_surcharge)}/kWh
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">Ano:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {preset.year}
                        </span>
                      </div>

                      {preset.month && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600 dark:text-gray-400">Mês:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {preset.month}
                          </span>
                        </div>
                      )}
                    </div>

                    {(preset.state || preset.city) && (
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {preset.city && preset.state ? `${preset.city}, ${preset.state}` :
                         preset.city || preset.state}
                      </div>
                    )}
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-2">
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
        title={editingPreset ? 'Editar Preset de Energia' : 'Novo Preset de Energia'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Localização"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Ex: São Paulo - SP"
              required
            />
            <Input
              label="Estado"
              value={formData.state}
              onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
              placeholder="Ex: São Paulo"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Cidade"
              value={formData.city}
              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              placeholder="Ex: São Paulo"
              required
            />
            <Select
              label="Tipo de Bandeira"
              value={formData.flag_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, flag_type: value as any }))}
              required
            >
              <option value="green">Verde</option>
              <option value="yellow">Amarela</option>
              <option value="red">Vermelha</option>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Tarifa Base (R$/kWh)"
              type="number"
              step="0.0001"
              min="0"
              value={formData.base_tariff}
              onChange={(e) => setFormData(prev => ({ ...prev, base_tariff: parseFloat(e.target.value) || 0 }))}
              placeholder="0.0000"
              required
            />
            <Input
              label="Adicional Bandeira (R$/kWh)"
              type="number"
              step="0.0001"
              min="0"
              value={formData.flag_surcharge}
              onChange={(e) => setFormData(prev => ({ ...prev, flag_surcharge: parseFloat(e.target.value) || 0 }))}
              placeholder="0.0000"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Ano"
              type="number"
              min="2020"
              max="2030"
              value={formData.year}
              onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))}
              required
            />
            <Input
              label="Mês (opcional)"
              type="number"
              min="1"
              max="12"
              value={formData.month || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, month: e.target.value ? parseInt(e.target.value) : undefined }))}
              placeholder="1-12"
            />
          </div>

          <Input
            label="Descrição (opcional)"
            value={formData.description || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Descrição do preset de energia"
          />

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