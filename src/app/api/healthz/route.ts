import { NextResponse } from 'next/server'

/**
 * Local liveness probe for the Next.js server itself.
 *
 * This is a STATIC route, so it takes precedence over the catch-all `[...path]` proxy and
 * is never forwarded to the backend. It intentionally does NOT run origin validation, so
 * container orchestrators can probe it without sending an `Origin` header.
 */
export const dynamic = 'force-dynamic'

export function GET() {
  return NextResponse.json({ status: 'ok' }, { status: 200 })
}
