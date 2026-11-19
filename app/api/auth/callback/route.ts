import { NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const otpType = searchParams.get('type')
  const next = searchParams.get('next') ?? '/permohonan-saya'
  const oauth = searchParams.get('oauth')

  const isSafePath = next.startsWith('/') && !next.startsWith('//') && !next.includes('\\')
  const targetPath = isSafePath ? next : '/permohonan-saya'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Alur pemulihan kata sandi harus selalu menuju /update-sandi, termasuk untuk Admin
      if (targetPath === '/update-sandi') {
        return NextResponse.redirect(`${origin}/update-sandi`)
      }

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

      const redirectUrl = new URL(targetPath, origin)
      if (oauth) {
        redirectUrl.searchParams.set('oauth', oauth)
      }

      return NextResponse.redirect(redirectUrl.toString())
    }
  } else if (tokenHash && otpType === 'recovery') {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: 'recovery',
    })

    if (!error) {
      return NextResponse.redirect(`${origin}/update-sandi`)
    }
  }

  // Jika gagal atau tidak ada kode otorisasi, arahkan ke login dengan pesan error
  return NextResponse.redirect(`${origin}/login?error=Invalid_Token`)
}
