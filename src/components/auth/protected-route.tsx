'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { useCompanyStore } from '@/stores/company-store'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: string[]
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, hasRole, user } = useAuthStore()
  const { company, fetchCompany } = useCompanyStore()
  const [isHydrated, setIsHydrated] = useState(false)

  // Wait for Zustand to hydrate from localStorage
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Check authentication only after hydration
  useEffect(() => {
    if (typeof window === 'undefined' || !isHydrated) return
    
    if (!isAuthenticated) {
      console.log('🔒 ProtectedRoute: Not authenticated, redirecting to login')
      router.push('/login')
    }
  }, [isAuthenticated, router, isHydrated])

  // Fetch company data once
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    if (isAuthenticated && !company && user) {
      fetchCompany()
    }
  }, [isAuthenticated, company, user, fetchCompany])

  // Show loading while hydrating
  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    )
  }

  // Don't render anything while checking auth
  if (!isAuthenticated) {
    return null
  }

  // Check roles - only check, don't redirect
  if (requiredRoles && requiredRoles.length > 0 && !hasRole(requiredRoles)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            Acesso Negado
          </h1>
          <p className="text-neutral-600">
            Você não tem permissão para acessar esta página.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

