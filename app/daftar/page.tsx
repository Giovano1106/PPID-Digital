'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Warning } from '@phosphor-icons/react'
import { createClient } from '@/app/lib/supabase/client'

export default function DaftarPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleGoogleSignUp = async () => {
    setLoading(true)
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
        console.error('[Google OAuth Error]', error)
        setErrorMsg(error.message || 'Gagal menghubungkan ke layanan Google. Silakan coba kembali.')
        setLoading(false)
      }
    } catch (err: unknown) {
      console.error('[OAuth Exception]', err)
      setErrorMsg('Terjadi kendala sistem saat memulai pendaftaran.')
      setLoading(false)
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
          <h1 className="text-xl font-extrabold tracking-wide uppercase">Pendaftaran Pemohon</h1>
          <p className="text-xs text-blue-100 mt-1 font-medium leading-relaxed">
            Dinas Cipta Karya & Sumber Daya Air Provinsi Sulawesi Tengah
          </p>
        </div>

        <div className="p-8">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Daftar Akun Baru</h2>
          <p className="text-xs text-slate-600 mb-6 font-medium">
            Pendaftaran akun pemohon menggunakan akun Google.
          </p>

          {errorMsg && (
            <div className="mb-6 rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-700 leading-relaxed flex items-start gap-2.5">
              <Warning weight="fill" size={16} className="text-rose-500 shrink-0 mt-0.5" />
              <div>{errorMsg}</div>
            </div>
          )}

          {/* Tombol Utama Daftar dengan Google */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="w-full rounded-xl border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 py-3.5 px-4 text-sm font-bold text-slate-800 shadow-sm hover:shadow transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-3 cursor-pointer active:scale-[0.99]"
          >
            {loading ? (
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
                <span>Daftar dengan Akun Google</span>
              </>
            )}
          </button>

          <div className="mt-8 border-t border-slate-100 pt-6 text-center text-xs font-semibold text-slate-600">
            Sudah memiliki akun pemohon?{' '}
            <Link
              href="/login"
              className="font-bold text-[#0e4891] hover:underline"
            >
              Masuk ke Akun
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}