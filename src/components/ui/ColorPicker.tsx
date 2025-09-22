'use client'

import { useState, useRef } from 'react'
import { Palette } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ColorPickerProps {
  value?: string
  onChange: (color: string) => void
  label?: string
  error?: string
  disabled?: boolean
}

const predefinedColors = [
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FFA500', // Orange
  '#800080', // Purple
  '#FFC0CB', // Pink
  '#A52A2A', // Brown
  '#808080', // Gray
  '#000000', // Black
  '#FFFFFF', // White
  '#FFD700', // Gold
  '#C0C0C0', // Silver
  '#008000', // Dark Green
]

export function ColorPicker({ value = '', onChange, label, error, disabled }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const colorInputRef = useRef<HTMLInputElement>(null)

  const handleColorSelect = (color: string) => {
    onChange(color)
    setIsOpen(false)
  }

  const handleCustomColorClick = () => {
    colorInputRef.current?.click()
  }

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2 border rounded-lg text-left transition-colors',
            'border-gray-300 dark:border-gray-600',
            'bg-white dark:bg-gray-800',
            'hover:border-gray-400 dark:hover:border-gray-500',
            'focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500',
            disabled && 'opacity-50 cursor-not-allowed',
            error && 'border-red-500 dark:border-red-500'
          )}
        >
          <div
            className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 flex-shrink-0"
            style={{ backgroundColor: value || '#transparent' }}
          />
          <span className="text-sm text-gray-900 dark:text-gray-100 flex-1">
            {value || 'Selecionar cor'}
          </span>
          <Palette className="w-4 h-4 text-gray-400" />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10 p-4 w-64">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cores predefinidas
                </p>
                <div className="grid grid-cols-8 gap-2">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleColorSelect(color)}
                      className={cn(
                        'w-6 h-6 rounded border-2 border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform',
                        value === color && 'ring-2 ring-red-500 ring-offset-2'
                      )}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cor personalizada
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCustomColorClick}
                    className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Palette className="w-4 h-4" />
                    Escolher cor
                  </button>
                  <input
                    ref={colorInputRef}
                    type="color"
                    value={value}
                    onChange={handleCustomColorChange}
                    className="w-0 h-0 opacity-0 pointer-events-none"
                  />
                </div>
              </div>

              {value && (
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Valor hexadecimal
                  </p>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="#000000"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Fechar
                </button>
                {value && (
                  <button
                    type="button"
                    onClick={() => handleColorSelect('')}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-700"
                  >
                    Limpar
                  </button>
                )}
              </div>
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