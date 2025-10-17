'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'
import type { ColorType, ColorData } from '@/types/models'

interface ColorPickerProps {
  colorType: ColorType
  colorData: ColorData
  onColorTypeChange: (type: ColorType) => void
  onColorDataChange: (data: ColorData) => void
}

export function ColorPicker({ colorType, colorData, onColorTypeChange, onColorDataChange }: ColorPickerProps) {
  const [localType, setLocalType] = useState<ColorType>(colorType)
  const [localData, setLocalData] = useState<ColorData>(colorData)

  const handleTypeChange = (type: ColorType) => {
    setLocalType(type)
    let newData: ColorData = {}

    switch (type) {
      case 'solid':
        newData = { color: '#FF6B6B' }
        break
      case 'gradient':
        newData = { from: '#FF6B6B', to: '#4ECDC4', direction: 'horizontal' }
        break
      case 'duo':
        newData = { primary: '#FF6B6B', secondary: '#FFFFFF', ratio: 50 }
        break
      case 'rainbow':
        newData = { colors: ['#FF6B6B', '#FFA07A', '#FFD700', '#98D8C8', '#6495ED', '#DDA0DD'] }
        break
    }

    setLocalData(newData)
    onColorTypeChange(type)
    onColorDataChange(newData)
  }

  const handleDataChange = (updates: Partial<ColorData>) => {
    const newData = { ...localData, ...updates }
    setLocalData(newData)
    onColorDataChange(newData)
  }

  const addRainbowColor = () => {
    const colors = localData.colors || []
    handleDataChange({ colors: [...colors, '#000000'] })
  }

  const removeRainbowColor = (index: number) => {
    const colors = localData.colors || []
    handleDataChange({ colors: colors.filter((_, i) => i !== index) })
  }

  const updateRainbowColor = (index: number, color: string) => {
    const colors = [...(localData.colors || [])]
    colors[index] = color
    handleDataChange({ colors })
  }

  return (
    <div className="space-y-4">
      <Label>Tipo de Cor</Label>
      <Tabs value={localType} onValueChange={(v) => handleTypeChange(v as ColorType)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="solid">Sólida</TabsTrigger>
          <TabsTrigger value="gradient">Gradiente</TabsTrigger>
          <TabsTrigger value="duo">Duo</TabsTrigger>
          <TabsTrigger value="rainbow">Rainbow</TabsTrigger>
        </TabsList>

        {/* Solid Color */}
        <TabsContent value="solid" className="space-y-4">
          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={localData.color || '#FF6B6B'}
                onChange={(e) => handleDataChange({ color: e.target.value })}
                className="h-10 w-14 cursor-pointer rounded border"
              />
              <Input
                value={localData.color || '#FF6B6B'}
                onChange={(e) => handleDataChange({ color: e.target.value })}
                placeholder="#FF6B6B"
                pattern="^#[0-9A-Fa-f]{6}$"
                className="font-mono"
              />
            </div>
            {/* Preview */}
            <div
              className="h-20 rounded-md border"
              style={{ backgroundColor: localData.color || '#FF6B6B' }}
            />
          </div>
        </TabsContent>

        {/* Gradient */}
        <TabsContent value="gradient" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>De</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={localData.from || '#FF6B6B'}
                  onChange={(e) => handleDataChange({ from: e.target.value })}
                  className="h-10 w-14 cursor-pointer rounded border"
                />
                <Input
                  value={localData.from || '#FF6B6B'}
                  onChange={(e) => handleDataChange({ from: e.target.value })}
                  placeholder="#FF6B6B"
                  className="font-mono text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Para</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={localData.to || '#4ECDC4'}
                  onChange={(e) => handleDataChange({ to: e.target.value })}
                  className="h-10 w-14 cursor-pointer rounded border"
                />
                <Input
                  value={localData.to || '#4ECDC4'}
                  onChange={(e) => handleDataChange({ to: e.target.value })}
                  placeholder="#4ECDC4"
                  className="font-mono text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Direção</Label>
            <select
              value={localData.direction || 'horizontal'}
              onChange={(e) =>
                handleDataChange({ direction: e.target.value as 'horizontal' | 'vertical' | 'diagonal' })
              }
              className="w-full rounded-md border border-neutral-300 px-3 py-2"
            >
              <option value="horizontal">Horizontal</option>
              <option value="vertical">Vertical</option>
              <option value="diagonal">Diagonal</option>
            </select>
          </div>

          {/* Preview */}
          <div
            className="h-20 rounded-md border"
            style={{
              background: `linear-gradient(${
                localData.direction === 'vertical'
                  ? 'to bottom'
                  : localData.direction === 'diagonal'
                  ? 'to bottom right'
                  : 'to right'
              }, ${localData.from || '#FF6B6B'}, ${localData.to || '#4ECDC4'})`,
            }}
          />
        </TabsContent>

        {/* Duo */}
        <TabsContent value="duo" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cor Primária</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={localData.primary || '#FF6B6B'}
                  onChange={(e) => handleDataChange({ primary: e.target.value })}
                  className="h-10 w-14 cursor-pointer rounded border"
                />
                <Input
                  value={localData.primary || '#FF6B6B'}
                  onChange={(e) => handleDataChange({ primary: e.target.value })}
                  placeholder="#FF6B6B"
                  className="font-mono text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cor Secundária</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={localData.secondary || '#FFFFFF'}
                  onChange={(e) => handleDataChange({ secondary: e.target.value })}
                  className="h-10 w-14 cursor-pointer rounded border"
                />
                <Input
                  value={localData.secondary || '#FFFFFF'}
                  onChange={(e) => handleDataChange({ secondary: e.target.value })}
                  placeholder="#FFFFFF"
                  className="font-mono text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Proporção (%)</Label>
            <Input
              type="number"
              value={localData.ratio || 50}
              onChange={(e) => handleDataChange({ ratio: parseInt(e.target.value) })}
              min="0"
              max="100"
            />
          </div>

          {/* Preview */}
          <div className="h-20 rounded-md border overflow-hidden flex">
            <div
              style={{
                backgroundColor: localData.primary || '#FF6B6B',
                width: `${localData.ratio || 50}%`,
              }}
            />
            <div
              style={{
                backgroundColor: localData.secondary || '#FFFFFF',
                width: `${100 - (localData.ratio || 50)}%`,
              }}
            />
          </div>
        </TabsContent>

        {/* Rainbow */}
        <TabsContent value="rainbow" className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Cores</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addRainbowColor}
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Cor
              </Button>
            </div>

            {(localData.colors || []).map((color, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => updateRainbowColor(index, e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded border"
                />
                <Input
                  value={color}
                  onChange={(e) => updateRainbowColor(index, e.target.value)}
                  placeholder="#000000"
                  className="font-mono flex-1"
                />
                {(localData.colors || []).length > 2 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removeRainbowColor(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Preview */}
          <div
            className="h-20 rounded-md border"
            style={{
              background: `linear-gradient(to right, ${(localData.colors || []).join(', ')})`,
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

