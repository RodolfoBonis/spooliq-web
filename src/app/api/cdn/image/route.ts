import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get('url')

    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      )
    }

    // Validate URL to prevent SSRF attacks
    const parsedUrl = new URL(url)
    const allowedHosts = [
      'rb-cdn.rodolfodebonis.com.br',
      'localhost',
    ]

    if (!allowedHosts.includes(parsedUrl.hostname)) {
      return NextResponse.json(
        { error: 'URL host not allowed' },
        { status: 403 }
      )
    }

    // Fetch image from CDN with API key
    const response = await fetch(url, {
      headers: {
        'X-API-KEY': process.env.CDN_API_KEY || '',
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch image from CDN', status: response.status },
        { status: response.status }
      )
    }

    // Get the image blob
    const blob = await response.blob()

    // Return the image with appropriate headers
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('CDN Image Proxy Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
