'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Warning, CheckCircle } from '@phosphor-icons/react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/app/lib/supabase/client'

function UpdateSandiForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tokenHash = searchParams.get('token_hash')?.trim() || ''
  const otpTypeParam = searchParams.get('type')?.trim() || 'recovery'

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    if (password.length < 6) {
      setErrorMsg('Kata sandi harus minimal 6 karakter.')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok.')
      setLoading(false)
      return
    }

    const supabase = createClient()

    if (tokenHash) {
      const validType = otpTypeParam === 'email' ? 'email' : 'recovery'
      const { error: otpError } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: validType,
      })

      if (otpError) {
        setErrorMsg(
          'Tautan pemulihan kata sandi tidak valid atau sudah kedaluwarsa. Silakan ajukan tautan baru melalui halaman Lupa Sandi.'
        )
        setLoading(false)
        return
      }

      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', '/update-sandi')
      }
    }

    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      setErrorMsg(
        'Gagal memperbarui kata sandi. Sesi pemulihan mungkin sudah kedaluwarsa. Silakan minta tautan baru.'
      )
      setLoading(false)
      return
    }

    await supabase.auth.signOut().catch(() => {})
    setSuccessMsg(
      'Kata sandi berhasil diperbarui! Anda dapat masuk menggunakan kata sandi baru.'
    )
    setLoading(false)
    setTimeout(() => {
      router.push('/login')
    }, 2500)
  }

  return (
    <div className="p-8">
      <h2 className="text-lg font-bold text-slate-900 mb-1">Buat Kata Sandi Baru</h2>
      <p className="text-xs text-slate-600 mb-6 font-medium">
        Masukkan kata sandi baru yang kuat (minimal 6 karakter) dan mudah diingat.
      </p>

      {errorMsg && (
        <div
          role="alert"
          className="mb-6 rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-800 leading-relaxed flex items-start gap-2.5"
        >
          <Warning weight="fill" size={16} className="text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div>{errorMsg}</div>
        </div>
      )}

      {successMsg && (
        <div
          role="status"
          className="mb-6 rounded-xl bg-teal-50 border border-teal-200 p-4 text-xs font-semibold text-teal-800 leading-relaxed flex items-start gap-2.5"
        >
          <CheckCircle weight="fill" size={16} className="text-teal-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div>{successMsg}</div>
        </div>
      )}

      {!successMsg && (
        <form onSubmit={handleUpdate} className="space-y-5">
          <div>
            <label
              htmlFor="update-password-new"
              className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-2"
            >
              Kata Sandi Baru <span className="text-rose-600">*</span>
            </label>
            <input
              id="update-password-new"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="w-full rounded-lg border border-slate-300 bg-white p-3.5 text-sm font-medium text-slate-900 placeholder:text-slate-500 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="update-password-confirm"
              className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-2"
            >
              Konfirmasi Kata Sandi Baru <span className="text-rose-600">*</span>
            </label>
            <input
              id="update-password-confirm"
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ketik ulang kata sandi baru"
              className="w-full rounded-lg border border-slate-300 bg-white p-3.5 text-sm font-medium text-slate-900 placeholder:text-slate-500 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !password || !confirmPassword}
            className="w-full min-h-[44px] bg-[#0e4891] hover:bg-[#0a366f] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-lg transition-colors flex items-center justify-center text-sm mt-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e4891] focus-visible:ring-offset-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Memproses...
              </span>
            ) : (
              'Perbarui Kata Sandi'
            )}
          </button>
        </form>
      )}

      {successMsg && (
        <Link
          href="/login"
          className="mt-6 w-full min-h-[44px] bg-[#0e4891] hover:bg-[#0a366f] text-white font-bold py-3.5 rounded-lg transition-colors flex items-center justify-center text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e4891] focus-visible:ring-offset-2"
        >
          Masuk ke Akun
        </Link>
      )}
    </div>
  )
}

export default function UpdateSandiPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-plus-jakarta flex flex-col items-center justify-center p-6 relative">
      <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Header CIKASDA */}
        <div className="bg-gradient-to-br from-[#0e4891] via-[#0d4182] to-[#09356d] p-8 text-center text-white relative flex flex-col items-center overflow-hidden">
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-blue-400/15 rounded-full blur-2xl pointer-events-none" />

          {/* Unified Official Logo Emblem Badge */}
          <div className="relative mb-4.5 inline-flex items-center gap-3.5 bg-white px-4 py-2.5 rounded-xl border border-white/80 ring-4 ring-white/15">
            <div className="flex items-center justify-center shrink-0">
              <Image
                src="/logo-sulteng.webp"
                alt="Logo Provinsi Sulawesi Tengah"
                width={36}
                height={44}
                className="h-10 w-auto object-contain"
                priority
              />
            </div>
            <div className="h-7 w-px bg-slate-200 shrink-0" />
            <div className="flex items-center justify-center shrink-0 px-0.5">
              <Image
                src="/logo-cikasda.webp"
                alt="Logo Dinas CIKASDA"
                width={100}
                height={38}
                className="h-9 w-auto object-contain"
                priority
              />
            </div>
          </div>

          <h1 className="text-xl font-black tracking-wide uppercase text-white">PPID DIGITAL</h1>
          <p className="text-xs text-blue-100 mt-1 font-medium leading-relaxed max-w-xs mx-auto">
            Perbarui Kata Sandi Anda
          </p>
        </div>

        <Suspense
          fallback={
            <div className="p-8 text-center text-xs font-medium text-slate-500">
              Memuat formulir pemulihan sandi...
            </div>
          }
        >
          <UpdateSandiForm />
        </Suspense>
      </div>
    </div>
  )
}
