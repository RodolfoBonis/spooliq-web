import type { Metadata } from 'next'
import './fonts.css'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'SpoolIQ - Gerenciamento de Orçamentos 3D',
  description: 'Plataforma completa para gerenciamento de orçamentos de impressão 3D',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}

