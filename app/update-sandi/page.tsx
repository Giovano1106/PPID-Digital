'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Warning, CheckCircle } from '@phosphor-icons/react'
import Image from 'next/image'
import { createClient } from '@/app/lib/supabase/client'
import Link from 'next/link'

export default function UpdateSandiPage() {
  const router = useRouter()
  const supabase = createClient()

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

    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) {
      setErrorMsg('Gagal memperbarui kata sandi. Sesi pemulihan mungkin sudah kedaluwarsa. Silakan minta tautan baru.')
      setLoading(false)
    } else {
      setSuccessMsg('Kata sandi berhasil diperbarui! Anda dapat masuk menggunakan kata sandi baru.')
      setLoading(false)
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-plus-jakarta flex flex-col items-center justify-center p-6 relative">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header CIKASDA */}
        <div className="bg-gradient-to-br from-[#0e4891] via-[#0d4182] to-[#09356d] p-8 text-center text-white relative flex flex-col items-center overflow-hidden">
          {/* Subtle Ambient Light Decoration */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-blue-400/15 rounded-full blur-2xl pointer-events-none" />

          {/* Unified Official Logo Emblem Badge */}
          <div className="relative mb-4.5 inline-flex items-center gap-3.5 bg-white px-4 py-2.5 rounded-2xl shadow-lg border border-white/80 ring-4 ring-white/15 transition-transform duration-300 hover:scale-[1.02]">
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

          <h1 className="text-xl font-black tracking-wide uppercase text-white drop-shadow-xs">PPID DIGITAL</h1>
          <p className="text-xs text-blue-100 mt-1 font-medium leading-relaxed max-w-xs mx-auto">
            Perbarui Kata Sandi Anda
          </p>
        </div>

        {/* Form Container */}
        <div className="p-8">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Buat Kata Sandi Baru</h2>
          <p className="text-xs text-slate-600 mb-6 font-medium">
            Masukkan kata sandi baru yang kuat (minimal 6 karakter) dan mudah diingat.
          </p>

          {errorMsg && (
            <div className="mb-6 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-700 leading-relaxed flex items-start gap-2.5">
              <Warning weight="fill" size={16} className="text-rose-500 shrink-0 mt-0.5" />
              <div>{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 rounded-2xl bg-teal-50 border border-teal-200 p-4 text-xs font-semibold text-teal-800 leading-relaxed flex items-start gap-2.5">
              <CheckCircle weight="fill" size={16} className="text-teal-600 shrink-0 mt-0.5" />
              <div>{successMsg}</div>
            </div>
          )}

          {!successMsg && (
            <form onSubmit={handleUpdate} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-2">
                  Kata Sandi Baru <span className="text-rose-600">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-all shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-2">
                  Konfirmasi Kata Sandi Baru <span className="text-rose-600">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ketik ulang kata sandi baru"
                  className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-all shadow-2xs"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !password || !confirmPassword}
                className="w-full bg-[#0e4891] hover:bg-[#0a366f] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center text-sm mt-4"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
              className="mt-6 w-full bg-[#0e4891] hover:bg-[#0a366f] text-white font-bold py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center text-sm"
            >
              Masuk ke Akun
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
