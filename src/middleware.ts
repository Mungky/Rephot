import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const protectedRoutes = ['/app', '/tokens', '/profile']

export async function middleware(request: NextRequest) {
  // Supabase sering mengarahkan PKCE ke Site URL (/) + ?code=… alih-alih ke /auth/callback.
  // Tanpa ini, kode tidak pernah ditukar dan user stuck di landing.
  const url = request.nextUrl
  if (url.pathname === '/' && url.searchParams.has('code')) {
    const dest = url.clone()
    dest.pathname = '/auth/callback'
    if (!dest.searchParams.has('next')) {
      dest.searchParams.set('next', '/update-password')
    }
    return NextResponse.redirect(dest)
  }

  // Supabase mengembalikan error reset/magic link ke Site URL (/?error=…&error_code=…)
  if (url.pathname === '/' && url.searchParams.has('error')) {
    const errorCode = url.searchParams.get('error_code') || ''
    const desc = (url.searchParams.get('error_description') || '').toLowerCase()
    const isEmailLinkIssue =
      errorCode === 'otp_expired' ||
      desc.includes('email link') ||
      desc.includes('invalid or has expired') ||
      desc.includes('link is invalid')

    if (isEmailLinkIssue) {
      return NextResponse.redirect(new URL('/forgot-password?reason=link_expired', request.url))
    }
  }

  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isProtected = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.search = ''
    url.searchParams.set('auth', '1')
    url.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
    const url = request.nextUrl.clone()
    url.pathname = '/app'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - api (API routes)
     */
    '/((?!_next/static|_next/image|api|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
