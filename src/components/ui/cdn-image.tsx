'use client'

import { useState } from 'react'
import Image from 'next/image'

interface CDNImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fill?: boolean
  priority?: boolean
  fallback?: React.ReactNode
}

// CDNImage renders an asset served by the public cdn edge (assets.spooliq.com). Images are public
// now, so we render the URL directly — no /api/cdn proxy, no rb-auth M2M token.
export function CDNImage({
  src,
  alt,
  width,
  height,
  className,
  fill,
  priority,
  fallback,
}: CDNImageProps) {
  const [error, setError] = useState(false)

  if (!src || error) {
    if (fallback) {
      return <>{fallback}</>
    }
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center ${className ?? ''}`}
        style={!fill && width && height ? { width, height } : undefined}
      >
        <span className="text-gray-400 text-xs">—</span>
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      fill={fill}
      priority={priority}
      onError={() => setError(true)}
    />
  )
}
