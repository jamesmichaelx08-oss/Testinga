import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySessionToken } from '@/lib/session'

const protectedPaths = [
  '/dashboard',
  '/create-server',
  '/settings',
  '/cart',
  '/checkout',
]

const authPaths = ['/login', '/signup']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('session')?.value
  const session = token ? await verifySessionToken(token) : null
  const isLoggedIn = !!session

  const isProtected = protectedPaths.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  )
  const isAuthPage = authPaths.some((p) => pathname === p)

  if (isProtected && !isLoggedIn) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  if (isAuthPage && isLoggedIn) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/create-server/:path*',
    '/settings/:path*',
    '/cart/:path*',
    '/checkout/:path*',
    '/login',
    '/signup',
  ],
}
