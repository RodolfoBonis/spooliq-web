import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  const { pathname } = request.nextUrl

  // Rotas publicas que nao requerem autenticacao
  const publicRoutes = ['/', '/login', '/register']

  // Rotas protegidas que requerem autenticacao
  const protectedRoutes = ['/dashboard', '/quotes', '/filaments', '/users', '/settings']

  // Se esta em uma rota publica, permitir
  if (publicRoutes.includes(pathname)) {
    // Se esta logado e tenta acessar login/register, redirecionar para dashboard
    if (token && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // Se esta em uma rota protegida sem token, redirecionar para login
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Verificar permissoes de admin para rota /users
  if (pathname.startsWith('/users')) {
    // Por agora, apenas verificar se tem token (em producao, verificar role no token)
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}