import {NextRequest, NextResponse} from 'next/server'
import {validateOrigin, unauthorizedOriginResponse} from '@/lib/api/origin-validator'
import {RbAuthenticator} from "@rblab/rb_auth_client";

export async function GET(request: NextRequest) {
    // Validate request origin in production
    if (!validateOrigin(request)) {
        return unauthorizedOriginResponse()
    }

    try {

        const url = request.nextUrl.searchParams.get('url')

        if (!url) {
            return NextResponse.json(
                {error: 'URL parameter is required'},
                {status: 400}
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
                {error: 'URL host not allowed'},
                {status: 403}
            )
        }

        const rbAuth = new RbAuthenticator({
            clientID: process.env.CLIENT_ID || "",
            clientSecret: process.env.CLIENT_SECRET || "",
        })

        const token = await rbAuth.getToken()


        // Fetch PDF from CDN with API key
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            return NextResponse.json(
                {error: 'Failed to fetch PDF from CDN', status: response.status},
                {status: response.status}
            )
        }

        // Get the PDF blob
        const blob = await response.blob()

        // Return the PDF with appropriate headers
        return new NextResponse(blob, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Cache-Control': 'public, max-age=3600',
            },
        })
    } catch (error) {
        console.error('CDN PDF Proxy Error:', error)
        return NextResponse.json(
            {error: 'Internal server error'},
            {status: 500}
        )
    }
}
