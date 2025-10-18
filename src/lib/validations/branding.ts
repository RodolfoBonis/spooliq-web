import { z } from 'zod'

const hexColorRegex = /^#[0-9A-Fa-f]{6}$/

export const brandingSchema = z.object({
  template_name: z.string().optional(),
  header_bg_color: z.string().regex(hexColorRegex, 'Deve ser uma cor HEX válida (#RRGGBB)'),
  header_text_color: z.string().regex(hexColorRegex, 'Deve ser uma cor HEX válida (#RRGGBB)'),
  primary_color: z.string().regex(hexColorRegex, 'Deve ser uma cor HEX válida (#RRGGBB)'),
  primary_text_color: z.string().regex(hexColorRegex, 'Deve ser uma cor HEX válida (#RRGGBB)'),
  secondary_color: z.string().regex(hexColorRegex, 'Deve ser uma cor HEX válida (#RRGGBB)'),
  secondary_text_color: z.string().regex(hexColorRegex, 'Deve ser uma cor HEX válida (#RRGGBB)'),
  title_color: z.string().regex(hexColorRegex, 'Deve ser uma cor HEX válida (#RRGGBB)'),
  body_text_color: z.string().regex(hexColorRegex, 'Deve ser uma cor HEX válida (#RRGGBB)'),
  accent_color: z.string().regex(hexColorRegex, 'Deve ser uma cor HEX válida (#RRGGBB)'),
  border_color: z.string().regex(hexColorRegex, 'Deve ser uma cor HEX válida (#RRGGBB)'),
  background_color: z.string().regex(hexColorRegex, 'Deve ser uma cor HEX válida (#RRGGBB)'),
  table_header_bg_color: z.string().regex(hexColorRegex, 'Deve ser uma cor HEX válida (#RRGGBB)'),
  table_row_alt_bg_color: z.string().regex(hexColorRegex, 'Deve ser uma cor HEX válida (#RRGGBB)'),
})

export type BrandingFormData = z.infer<typeof brandingSchema>

