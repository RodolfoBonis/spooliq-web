'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { CompanyBrandingColors } from '@/services/branding-service'

interface ColorEditorProps {
  colors: CompanyBrandingColors
  onChange: (colors: CompanyBrandingColors) => void
}

interface ColorInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  description?: string
}

function ColorInput({ label, value, onChange, description }: ColorInputProps) {
  return (
    <div className="flex items-center gap-4">
      <Label className="min-w-[140px] text-sm">{label}</Label>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-14 cursor-pointer rounded border border-neutral-300"
      />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#000000"
        pattern="^#[0-9A-Fa-f]{6}$"
        className="max-w-[120px] font-mono text-sm"
      />
      {description && (
        <span className="text-xs text-neutral-500">{description}</span>
      )}
    </div>
  )
}

export function ColorEditor({ colors, onChange }: ColorEditorProps) {
  const updateColor = (key: keyof CompanyBrandingColors, value: string) => {
    onChange({ ...colors, [key]: value })
  }

  return (
    <Accordion type="multiple" className="w-full">
      <AccordionItem value="header">
        <AccordionTrigger>Cores do Cabeçalho</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <ColorInput
              label="Fundo"
              value={colors.header_bg_color}
              onChange={(v) => updateColor('header_bg_color', v)}
              description="Cor de fundo do cabeçalho"
            />
            <ColorInput
              label="Texto"
              value={colors.header_text_color}
              onChange={(v) => updateColor('header_text_color', v)}
              description="Cor do texto no cabeçalho"
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="primary">
        <AccordionTrigger>Cores Primárias</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <ColorInput
              label="Cor Primária"
              value={colors.primary_color}
              onChange={(v) => updateColor('primary_color', v)}
              description="Cor principal do PDF"
            />
            <ColorInput
              label="Texto Primário"
              value={colors.primary_text_color}
              onChange={(v) => updateColor('primary_text_color', v)}
              description="Texto sobre cor primária"
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="secondary">
        <AccordionTrigger>Cores Secundárias</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <ColorInput
              label="Cor Secundária"
              value={colors.secondary_color}
              onChange={(v) => updateColor('secondary_color', v)}
              description="Cor secundária"
            />
            <ColorInput
              label="Texto Secundário"
              value={colors.secondary_text_color}
              onChange={(v) => updateColor('secondary_text_color', v)}
              description="Texto sobre cor secundária"
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="text">
        <AccordionTrigger>Cores de Texto</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <ColorInput
              label="Títulos"
              value={colors.title_color}
              onChange={(v) => updateColor('title_color', v)}
              description="Cor dos títulos"
            />
            <ColorInput
              label="Corpo do Texto"
              value={colors.body_text_color}
              onChange={(v) => updateColor('body_text_color', v)}
              description="Cor do texto principal"
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="accent">
        <AccordionTrigger>Cores de Destaque</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <ColorInput
              label="Cor de Destaque"
              value={colors.accent_color}
              onChange={(v) => updateColor('accent_color', v)}
              description="Cor para elementos destacados"
            />
            <ColorInput
              label="Bordas"
              value={colors.border_color}
              onChange={(v) => updateColor('border_color', v)}
              description="Cor das bordas"
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="background">
        <AccordionTrigger>Cores de Fundo</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <ColorInput
              label="Fundo Principal"
              value={colors.background_color}
              onChange={(v) => updateColor('background_color', v)}
              description="Cor de fundo do PDF"
            />
            <ColorInput
              label="Cabeçalho Tabela"
              value={colors.table_header_bg_color}
              onChange={(v) => updateColor('table_header_bg_color', v)}
              description="Fundo do cabeçalho da tabela"
            />
            <ColorInput
              label="Linhas Alternadas"
              value={colors.table_row_alt_bg_color}
              onChange={(v) => updateColor('table_row_alt_bg_color', v)}
              description="Fundo das linhas alternadas"
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

