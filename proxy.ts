import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function copyCookies(source: NextResponse, target: NextResponse): NextResponse {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie)
  })
  return target
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
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

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isAdminApi = pathname === '/api/admin' || pathname.startsWith('/api/admin/')
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/')
  const isPermohonanRoute =
    pathname === '/permohonan-saya' || pathname.startsWith('/permohonan-saya/')
  // Catatan: /update-sandi dikecualikan agar tautan reset password dari email tetap dapat diakses saat sesi pemulihan aktif
  const isAuthRoute =
    pathname === '/login' || pathname === '/daftar' || pathname === '/lupa-sandi'

  if (isAdminApi && !user) {
    return copyCookies(
      supabaseResponse,
      NextResponse.json({ error: 'Unauthorized: Sesi tidak ditemukan.' }, { status: 401 })
    )
  }

  if ((isAdminRoute || isPermohonanRoute) && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return copyCookies(supabaseResponse, NextResponse.redirect(url))
  }

  if (user && (isAdminApi || isAdminRoute || isAuthRoute)) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    const isAdmin = profile?.role === 'admin'

    if (isAdminApi && !isAdmin) {
      return copyCookies(
        supabaseResponse,
        NextResponse.json({ error: 'Forbidden: Akses hanya untuk Administrator.' }, { status: 403 })
      )
    }

    if (isAdminRoute && !isAdmin) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return copyCookies(supabaseResponse, NextResponse.redirect(url))
    }

    if (isAuthRoute) {
      const url = request.nextUrl.clone()
      url.pathname = isAdmin ? '/admin' : '/permohonan-saya'
      return copyCookies(supabaseResponse, NextResponse.redirect(url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
