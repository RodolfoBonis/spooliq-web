'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { BrandingTemplate } from '@/services/branding-service'
import { Check } from 'lucide-react'

interface TemplateGalleryProps {
  templates: BrandingTemplate[]
  selectedTemplate?: string
  onSelectTemplate: (template: BrandingTemplate) => void
}

export function TemplateGallery({
  templates,
  selectedTemplate,
  onSelectTemplate,
}: TemplateGalleryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {templates.map((template) => (
        <Card
          key={template.name}
          className={cn(
            'cursor-pointer transition-all hover:shadow-lg relative',
            selectedTemplate === template.name && 'ring-2 ring-primary-500'
          )}
          onClick={() => onSelectTemplate(template)}
        >
          {selectedTemplate === template.name && (
            <div className="absolute top-2 right-2 bg-primary-500 text-white rounded-full p-1">
              <Check className="h-4 w-4" />
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-base">{template.display_name}</CardTitle>
            <CardDescription className="text-xs">{template.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Color preview circles */}
            <div className="flex gap-2">
              <div
                className="w-10 h-10 rounded-full border-2 border-neutral-200"
                style={{ backgroundColor: template.colors.primary_color }}
                title="Cor Primária"
              />
              <div
                className="w-10 h-10 rounded-full border-2 border-neutral-200"
                style={{ backgroundColor: template.colors.secondary_color }}
                title="Cor Secundária"
              />
              <div
                className="w-10 h-10 rounded-full border-2 border-neutral-200"
                style={{ backgroundColor: template.colors.accent_color }}
                title="Cor de Destaque"
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

