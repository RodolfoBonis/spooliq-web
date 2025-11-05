'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ShieldCheck, Building2, CreditCard, ArrowLeft, Crown } from 'lucide-react'
import { Toaster } from 'sonner'

const queryClient = new QueryClient()

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user } = useAuthStore()

  useEffect(() => {
    // Only PlatformAdmin can access admin pages
    if (user && !user.roles.includes('PlatformAdmin')) {
      router.push('/dashboard')
    }
  }, [user, router])

  if (!user || !user.roles.includes('PlatformAdmin')) {
    return null // Will redirect
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-neutral-50">
        {/* Admin Header */}
        <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para Dashboard
                </Button>
              </Link>
              <div className="h-6 w-px bg-neutral-200" />
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-purple-600" />
                <span className="font-semibold text-neutral-900">Admin Platform</span>
              </div>
            </div>
            
            <nav className="flex items-center space-x-2">
              <Link href="/admin/companies">
                <Button variant="ghost" size="sm">
                  <Building2 className="mr-2 h-4 w-4" />
                  Empresas & Assinaturas
                </Button>
              </Link>
              <Link href="/admin/plans">
                <Button variant="ghost" size="sm">
                  <Crown className="mr-2 h-4 w-4" />
                  Planos
                </Button>
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="container py-6">{children}</main>
      </div>
      <Toaster />
    </QueryClientProvider>
  )
}

