'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/app/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMsg('Email atau kata sandi tidak cocok. Silakan periksa kembali.')
      setLoading(false)
    } else {
      router.push('/permohonan-saya')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        {/* Header Tema CIKASDA */}
        <div className="bg-[#0e4891] p-8 text-center text-white relative">
          <div className="inline-block w-12 h-1 bg-amber-400 mb-3 rounded-full"></div>
          <h1 className="text-2xl font-extrabold tracking-wide uppercase">PPID DIGITAL</h1>
          <p className="text-xs text-blue-100 mt-1 font-medium">
            Dinas Cipta Karya & Sumber Daya Air Provinsi Sulawesi Tengah
          </p>
        </div>

        {/* Form Container */}
        <div className="p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-1">Masuk ke Akun</h2>
          <p className="text-sm text-slate-600 mb-6">
            Silakan masuk untuk mengajukan atau memantau permohonan informasi.
          </p>

          {errorMsg && (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-xs font-semibold text-red-700">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-800 tracking-wider mb-2">
                Alamat Email <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contoh@gmail.com"
                className="w-full rounded-lg border-2 border-slate-300 p-3 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-[#0e4891] focus:bg-blue-50/20 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-800 tracking-wider mb-2">
                Kata Sandi <span className="text-red-600">*</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border-2 border-slate-300 p-3 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-[#0e4891] focus:bg-blue-50/20 focus:outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#0e4891] hover:bg-[#0a366f] py-3.5 text-sm font-bold text-white shadow-md transition active:scale-98 disabled:opacity-50 mt-2"
            >
              {loading ? 'Memproses Masuk...' : 'MASUK SEKARANG'}
            </button>
          </form>

          <div className="mt-8 border-t border-slate-200 pt-6 text-center text-sm font-medium text-slate-600">
            Belum punya akun pemohon?{' '}
            <Link
              href="/daftar"
              className="font-bold text-[#0e4891] hover:underline hover:text-[#0a366f]"
            >
              Daftar Akun Baru
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}