'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Warning } from '@phosphor-icons/react'
import { createClient } from '@/app/lib/supabase/client'
import { getEmailByNik } from '@/app/actions/auth-profile'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [identifier, setIdentifier] = useState('') // Bisa Email atau NIK 16 Digit
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // 1. Login menggunakan Google OAuth
  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setErrorMsg('')

    try {
      const redirectToUrl = `${window.location.origin}/api/auth/callback?next=/permohonan-saya&oauth=google`

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectToUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      })

      if (error) {
        console.error('[Google Login Error]', error)
        setErrorMsg(error.message || 'Gagal masuk dengan Google. Silakan coba kembali.')
        setGoogleLoading(false)
      }
    } catch (err: unknown) {
      console.error('[OAuth Exception]', err)
      setErrorMsg('Terjadi kendala saat menghubungkan ke Google.')
      setGoogleLoading(false)
    }
  }

  // 2. Login menggunakan Form Konvensional (Email atau NIK + Kata Sandi)
  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    const rawInput = identifier.trim()
    let targetEmail = rawInput

    // Cek apakah input berupa NIK (16 digit angka, mengabaikan spasi/titik jika bukan format email)
    const digitsOnly = rawInput.replace(/\D/g, '')
    const isNik = digitsOnly.length === 16 && !rawInput.includes('@')

    if (isNik) {
      // Ambil email yang terikat dengan NIK melalui Server Action aman
      const res = await getEmailByNik(digitsOnly)
      if (!res.success || !res.email) {
        setErrorMsg('NIK tidak ditemukan dalam sistem. Pastikan NIK sudah didaftarkan.')
        setLoading(false)
        return
      }

      targetEmail = res.email
    }

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: targetEmail,
      password,
    })

    if (error) {
      setErrorMsg('Email/NIK atau kata sandi tidak cocok. Silakan periksa kembali.')
      setLoading(false)
    } else {
      // Cek role user setelah login berhasil
      if (authData?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authData.user.id)
          .maybeSingle()

        if (profile?.role === 'admin') {
          router.push('/admin')
        } else {
          router.push('/permohonan-saya')
        }
      } else {
        router.push('/permohonan-saya')
      }

      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-plus-jakarta flex flex-col items-center justify-center p-6 py-12 relative selection:bg-[#0e4891] selection:text-white">
      {/* Top navigation back link */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="text-xs font-bold text-slate-500 hover:text-[#0e4891] transition-colors flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs"
        >
          <ArrowLeft weight="bold" size={14} /> Kembali ke Beranda
        </Link>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header CIKASDA */}
        <div className="bg-[#0e4891] p-8 text-center text-white relative flex flex-col items-center">
          <div className="flex items-center gap-2 mb-3">
            <Image
              src="/logo-sulteng.webp"
              alt="Logo Sulteng"
              width={48}
              height={48}
              className="w-12 h-12 object-contain bg-white/10 p-1.5 rounded-xl border border-white/20"
            />
            <Image
              src="/logo-cikasda.webp"
              alt="Logo CIKASDA"
              width={48}
              height={48}
              className="w-12 h-12 object-contain bg-white/10 p-1.5 rounded-xl border border-white/20"
            />
          </div>
          <h1 className="text-xl font-extrabold tracking-wide uppercase">PPID DIGITAL</h1>
          <p className="text-xs text-blue-100 mt-1 font-medium leading-relaxed">
            Dinas Cipta Karya & Sumber Daya Air Provinsi Sulawesi Tengah
          </p>
        </div>

        {/* Form Container */}
        <div className="p-8">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Masuk ke Akun</h2>
          <p className="text-xs text-slate-600 mb-6 font-medium">
            Masuk menggunakan akun Google atau form Email / NIK.
          </p>

          {errorMsg && (
            <div className="mb-6 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-700 leading-relaxed flex items-start gap-2.5">
              <Warning weight="fill" size={16} className="text-rose-500 shrink-0 mt-0.5" />
              <div>{errorMsg}</div>
            </div>
          )}

          {/* Form Login Konvensional */}
          <form onSubmit={handleFormLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-2">
                Email / NIK (16 Digit) <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="contoh@gmail.com atau 720101XXXXXXXXXX"
                className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-all shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-2">
                Kata Sandi <span className="text-rose-600">*</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-all shadow-2xs"
              />
              <div className="flex justify-end mt-1.5">
                <Link
                  href="/lupa-sandi"
                  className="text-xs font-bold text-[#0e4891] hover:underline"
                >
                  Lupa kata sandi?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full rounded-xl bg-[#0e4891] hover:bg-[#0a366f] py-3.5 text-sm font-bold text-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 mt-2 focus:outline-none focus:ring-4 focus:ring-[#0e4891]/20 active:scale-[0.99] cursor-pointer"
            >
              {loading ? 'Memproses Masuk...' : 'MASUK'}
            </button>
          </form>

          {/* Divider Pemisah */}
          <div className="relative flex items-center justify-center my-6">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest absolute">
              Atau Masuk Dengan
            </span>
          </div>

          {/* Tombol Masuk dengan Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="w-full rounded-xl border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 py-3 px-4 text-sm font-bold text-slate-800 shadow-sm hover:shadow transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-3 cursor-pointer active:scale-[0.99]"
          >
            {googleLoading ? (
              <span className="text-xs text-slate-500 font-semibold">Menghubungkan ke Google...</span>
            ) : (
              <>
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.88c2.27-2.09 3.665-5.17 3.665-9.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.09C3.25 21.3 7.31 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.32c-.25-.72-.38-1.49-.38-2.32s.13-1.6.38-2.32V6.59H1.26C.46 8.18 0 9.99 0 12s.46 3.82 1.26 5.41l4.02-3.09z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.26 6.59l4.02 3.09c.95-2.83 3.6-4.93 6.72-4.93z"
                  />
                </svg>
                <span>Masuk dengan Google</span>
              </>
            )}
          </button>

          <div className="mt-8 border-t border-slate-100 pt-6 text-center text-xs font-semibold text-slate-600">
            Belum punya akun pemohon?{' '}
            <Link
              href="/daftar"
              className="font-bold text-[#0e4891] hover:underline"
            >
              Daftar Akun Baru
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}