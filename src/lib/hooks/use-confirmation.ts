import { useState } from 'react'

export function useConfirmation() {
  const [isOpen, setIsOpen] = useState(false)
  const [onConfirmCallback, setOnConfirmCallback] = useState<(() => void) | null>(null)

  const confirm = (callback: () => void) => {
    setOnConfirmCallback(() => callback)
    setIsOpen(true)
  }

  const handleConfirm = () => {
    if (onConfirmCallback) {
      onConfirmCallback()
    }
    setIsOpen(false)
    setOnConfirmCallback(null)
  }

  const handleCancel = () => {
    setIsOpen(false)
    setOnConfirmCallback(null)
  }

  return {
    isOpen,
    confirm,
    handleConfirm,
    handleCancel,
    setIsOpen,
  }
}

