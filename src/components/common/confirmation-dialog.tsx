'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  icon?: LucideIcon
  isLoading?: boolean
}

const variantStyles = {
  danger: {
    icon: 'bg-error/10 text-error',
    button: 'bg-error hover:bg-error/90 text-white',
  },
  warning: {
    icon: 'bg-warning/10 text-warning',
    button: 'bg-warning hover:bg-warning/90 text-white',
  },
  info: {
    icon: 'bg-info/10 text-info',
    button: 'bg-info hover:bg-info/90 text-white',
  },
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  icon: Icon,
  isLoading = false,
}: ConfirmationDialogProps) {
  const styles = variantStyles[variant]

  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-start space-x-4">
            {Icon && (
              <div
                className={cn(
                  'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full',
                  styles.icon
                )}
              >
                <Icon className="h-6 w-6" />
              </div>
            )}
            <div className="flex-1 pt-1">
              <AlertDialogTitle className="text-lg font-semibold text-neutral-900">
                {title}
              </AlertDialogTitle>
              <AlertDialogDescription className="mt-2 text-sm text-neutral-600">
                {description}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6">
          <AlertDialogCancel disabled={isLoading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(styles.button)}
          >
            {isLoading ? 'Processando...' : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

