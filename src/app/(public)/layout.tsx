import type { Metadata } from 'next'
import { PublicQueryProvider } from '@/components/public/public-query-provider'

export const metadata: Metadata = {
  title: 'Orçamento | SpoolIQ',
  description: 'Visualize e responda ao seu orçamento de impressão 3D.',
  robots: { index: false, follow: false },
}

/**
 * Public route group layout: no sidebar, no auth guard. Renders only the minimal
 * React Query provider so unauthenticated visitors can view and respond to a budget.
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <PublicQueryProvider>
      <div className="min-h-screen bg-neutral-50">{children}</div>
    </PublicQueryProvider>
  )
}
