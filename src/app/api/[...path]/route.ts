import { NextRequest, NextResponse } from 'next/server'
import { validateOrigin, unauthorizedOriginResponse } from '@/lib/api/origin-validator'

/** Mask the public share token so it never lands in logs. */
function maskPublicToken(url: string): string {
  return url.replace(/(public\/budgets\/)[^/?#]+/, '$1***')
}

const API_BASE_URL = process.env.API_URL || 'http://localhost:8080/v1'
const API_BASE = new URL(API_BASE_URL)
const API_ORIGIN = `${API_BASE.protocol}//${API_BASE.host}`

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(request, path, 'GET')
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(request, path, 'POST')
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(request, path, 'PUT')
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(request, path, 'PATCH')
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(request, path, 'DELETE')
}

/**
 * Hop-by-hop headers (RFC 7230 §6.1) must never be forwarded by a proxy, plus
 * the `proxy-*` family. These describe a single transport connection, not the
 * end-to-end message.
 */
const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'transfer-encoding',
  'upgrade',
  'proxy-authorization',
  'proxy-authenticate',
  'te',
  'trailer',
])

function isHopByHopHeader(key: string): boolean {
  const k = key.toLowerCase()
  return HOP_BY_HOP_HEADERS.has(k) || k.startsWith('proxy-')
}

/**
 * Decides whether a proxied response body must be forwarded as raw bytes
 * (streamed) instead of decoded as text. 3D model files are served as
 * `model/stl` / `model/3mf` (and the 3MF XML vendor type), so `model/` and the
 * 3manufacturing vendor type MUST be treated as binary — otherwise `response.text()`
 * corrupts the file.
 */
function isBinaryContentType(contentType: string): boolean {
  return (
    contentType.includes('application/pdf') ||
    contentType.includes('application/octet-stream') ||
    contentType.includes('image/') ||
    contentType.includes('audio/') ||
    contentType.includes('video/') ||
    contentType.includes('model/') ||
    contentType.includes('3dmanufacturing') ||
    contentType.includes('application/zip') ||
    contentType.includes('application/gzip')
  )
}

/**
 * Builds the forwarded REQUEST headers: drops `host` and all hop-by-hop headers.
 * When the body was re-serialized (JSON), the original `content-length` no longer
 * matches, so the caller drops it separately.
 */
function buildForwardRequestHeaders(request: NextRequest): Headers {
  const headers = new Headers()
  request.headers.forEach((value, key) => {
    const k = key.toLowerCase()
    if (k === 'host') return
    if (isHopByHopHeader(k)) return
    headers.set(key, value)
  })
  return headers
}

/**
 * Builds the forwarded RESPONSE headers. Node's fetch transparently decompresses
 * the body, so `content-encoding` is always dropped and `content-length` is dropped
 * whenever the body was decoded (either decompressed or re-serialized as text) —
 * otherwise the browser would see a length that no longer matches the bytes.
 * Hop-by-hop headers are stripped; content-type/content-disposition/cache-control/
 * etag are preserved.
 */
function buildForwardResponseHeaders(response: Response, decoded: boolean): Headers {
  const headers = new Headers()
  response.headers.forEach((value, key) => {
    const k = key.toLowerCase()
    if (isHopByHopHeader(k)) return
    if (k === 'content-encoding') return
    if (k === 'content-length' && decoded) return
    headers.set(key, value)
  })
  return headers
}

async function proxyRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  // Validate request origin in production
  if (!validateOrigin(request)) {
    return unauthorizedOriginResponse()
  }

  try {
    // Reconstruct the path with trailing slash preserved
    const path = pathSegments.join('/')
    const hasTrailingSlash = request.nextUrl.pathname.endsWith('/')
    const targetPath = hasTrailingSlash ? `${path}/` : path

    const targetUrl = `${API_BASE_URL}/${targetPath}${request.nextUrl.search}`

    console.log('🔄 Proxy Request:', method, maskPublicToken(targetUrl))

    const headers = buildForwardRequestHeaders(request)

    // Get request body if present
    let body: BodyInit | undefined = undefined
    if (method !== 'GET' && method !== 'HEAD') {
      const contentType = request.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        // Re-serialized: the original content-length no longer applies.
        body = JSON.stringify(await request.json())
        headers.delete('content-length')
      } else if (contentType?.includes('multipart/form-data')) {
        // For multipart data, pass the raw stream to preserve boundary
        body = request.body ?? undefined
      } else {
        body = await request.text()
        headers.delete('content-length')
      }
    }

    // Make the proxied request (handle redirects manually to avoid leaking relative locations to the browser)
    const fetchOptions: RequestInit & { duplex?: string } = {
      method,
      headers,
      body,
      redirect: 'manual',
    }

    // Add duplex option for streaming body (required for Node.js fetch)
    const bodyIsStream = body instanceof ReadableStream
    if (bodyIsStream) {
      fetchOptions.duplex = 'half'
    }

    let response = await fetch(targetUrl, fetchOptions)

    // If backend responds with a redirect that uses a relative Location like "/v1/...",
    // follow it server-side and return the final response to the browser.
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location') || ''
      const isBodylessMethod = method === 'GET' || method === 'HEAD'
      // A streamed (multipart) body was already consumed by the first fetch and
      // cannot be replayed, so we must NOT refetch with it. Buffered bodies
      // (JSON/text strings) are safe to reuse.
      const canFollow = location !== '' && (isBodylessMethod || !bodyIsStream)

      if (canFollow) {
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
          method,
          headers,
          body: isBodylessMethod ? undefined : body,
          redirect: 'follow',
        })
      }
      // Otherwise (streamed body we can't replay) fall through and return the
      // redirect response as-is rather than refetch with a consumed stream.
    }

    console.log('✅ Proxy Response:', response.status, maskPublicToken(targetUrl))

    // Handle 204 No Content - return empty response
    if (response.status === 204) {
      return new NextResponse(null, {
        status: 204,
        statusText: 'No Content',
      })
    }

    // Binary responses (PDFs, images, 3D model files, ...) must be forwarded as raw
    // bytes. Stream the body straight through so large files (e.g. 50MB STL/3MF) are
    // not buffered in memory.
    const contentType = response.headers.get('content-type') || ''
    if (isBinaryContentType(contentType)) {
      // If the upstream body was compressed, Node already decoded it, so the
      // original content-length is stale and must be dropped.
      const wasEncoded = response.headers.has('content-encoding')
      return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: buildForwardResponseHeaders(response, wasEncoded),
      })
    }

    const responseBody = await response.text()
    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: buildForwardResponseHeaders(response, true),
    })
  } catch (error) {
    console.error('❌ Proxy Error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Proxy error', message },
      { status: 500 }
    )
  }
}
