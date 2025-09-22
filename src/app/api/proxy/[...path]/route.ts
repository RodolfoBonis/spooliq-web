import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.spooliq.rodolfodebonis.com.br/v1'

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'DELETE')
}

async function proxyRequest(
  request: NextRequest,
  path: string[],
  method: string
) {
  try {
    const targetUrl = `${API_BASE_URL}/${path.join('/')}`
    const searchParams = request.nextUrl.searchParams.toString()
    const fullUrl = searchParams ? `${targetUrl}?${searchParams}` : targetUrl

    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }

    // Forward authorization header if present
    const authHeader = request.headers.get('authorization')
    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers,
    }

    // Add body for POST/PUT requests
    if (method === 'POST' || method === 'PUT') {
      try {
        const body = await request.text()
        if (body) {
          requestOptions.body = body
        }
      } catch (error) {
        console.error('Error reading request body:', error)
      }
    }

    console.log(`[API Proxy] ${method} ${fullUrl}`)

    // Make the request to the backend
    const response = await fetch(fullUrl, requestOptions)

    // Get response data
    const responseText = await response.text()
    let responseData

    try {
      responseData = JSON.parse(responseText)
    } catch {
      responseData = responseText
    }

    // Log response for debugging
    console.log(`[API Proxy] Response ${response.status}:`, responseData)

    // Return response with appropriate status
    return NextResponse.json(responseData, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    })

  } catch (error) {
    console.error('[API Proxy] Error:', error)

    return NextResponse.json(
      {
        error: 'Proxy error',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: 'Failed to connect to backend API'
      },
      { status: 500 }
    )
  }
}