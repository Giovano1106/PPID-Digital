'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/app/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [nama, setNama] = useState('')
  const [nik, setNik] = useState('')
  const [noHp, setNoHp] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    // 1. Sign Up Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      setErrorMsg(`Pendaftaran gagal: ${authError.message}`)
      setLoading(false)
      return
    }

    // 2. Simpan profil tambahan ke tabel profiles
    if (authData.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        nama_lengkap: nama,
        nik: nik,
        no_hp: noHp,
      })

      if (profileError) {
        console.error('Gagal menyimpan profil:', profileError.message)
      }
    }

    router.push('/permohonan-saya')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        {/* Header Tema CIKASDA */}
        <div className="bg-[#0e4891] p-8 text-center text-white relative">
          <div className="inline-block w-12 h-1 bg-amber-400 mb-3 rounded-full"></div>
          <h1 className="text-2xl font-extrabold tracking-wide uppercase">PENDAFTARAN PEMOHON</h1>
          <p className="text-xs text-blue-100 mt-1 font-medium">
            Layanan Informasi Publik CIKASDA Sulawesi Tengah
          </p>
        </div>

        {/* Form Container */}
        <div className="p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-1">Buat Akun Pemohon Baru</h2>
          <p className="text-sm text-slate-600 mb-6">
            Lengkapi data diri Anda sesuai KTP untuk dapat menggunakan layanan.
          </p>

          {errorMsg && (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-xs font-semibold text-red-700">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-800 tracking-wider mb-1.5">
                Nama Lengkap (Sesuai KTP) <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Masukkan nama lengkap Anda"
                className="w-full rounded-lg border-2 border-slate-300 p-3 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-[#0e4891] focus:bg-blue-50/20 focus:outline-none transition"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-800 tracking-wider mb-1.5">
                  NIK (KTP) <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                  placeholder="16 digit NIK"
                  className="w-full rounded-lg border-2 border-slate-300 p-3 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-[#0e4891] focus:bg-blue-50/20 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-800 tracking-wider mb-1.5">
                  No. WhatsApp / HP <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={noHp}
                  onChange={(e) => setNoHp(e.target.value)}
                  placeholder="0812xxxxxxxx"
                  className="w-full rounded-lg border-2 border-slate-300 p-3 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-[#0e4891] focus:bg-blue-50/20 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-800 tracking-wider mb-1.5">
                Alamat Email <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full rounded-lg border-2 border-slate-300 p-3 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-[#0e4891] focus:bg-blue-50/20 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-800 tracking-wider mb-1.5">
                Kata Sandi <span className="text-red-600">*</span>
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full rounded-lg border-2 border-slate-300 p-3 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-[#0e4891] focus:bg-blue-50/20 focus:outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#0e4891] hover:bg-[#0a366f] py-3.5 text-sm font-bold text-white shadow-md transition active:scale-98 disabled:opacity-50 mt-4"
            >
              {loading ? 'Mendaftarkan Akun...' : 'DAFTAR AKUN PEMOHON'}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-200 pt-6 text-center text-sm font-medium text-slate-600">
            Sudah memiliki akun?{' '}
            <Link
              href="/login"
              className="font-bold text-[#0e4891] hover:underline hover:text-[#0a366f]"
            >
              Masuk di Sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}