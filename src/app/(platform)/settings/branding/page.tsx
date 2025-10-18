'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { TemplateGallery } from '@/components/branding/template-gallery'
import { ColorEditor } from '@/components/branding/color-editor'
import { useBranding, useBrandingTemplates, useUpdateBranding } from '@/lib/hooks/use-branding'
import type { CompanyBrandingColors, BrandingTemplate } from '@/services/branding-service'
import { Palette, Save } from 'lucide-react'

export default function BrandingPage() {
  const { data: branding, isLoading: isLoadingBranding } = useBranding()
  const { data: templates, isLoading: isLoadingTemplates } = useBrandingTemplates()
  const { mutate: updateBranding, isPending } = useUpdateBranding()

  const [currentColors, setCurrentColors] = useState<CompanyBrandingColors | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  // Initialize current colors when branding loads
  useEffect(() => {
    if (branding && !currentColors) {
      const { id, organization_id, created_at, updated_at, ...colors } = branding
      setCurrentColors(colors)
    }
  }, [branding, currentColors])

  // Track changes
  useEffect(() => {
    if (branding && currentColors) {
      const { id, organization_id, created_at, updated_at, ...originalColors } = branding
      setHasChanges(JSON.stringify(originalColors) !== JSON.stringify(currentColors))
    }
  }, [branding, currentColors])

  const handleApplyTemplate = (template: BrandingTemplate) => {
    setCurrentColors(template.colors)
  }

  const handleSave = () => {
    if (currentColors) {
      updateBranding(currentColors)
    }
  }

  const handleReset = () => {
    if (branding) {
      const { id, organization_id, created_at, updated_at, ...colors } = branding
      setCurrentColors(colors)
    }
  }

  if (isLoadingBranding || isLoadingTemplates) {
    return (
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!currentColors) {
    return (
      <div className="container py-6">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-neutral-600">Erro ao carregar configurações de branding.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-2">
            <Palette className="h-8 w-8 text-primary-500" />
            Personalização do PDF
          </h1>
          <p className="text-neutral-600 mt-1">
            Customize as cores dos orçamentos em PDF gerados para seus clientes
          </p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isPending}
            >
              Cancelar
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={isPending || !hasChanges}
            className="bg-primary-500 hover:bg-primary-600"
          >
            <Save className="mr-2 h-4 w-4" />
            {isPending ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>

      {hasChanges && (
        <Card className="border-primary-200 bg-primary-50">
          <CardContent className="p-4">
            <p className="text-sm text-primary-700">
              ⚠️ Você tem alterações não salvas. Clique em "Salvar Alterações" para aplicá-las.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">Templates Pré-definidos</TabsTrigger>
          <TabsTrigger value="custom">Personalizado</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Escolha um Template</CardTitle>
              <CardDescription>
                Selecione um dos nossos templates profissionais para começar
              </CardDescription>
            </CardHeader>
            <CardContent>
              {templates && templates.length > 0 ? (
                <TemplateGallery
                  templates={templates}
                  selectedTemplate={currentColors.template_name}
                  onSelectTemplate={handleApplyTemplate}
                />
              ) : (
                <p className="text-neutral-500 text-center py-8">
                  Nenhum template disponível
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Editor de Cores</CardTitle>
              <CardDescription>
                Personalize cada cor do PDF individualmente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ColorEditor colors={currentColors} onChange={setCurrentColors} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Info Card */}
      <Card className="bg-neutral-50 border-neutral-200">
        <CardContent className="p-4">
          <h3 className="font-medium text-neutral-900 mb-2">💡 Dica</h3>
          <p className="text-sm text-neutral-600">
            As cores personalizadas serão aplicadas automaticamente em todos os PDFs de orçamento gerados.
            Você pode alterá-las a qualquer momento.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

