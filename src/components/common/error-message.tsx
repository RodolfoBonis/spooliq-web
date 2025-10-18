'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorMessageProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorMessage({
  title = 'Erro',
  message = 'Ocorreu um erro ao carregar os dados. Por favor, tente novamente.',
  onRetry,
  className,
}: ErrorMessageProps) {
  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <p>{message}</p>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="mt-2"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Tentar Novamente
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}

