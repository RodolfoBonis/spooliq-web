'use client'

import { useState, useEffect } from 'react'
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

export function CDNImage({ 
  src, 
  alt, 
  width, 
  height, 
  className, 
  fill, 
  priority,
  fallback 
}: CDNImageProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!src) return

    // Clear previous blob URL when src changes
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl)
      setBlobUrl(null)
    }

    const fetchImage = async () => {
      try {
        setLoading(true)
        setError(false)

        // Use API proxy instead of direct CDN access
        const proxyUrl = `/api/cdn/image?url=${encodeURIComponent(src)}`
        const response = await fetch(proxyUrl, {
          cache: 'no-cache', // Force fresh fetch when URL changes
        })

        if (!response.ok) {
          throw new Error('Failed to fetch image')
        }

        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        setBlobUrl(url)
      } catch (err) {
        console.error('Error fetching CDN image:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchImage()

    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl)
      }
    }
  }, [src]) // Remove blobUrl from dependency to avoid infinite loop

  if (loading) {
    return (
      <div 
        className={`bg-gray-200 animate-pulse flex items-center justify-center ${className}`}
        style={!fill && width && height ? { width, height } : undefined}
      >
        <span className="text-gray-400 text-xs">Loading...</span>
      </div>
    )
  }

  if (error || !blobUrl) {
    if (fallback) {
      return <>{fallback}</>
    }
    
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={!fill && width && height ? { width, height } : undefined}
      >
        <span className="text-gray-400 text-xs">Error</span>
      </div>
    )
  }

  return (
    <Image
      src={blobUrl}
      alt={alt}
      width={width}
      height={height}
      className={className}
      fill={fill}
      priority={priority}
    />
  )
}