import { NextRequest, NextResponse } from 'next/server'
import { validateOrigin, unauthorizedOriginResponse } from '@/lib/api/origin-validator'
import { RbAuthenticator } from '@rblab/rb_auth_client'

const ALLOWED_HOSTS = [
  'rb-cdn.rodolfodebonis.com.br',
  'localhost',
]

const CONTENT_TYPES: Record<string, string> = {
  '.stl': 'application/octet-stream',
  '.3mf': 'application/vnd.ms-package.3dmanufacturing-3dmodel+xml',
}

export async function GET(request: NextRequest) {
  if (!validateOrigin(request)) {
    return unauthorizedOriginResponse()
  }

  try {
    const url = request.nextUrl.searchParams.get('url')

    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
    }

    const parsedUrl = new URL(url)

    if (!ALLOWED_HOSTS.includes(parsedUrl.hostname)) {
      return NextResponse.json({ error: 'URL host not allowed' }, { status: 403 })
    }

    const rbAuth = new RbAuthenticator({
      clientID: process.env.CLIENT_ID || '',
      clientSecret: process.env.CLIENT_SECRET || '',
    })

    const token = await rbAuth.getToken()

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch file from CDN', status: response.status },
        { status: response.status }
      )
    }

    const blob = await response.blob()

    // Determine content type from file extension
    const ext = '.' + parsedUrl.pathname.split('.').pop()?.toLowerCase()
    const contentType = CONTENT_TYPES[ext] || 'application/octet-stream'

    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('CDN Model Proxy Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
