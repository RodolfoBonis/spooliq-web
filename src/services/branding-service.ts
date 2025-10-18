import { api } from '@/lib/api/client'

export interface CompanyBrandingColors {
  template_name?: string
  header_bg_color: string
  header_text_color: string
  primary_color: string
  primary_text_color: string
  secondary_color: string
  secondary_text_color: string
  title_color: string
  body_text_color: string
  accent_color: string
  border_color: string
  background_color: string
  table_header_bg_color: string
  table_row_alt_bg_color: string
}

export interface CompanyBrandingEntity extends CompanyBrandingColors {
  id: string
  organization_id: string
  created_at: string
  updated_at: string
}

export interface BrandingTemplate {
  name: string
  display_name: string
  description: string
  colors: CompanyBrandingColors
}

export const brandingService = {
  async get(): Promise<CompanyBrandingEntity> {
    const { data } = await api.get<{ branding: CompanyBrandingEntity }>('/company/branding')
    return data.branding
  },

  async update(colors: CompanyBrandingColors): Promise<CompanyBrandingEntity> {
    const { data } = await api.put<{ branding: CompanyBrandingEntity }>('/company/branding', colors)
    return data.branding
  },

  async listTemplates(): Promise<BrandingTemplate[]> {
    const { data } = await api.get<{ templates: BrandingTemplate[] }>('/company/branding/templates')
    return data.templates
  },
}

