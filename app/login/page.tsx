'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Warning } from '@phosphor-icons/react'
import { createClient } from '@/app/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [identifier, setIdentifier] = useState('') // Bisa Email atau NIK
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    let targetEmail = identifier.trim()

    // Cek apakah input berupa NIK (16 digit angka)
    const isNik = /^\d{16}$/.test(targetEmail)

    if (isNik) {
      // Cari email yang terikat dengan NIK tersebut di tabel profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('nik', targetEmail)
        .maybeSingle()

      if (profileError || !profileData || !profileData.email) {
        setErrorMsg('NIK tidak ditemukan dalam sistem. Silakan periksa kembali.')
        setLoading(false)
        return
      }

      targetEmail = profileData.email
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
          .single()

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
    <div className="min-h-screen bg-slate-50 font-plus-jakarta flex flex-col items-center justify-center p-6 relative">
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
          <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-400 font-black text-2xl mb-3">
            P
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
            Masuk menggunakan Alamat Email atau 16 Digit NIK terdaftar.
          </p>

          {errorMsg && (
            <div className="mb-6 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-700 leading-relaxed flex items-start gap-2.5">
              <Warning weight="fill" size={16} className="text-rose-500 shrink-0 mt-0.5" />
              <div>{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
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
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#0e4891] hover:bg-[#0a366f] py-3.5 text-sm font-bold text-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 mt-2 focus:outline-none focus:ring-4 focus:ring-[#0e4891]/20 active:scale-[0.99]"
            >
              {loading ? 'Memproses Masuk...' : 'MASUK SEKARANG'}
            </button>
          </form>

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