import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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

  // This will refresh session if expired - required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect private routes
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/admin') || 
                           request.nextUrl.pathname.startsWith('/permohonan-saya')
  
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect away from auth pages if already logged in
  const isAuthRoute = request.nextUrl.pathname === '/login' || 
                      request.nextUrl.pathname === '/daftar' ||
                      request.nextUrl.pathname === '/lupa-sandi' ||
                      request.nextUrl.pathname === '/update-sandi'

  if (isAuthRoute && user) {
    const url = request.nextUrl.clone()
    // Default to /permohonan-saya, if they are admin, the layout will redirect them or we leave it.
    // We let the login page handle role-based redirection, but wait, if we redirect here they never hit login page.
    // If they are admin, they can navigate to /admin manually. For now, /permohonan-saya is safe.
    url.pathname = '/permohonan-saya'
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
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
