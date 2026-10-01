import { NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/permohonan-saya'
  const oauth = searchParams.get('oauth')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Periksa role user setelah autentikasi berhasil (menggunakan data.user dari exchangeCodeForSession)
      const user = data?.user

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle()

        if (profile?.role === 'admin') {
          return NextResponse.redirect(`${origin}/admin`)
        }
      }

      // Bangun URL redirect dengan membawa penanda oauth=google jika ada
      const targetPath = next.startsWith('/') ? next : `/${next}`
      const redirectUrl = new URL(targetPath, origin)
      if (oauth) {
        redirectUrl.searchParams.set('oauth', oauth)
      }

      return NextResponse.redirect(redirectUrl.toString())
    }
  }

  // Jika gagal atau tidak ada kode otorisasi, arahkan ke login dengan pesan error
  return NextResponse.redirect(`${origin}/login?error=Invalid_Token`)
}
