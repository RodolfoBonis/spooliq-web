import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/v1'
const API_BASE = new URL(API_BASE_URL)
const API_ORIGIN = `${API_BASE.protocol}//${API_BASE.host}`

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'GET')
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'POST')
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'PUT')
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'PATCH')
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'DELETE')
}

async function proxyRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  try {
    // Reconstruct the path with trailing slash preserved
    const path = pathSegments.join('/')
    const hasTrailingSlash = request.nextUrl.pathname.endsWith('/')
    const targetPath = hasTrailingSlash ? `${path}/` : path
    
    const targetUrl = `${API_BASE_URL}/${targetPath}${request.nextUrl.search}`
    
    console.log('🔄 Proxy Request:', method, targetUrl)

    // Forward all headers except host
    const headers = new Headers()
    request.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'host') {
        headers.set(key, value)
      }
    })

    // Get request body if present
    let body: any = undefined
    if (method !== 'GET' && method !== 'HEAD') {
      const contentType = request.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        body = JSON.stringify(await request.json())
      } else if (contentType?.includes('multipart/form-data')) {
        body = await request.formData()
      } else {
        body = await request.text()
      }
    }

    // Make the proxied request (handle redirects manually to avoid leaking relative locations to the browser)
    let response = await fetch(targetUrl, {
      method,
      headers,
      body,
      redirect: 'manual',
    })

    // If backend responds with a redirect that uses a relative Location like "/v1/...",
    // follow it server-side and return the final response to the browser
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location') || ''
      if (location) {
        let absoluteLocation = location
        if (/^https?:\/\//i.test(location)) {
          absoluteLocation = location
        } else if (location.startsWith('/')) {
          // Backend usually returns "/v1/..." – prefix with API origin only (avoid duplicating /v1)
          absoluteLocation = `${API_ORIGIN}${location}`
        } else {
          absoluteLocation = new URL(location, API_BASE_URL).toString()
        }
        response = await fetch(absoluteLocation, {
          method: method === 'GET' ? 'GET' : method,
          headers,
          body: method === 'GET' || method === 'HEAD' ? undefined : body,
          redirect: 'follow',
        })
      }
    }

    console.log('✅ Proxy Response:', response.status, targetUrl)

    // Handle 204 No Content - return empty response
    if (response.status === 204) {
      return new NextResponse(null, {
        status: 204,
        statusText: 'No Content',
      })
    }

    // Forward response headers
    const responseHeaders = new Headers()
    response.headers.forEach((value, key) => {
      responseHeaders.set(key, value)
    })

    // Return response
    const responseBody = await response.text()
    
    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })
  } catch (error: any) {
    console.error('❌ Proxy Error:', error)
    return NextResponse.json(
      { error: 'Proxy error', message: error.message },
      { status: 500 }
    )
  }
}

