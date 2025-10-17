'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, X, Sparkles } from 'lucide-react'
import type { ColorType, ColorData, GradientStop } from '@/types/models'
import { generateColorName } from '@/lib/utils/color-names'

interface ColorPickerProps {
  colorType: ColorType
  colorData: ColorData
  colorName?: string
  onColorTypeChange: (type: ColorType) => void
  onColorDataChange: (data: ColorData) => void
  onColorNameChange?: (name: string) => void
}

export function ColorPicker({ 
  colorType, 
  colorData, 
  colorName = '',
  onColorTypeChange, 
  onColorDataChange,
  onColorNameChange 
}: ColorPickerProps) {
  const [localType, setLocalType] = useState<ColorType>(colorType)
  const [localData, setLocalData] = useState<ColorData>(colorData)
  const [localName, setLocalName] = useState<string>(colorName)
  
  // Auto-generate color name when color data changes
  useEffect(() => {
    const generatedName = generateColorName(localType, localData)
    setLocalName(generatedName)
    if (onColorNameChange) {
      onColorNameChange(generatedName)
    }
  }, [localType, localData, onColorNameChange])

  const handleTypeChange = (type: ColorType) => {
    setLocalType(type)
    let newData: ColorData = {}

    switch (type) {
      case 'solid':
        newData = { color: '#FF6B6B' }
        break
      case 'gradient':
        newData = { 
          direction: '90deg',
          colors: [
            { color: '#FF6B6B', position: 0 },
            { color: '#4ECDC4', position: 100 }
          ]
        }
        break
      case 'duo':
        newData = { 
          primary: '#FF6B6B', 
          secondary: '#FFFFFF', 
          pattern: 'stripes',
          ratio: 0.5 
        }
        break
      case 'rainbow':
        newData = { 
          intensity: 1.0,
          saturation: 1.0,
          direction: '90deg',
          repetitions: 1
        }
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

  // Gradient helpers
  const addGradientStop = () => {
    const colors = localData.colors || []
    const newStop: GradientStop = { 
      color: '#000000', 
      position: colors.length > 0 ? 100 : 0 
    }
    handleDataChange({ colors: [...colors, newStop] })
  }

  const removeGradientStop = (index: number) => {
    const colors = localData.colors || []
    handleDataChange({ colors: colors.filter((_, i) => i !== index) })
  }

  const updateGradientStop = (index: number, updates: Partial<GradientStop>) => {
    const colors = [...(localData.colors || [])]
    colors[index] = { ...colors[index], ...updates }
    handleDataChange({ colors })
  }

  return (
    <div className="space-y-4">
      {/* Auto-generated Color Name */}
      <div className="rounded-lg bg-accent-50 border border-accent-200 p-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent-600" />
          <Label className="text-sm font-medium text-accent-900">Nome da Cor (Gerado Automaticamente)</Label>
        </div>
        <p className="text-lg font-semibold text-accent-700 mt-1">{localName || 'Selecione uma cor'}</p>
      </div>

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
                type="text"
                value={localData.color || '#FF6B6B'}
                onChange={(e) => handleDataChange({ color: e.target.value })}
                placeholder="#FF6B6B"
                pattern="^#[0-9A-Fa-f]{6}$"
                className="max-w-[120px] font-mono"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div
              className="h-20 w-full rounded-md border border-neutral-200"
              style={{ backgroundColor: localData.color }}
            />
          </div>
        </TabsContent>

        {/* Gradient Color */}
        <TabsContent value="gradient" className="space-y-4">
          <div className="space-y-2">
            <Label>Direção</Label>
            <Select
              value={localData.direction || '90deg'}
              onValueChange={(value) => handleDataChange({ direction: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="90deg">Horizontal (→)</SelectItem>
                <SelectItem value="180deg">Vertical (↓)</SelectItem>
                <SelectItem value="45deg">Diagonal (↘)</SelectItem>
                <SelectItem value="135deg">Diagonal (↗)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Cores do Gradiente</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addGradientStop}
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Cor
              </Button>
            </div>

            {(localData.colors || []).map((stop, index) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-neutral-50 rounded-lg">
                <input
                  type="color"
                  value={stop.color}
                  onChange={(e) => updateGradientStop(index, { color: e.target.value })}
                  className="h-10 w-14 cursor-pointer rounded border"
                />
                <Input
                  type="text"
                  value={stop.color}
                  onChange={(e) => updateGradientStop(index, { color: e.target.value })}
                  placeholder="#000000"
                  className="max-w-[100px] font-mono text-sm"
                />
                <Input
                  type="number"
                  value={stop.position}
                  onChange={(e) => updateGradientStop(index, { position: parseFloat(e.target.value) })}
                  min="0"
                  max="100"
                  step="1"
                  className="max-w-[80px]"
                />
                <span className="text-sm text-neutral-500">%</span>
                {(localData.colors?.length || 0) > 2 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removeGradientStop(index)}
                  >
                    <X className="h-4 w-4 text-error" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div
              className="h-20 w-full rounded-md border border-neutral-200"
              style={{
                background: `linear-gradient(${localData.direction || '90deg'}, ${
                  (localData.colors || [])
                    .map((stop) => `${stop.color} ${stop.position}%`)
                    .join(', ')
                })`
              }}
            />
          </div>
        </TabsContent>

        {/* Duo Color */}
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
                  type="text"
                  value={localData.primary || '#FF6B6B'}
                  onChange={(e) => handleDataChange({ primary: e.target.value })}
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
                  type="text"
                  value={localData.secondary || '#FFFFFF'}
                  onChange={(e) => handleDataChange({ secondary: e.target.value })}
                  className="font-mono text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Padrão</Label>
            <Select
              value={localData.pattern || 'stripes'}
              onValueChange={(value) => handleDataChange({ pattern: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stripes">Listras</SelectItem>
                <SelectItem value="spots">Pontos</SelectItem>
                <SelectItem value="random">Aleatório</SelectItem>
                <SelectItem value="marbled">Mármore</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Proporção Primária ({Math.round((localData.ratio || 0.5) * 100)}%)</Label>
            <input
              type="range"
              min="10"
              max="90"
              step="5"
              value={(localData.ratio || 0.5) * 100}
              onChange={(e) => handleDataChange({ ratio: parseFloat(e.target.value) / 100 })}
              className="w-full"
            />
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div
              className="h-20 w-full rounded-md border border-neutral-200"
              style={{
                background:
                  localData.pattern === 'stripes'
                    ? `linear-gradient(90deg, ${localData.primary} ${(localData.ratio || 0.5) * 100}%, ${localData.secondary} ${(localData.ratio || 0.5) * 100}%)`
                    : localData.pattern === 'spots'
                    ? `radial-gradient(circle, ${localData.primary} 30%, ${localData.secondary} 30%)`
                    : localData.pattern === 'marbled'
                    ? `linear-gradient(45deg, ${localData.primary} 0%, ${localData.secondary} 25%, ${localData.primary} 50%, ${localData.secondary} 75%, ${localData.primary} 100%)`
                    : `linear-gradient(45deg, ${localData.primary} ${(localData.ratio || 0.5) * 100}%, ${localData.secondary} ${(localData.ratio || 0.5) * 100}%)`
              }}
            />
          </div>
        </TabsContent>

        {/* Rainbow Color */}
        <TabsContent value="rainbow" className="space-y-4">
          <div className="space-y-2">
            <Label>Direção</Label>
            <Select
              value={localData.direction || '90deg'}
              onValueChange={(value) => handleDataChange({ direction: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="90deg">Horizontal (→)</SelectItem>
                <SelectItem value="180deg">Vertical (↓)</SelectItem>
                <SelectItem value="45deg">Diagonal (↘)</SelectItem>
                <SelectItem value="135deg">Diagonal (↗)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Intensidade ({Math.round((localData.intensity || 1.0) * 100)}%)</Label>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={(localData.intensity || 1.0) * 100}
              onChange={(e) => handleDataChange({ intensity: parseFloat(e.target.value) / 100 })}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Saturação ({Math.round((localData.saturation || 1.0) * 100)}%)</Label>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={(localData.saturation || 1.0) * 100}
              onChange={(e) => handleDataChange({ saturation: parseFloat(e.target.value) / 100 })}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Repetições</Label>
            <Select
              value={String(localData.repetitions || 1)}
              onValueChange={(value) => handleDataChange({ repetitions: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}x
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div
              className="h-20 w-full rounded-md border border-neutral-200"
              style={{
                background: `linear-gradient(${localData.direction || '90deg'}, #ff0000 0%, #ff8000 8.33%, #ffff00 16.66%, #80ff00 25%, #00ff00 33.33%, #00ff80 41.66%, #00ffff 50%, #0080ff 58.33%, #0000ff 66.66%, #8000ff 75%, #ff00ff 83.33%, #ff0080 91.66%, #ff0000 100%)`
              }}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
