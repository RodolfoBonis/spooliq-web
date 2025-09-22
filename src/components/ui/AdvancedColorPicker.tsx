'use client'

import { useState, useRef, useMemo, useEffect } from 'react'
import { Palette, Paintbrush, Sparkles, CircleDot, Minus, Plus, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ColorType, ColorData, SolidColor, GradientColor, DuoColor, RainbowColor } from '@/types/api'
import { generateColorPreview } from '@/lib/color-utils'

interface AdvancedColorPickerProps {
  value?: ColorData
  onChange: (color: ColorData) => void
  label?: string
  error?: string
  disabled?: boolean
}

const predefinedColors = [
  '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
  '#FFA500', '#800080', '#FFC0CB', '#A52A2A', '#808080', '#000000',
  '#FFFFFF', '#FFD700', '#C0C0C0', '#008000', '#4CAF50', '#2196F3'
]

const duoColorPatterns = [
  { value: 'mixed', label: 'Misturado', icon: '🌀' },
  { value: 'alternating', label: 'Alternado', icon: '🔄' },
  { value: 'spiral', label: 'Espiral', icon: '🌪️' }
] as const

export function AdvancedColorPicker({
  value,
  onChange,
  label,
  error,
  disabled
}: AdvancedColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<ColorType>('solid')
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const colorInputRef = useRef<HTMLInputElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Initialize default values based on current value or fallback
  const currentColor = useMemo(() => {
    if (value) return value
    return { type: 'solid', color: '#FF0000' } as SolidColor
  }, [value])

  // Calculate dropdown position
  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const dropdownHeight = 500 // Estimated height of the dropdown

      // Check if dropdown would go outside viewport
      const spaceBelow = viewportHeight - rect.bottom
      const shouldRenderAbove = spaceBelow < dropdownHeight && rect.top > dropdownHeight

      setPosition({
        top: shouldRenderAbove ? rect.top - dropdownHeight - 4 : rect.bottom + 4,
        left: Math.max(8, Math.min(rect.left, window.innerWidth - 400)) // 400 = dropdown width + margin
      })
    }
  }

  // Handle opening dropdown
  const handleOpen = () => {
    updatePosition()
    setIsOpen(!isOpen)
  }

  // Handle scroll and resize events
  useEffect(() => {
    if (isOpen) {
      const handleScroll = () => {
        // Close dropdown on scroll for better UX
        setIsOpen(false)
      }

      const handleResize = () => {
        updatePosition()
      }

      // Use throttled scroll for better performance
      let scrollTimeout: NodeJS.Timeout
      const throttledScroll = () => {
        clearTimeout(scrollTimeout)
        scrollTimeout = setTimeout(handleScroll, 10)
      }

      window.addEventListener('scroll', throttledScroll, true)
      window.addEventListener('resize', handleResize)

      return () => {
        window.removeEventListener('scroll', throttledScroll, true)
        window.removeEventListener('resize', handleResize)
        clearTimeout(scrollTimeout)
      }
    }
  }, [isOpen])

  // Close on outside click
  useEffect(() => {
    if (isOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current &&
          !buttonRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])


  const handleSolidColorChange = (color: string) => {
    const newColor: SolidColor = { type: 'solid', color }
    onChange(newColor)
  }

  const handleGradientChange = (updates: Partial<GradientColor>) => {
    const current = currentColor.type === 'gradient' ? currentColor : {
      type: 'gradient' as const,
      direction: 90,
      stops: [
        { color: '#FF0000', position: 0 },
        { color: '#0000FF', position: 100 }
      ]
    }
    const newGradient: GradientColor = { ...current, ...updates }
    onChange(newGradient)
  }

  const handleDuoColorChange = (updates: Partial<DuoColor>) => {
    const current = currentColor.type === 'duo' ? currentColor : {
      type: 'duo' as const,
      primary: '#FF0000',
      secondary: '#0000FF',
      pattern: 'mixed' as const
    }
    const newDuoColor: DuoColor = { ...current, ...updates }
    onChange(newDuoColor)
  }

  const handleRainbowChange = (updates: Partial<RainbowColor>) => {
    const current = currentColor.type === 'rainbow' ? currentColor : {
      type: 'rainbow' as const,
      saturation: 70,
      lightness: 50
    }
    const newRainbow: RainbowColor = { ...current, ...updates }
    onChange(newRainbow)
  }

  const addGradientStop = () => {
    if (currentColor.type === 'gradient') {
      const stops = [...currentColor.stops]
      const newPosition = stops.length > 0 ?
        Math.min(100, Math.max(...stops.map(s => s.position)) + 20) : 50
      stops.push({ color: '#FF0000', position: newPosition })
      stops.sort((a, b) => a.position - b.position)
      handleGradientChange({ stops })
    }
  }

  const removeGradientStop = (index: number) => {
    if (currentColor.type === 'gradient' && currentColor.stops.length > 2) {
      const stops = currentColor.stops.filter((_, i) => i !== index)
      handleGradientChange({ stops })
    }
  }

  const updateGradientStop = (index: number, updates: Partial<{ color: string; position: number }>) => {
    if (currentColor.type === 'gradient') {
      const stops = [...currentColor.stops]
      stops[index] = { ...stops[index], ...updates }
      stops.sort((a, b) => a.position - b.position)
      handleGradientChange({ stops })
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'solid':
        const solidColor = currentColor.type === 'solid' ? currentColor.color : '#FF0000'
        return (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Cores predefinidas
              </p>
              <div className="grid grid-cols-6 gap-2">
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleSolidColorChange(color)}
                    className={cn(
                      'w-8 h-8 rounded border-2 border-slate-300 dark:border-slate-600 hover:scale-110 transition-transform',
                      solidColor === color && 'ring-2 ring-red-500 ring-offset-2'
                    )}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Cor personalizada
              </p>
              <div className="flex gap-2">
                <input
                  ref={colorInputRef}
                  type="color"
                  value={solidColor}
                  onChange={(e) => handleSolidColorChange(e.target.value)}
                  className="w-16 h-10 rounded border border-slate-300 dark:border-slate-600 cursor-pointer"
                />
                <input
                  type="text"
                  value={solidColor}
                  onChange={(e) => handleSolidColorChange(e.target.value)}
                  placeholder="#000000"
                  className="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>
        )

      case 'gradient':
        const gradient = currentColor.type === 'gradient' ? currentColor : {
          type: 'gradient' as const,
          direction: 90,
          stops: [
            { color: '#FF0000', position: 0 },
            { color: '#0000FF', position: 100 }
          ]
        }
        return (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Direção do Gradiente
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={gradient.direction}
                  onChange={(e) => handleGradientChange({ direction: parseInt(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-sm text-slate-600 dark:text-slate-400 w-12">
                  {gradient.direction}°
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Pontos de Cor
                </p>
                <button
                  type="button"
                  onClick={addGradientStop}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                >
                  <Plus className="w-3 h-3" />
                  Adicionar
                </button>
              </div>
              <div className="space-y-2">
                {gradient.stops.map((stop, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="color"
                      value={stop.color}
                      onChange={(e) => updateGradientStop(index, { color: e.target.value })}
                      className="w-8 h-8 rounded border border-slate-300 dark:border-slate-600"
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={stop.position}
                      onChange={(e) => updateGradientStop(index, { position: parseInt(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-xs text-slate-600 dark:text-slate-400 w-8">
                      {stop.position}%
                    </span>
                    {gradient.stops.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeGradientStop(index)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'duo':
        const duoColor = currentColor.type === 'duo' ? currentColor : {
          type: 'duo' as const,
          primary: '#FF0000',
          secondary: '#0000FF',
          pattern: 'mixed' as const
        }
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Cor Primária
                </p>
                <input
                  type="color"
                  value={duoColor.primary}
                  onChange={(e) => handleDuoColorChange({ primary: e.target.value })}
                  className="w-full h-10 rounded border border-slate-300 dark:border-slate-600"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Cor Secundária
                </p>
                <input
                  type="color"
                  value={duoColor.secondary}
                  onChange={(e) => handleDuoColorChange({ secondary: e.target.value })}
                  className="w-full h-10 rounded border border-slate-300 dark:border-slate-600"
                />
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Padrão de Mistura
              </p>
              <div className="grid grid-cols-3 gap-2">
                {duoColorPatterns.map((pattern) => (
                  <button
                    key={pattern.value}
                    type="button"
                    onClick={() => handleDuoColorChange({ pattern: pattern.value })}
                    className={cn(
                      'flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-colors',
                      duoColor.pattern === pattern.value
                        ? 'border-red-500 bg-red-50 dark:bg-red-950'
                        : 'border-slate-300 dark:border-slate-600 hover:border-slate-400'
                    )}
                  >
                    <span className="text-lg">{pattern.icon}</span>
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      {pattern.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      case 'rainbow':
        const rainbow = currentColor.type === 'rainbow' ? currentColor : {
          type: 'rainbow' as const,
          saturation: 70,
          lightness: 50
        }
        return (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Saturação
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={rainbow.saturation}
                  onChange={(e) => handleRainbowChange({ saturation: parseInt(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-sm text-slate-600 dark:text-slate-400 w-12">
                  {rainbow.saturation}%
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Luminosidade
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={rainbow.lightness}
                  onChange={(e) => handleRainbowChange({ lightness: parseInt(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-sm text-slate-600 dark:text-slate-400 w-12">
                  {rainbow.lightness}%
                </span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                💡 Filamentos rainbow mudam de cor durante a impressão criando um efeito arco-íris
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const tabs = [
    { id: 'solid' as const, label: 'Sólida', icon: CircleDot },
    { id: 'gradient' as const, label: 'Gradiente', icon: Paintbrush },
    { id: 'duo' as const, label: 'Duo Color', icon: Palette },
    { id: 'rainbow' as const, label: 'Rainbow', icon: Sparkles },
  ]

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={handleOpen}
          disabled={disabled}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2 border rounded-lg text-left transition-colors',
            'border-slate-300 dark:border-slate-600',
            'bg-white dark:bg-slate-800',
            'hover:border-slate-400 dark:hover:border-slate-500',
            'focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500',
            disabled && 'opacity-50 cursor-not-allowed',
            error && 'border-red-500 dark:border-red-500'
          )}
        >
          <div
            className="w-8 h-8 rounded border border-slate-300 dark:border-slate-600 flex-shrink-0"
            style={{ background: generateColorPreview(currentColor) }}
          />
          <div className="flex-1">
            <span className="text-sm text-slate-900 dark:text-slate-100 font-medium">
              {currentColor.type === 'solid' && 'Cor Sólida'}
              {currentColor.type === 'gradient' && 'Gradiente'}
              {currentColor.type === 'duo' && 'Duo Color'}
              {currentColor.type === 'rainbow' && 'Rainbow'}
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {currentColor.type === 'solid' && currentColor.color}
              {currentColor.type === 'gradient' && `${currentColor.stops.length} cores`}
              {currentColor.type === 'duo' && `${currentColor.primary} + ${currentColor.secondary}`}
              {currentColor.type === 'rainbow' && `S:${currentColor.saturation}% L:${currentColor.lightness}%`}
            </p>
          </div>
          <Palette className="w-4 h-4 text-slate-400" />
        </button>

        {isOpen && (
          <div
            ref={dropdownRef}
            className="fixed bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg w-96"
            style={{
              top: position.top,
              left: position.left,
              zIndex: 9999,
              maxHeight: '80vh',
              overflowY: 'auto'
            }}
          >
            {/* Preview */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Prévia
              </p>
              <div
                className="w-full h-16 rounded-lg border border-slate-300 dark:border-slate-600"
                style={{ background: generateColorPreview(currentColor) }}
              />
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200 dark:border-slate-700">
              <div className="flex">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        'flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-colors',
                        activeTab === tab.id
                          ? 'text-red-600 dark:text-red-400 border-b-2 border-red-500'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-4">
              {renderTabContent()}
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center p-4 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  onChange({ type: 'solid', color: '#FF0000' })
                }}
                className="flex items-center gap-1 px-3 py-1 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              >
                <RotateCcw className="w-3 h-3" />
                Resetar
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Aplicar
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}