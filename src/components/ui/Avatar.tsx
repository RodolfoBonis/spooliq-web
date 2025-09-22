import { User } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface AvatarProps {
  src?: string
  alt?: string
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  fallback?: React.ReactNode
  status?: 'online' | 'offline' | 'away' | 'busy'
}

export const Avatar = ({
  src,
  alt,
  name,
  size = 'md',
  fallback,
  status,
}: AvatarProps) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  }

  const statusColors = {
    online: 'bg-success-500',
    offline: 'bg-gray-400',
    away: 'bg-warning-500',
    busy: 'bg-error-500',
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="relative inline-block">
      <div
        className={cn(
          'rounded-full overflow-hidden bg-gray-200 flex items-center justify-center relative',
          'dark:bg-gray-700',
          sizeClasses[size]
        )}
      >
        {src ? (
          <Image
            src={src}
            alt={alt || name || 'Avatar'}
            fill
            className="object-cover"
          />
        ) : fallback ? (
          fallback
        ) : name ? (
          <span className="font-medium text-gray-600 dark:text-gray-300">
            {getInitials(name)}
          </span>
        ) : (
          <User className="w-1/2 h-1/2 text-gray-400 dark:text-gray-500" />
        )}
      </div>

      {status && (
        <div
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-white dark:border-gray-800',
            statusColors[status],
            {
              'w-2 h-2': size === 'xs' || size === 'sm',
              'w-3 h-3': size === 'md' || size === 'lg',
              'w-4 h-4': size === 'xl' || size === '2xl',
            }
          )}
        />
      )}
    </div>
  )
}