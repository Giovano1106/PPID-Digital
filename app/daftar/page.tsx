'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/app/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [namaLengkap, setNamaLengkap] = useState('')
  const [nik, setNik] = useState('')
  const [telepon, setTelepon] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    // 1. Validasi Nama Lengkap (hanya huruf, spasi, petik tunggal, dan titik)
    const namaClean = namaLengkap.trim()
    if (namaClean.length < 3) {
      setErrorMsg('Nama lengkap minimal harus terdiri dari 3 karakter.')
      setLoading(false)
      return
    }

    const nameRegex = /^[a-zA-Z\s'\.]+$/
    if (!nameRegex.test(namaClean)) {
      setErrorMsg('Nama lengkap hanya boleh berisi huruf, spasi, titik (.), dan tanda petik (\'). Simbol lain dan angka tidak diperbolehkan.')
      setLoading(false)
      return
    }

    // 2. Validasi NIK (harus 16 digit angka)
    if (!/^\d{16}$/.test(nik)) {
      setErrorMsg('NIK harus terdiri dari tepat 16 digit angka.')
      setLoading(false)
      return
    }

    // 3. Validasi Nomor Telepon / WA
    const cleanTelepon = telepon.trim().replace(/\s+/g, '')
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{7,11}$/
    if (!phoneRegex.test(cleanTelepon)) {
      setErrorMsg('Nomor telepon/WA tidak valid. Masukkan nomor yang diawali 08... atau 628... (10-14 digit).')
      setLoading(false)
      return
    }

    // 4. Validasi Kata Sandi
    if (password.length < 6) {
      setErrorMsg('Kata sandi minimal terdiri dari 6 karakter.')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok dengan kata sandi yang dimasukkan.')
      setLoading(false)
      return
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          nama: namaClean,
          nik: nik,
          telepon: cleanTelepon,
          role: 'pemohon',
        },
      },
    })

    if (signUpError) {
      setErrorMsg(signUpError.message)
    } else {
      setSuccessMsg(
        'Pendaftaran berhasil! Silakan masuk ke akun Anda.'
      )
      setTimeout(() => {
        router.push('/login')
      }, 2500)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 font-plus-jakarta flex flex-col items-center justify-center p-6 py-12 relative">
      {/* Top navigation back link */}
      <div className="w-full max-w-lg mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="text-xs font-bold text-slate-500 hover:text-[#0e4891] transition-colors flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs"
        >
          <span>←</span> Kembali ke Beranda
        </Link>
      </div>

      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header CIKASDA */}
        <div className="bg-[#0e4891] p-8 text-center text-white relative flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-400 font-black text-2xl mb-3">
            P
          </div>
          <h1 className="text-xl font-extrabold tracking-wide uppercase">Pendaftaran Pemohon PPID</h1>
          <p className="text-xs text-blue-100 mt-1 font-medium leading-relaxed">
            Dinas Cipta Karya & Sumber Daya Air Provinsi Sulawesi Tengah
          </p>
        </div>

        <div className="p-8">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Form Registrasi Akun Baru</h2>
          <p className="text-xs text-slate-600 mb-6 font-medium">
            Lengkapi data identitas pemohon di bawah ini dengan benar.
          </p>

          {errorMsg && (
            <div className="mb-6 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-700 leading-relaxed">
              ⚠️ {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-700 leading-relaxed">
              ✅ {successMsg}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                Nama Lengkap (Sesuai KTP) <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={namaLengkap}
                onChange={(e) => setNamaLengkap(e.target.value)}
                placeholder="Contoh: Ahmad Abdullah, S.T."
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-all shadow-2xs"
              />
              <p className="text-[11px] text-slate-500 mt-1">Hanya huruf, spasi, titik (.), dan tanda petik (\'). Tanpa simbol/angka.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                  NIK (16 Digit) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={16}
                  value={nik}
                  onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                  placeholder="720101XXXXXXXXXX"
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-all font-mono shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                  No. Telepon / WA <span className="text-rose-600">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={telepon}
                  onChange={(e) => setTelepon(e.target.value)}
                  placeholder="081234567890"
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-all shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                Alamat Email <span className="text-rose-600">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contoh@gmail.com"
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-all shadow-2xs"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                  Kata Sandi <span className="text-rose-600">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 karakter"
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-all shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                  Ulangi Kata Sandi <span className="text-rose-600">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Sama dengan kata sandi"
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-all shadow-2xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#0e4891] hover:bg-[#0a366f] py-3.5 text-sm font-bold text-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 mt-4 focus:outline-none focus:ring-4 focus:ring-[#0e4891]/20 active:scale-[0.99]"
            >
              {loading ? 'Memproses Pendaftaran...' : 'DAFTAR SEKARANG'}
            </button>
          </form>

          <div className="mt-8 border-t border-slate-100 pt-6 text-center text-xs font-semibold text-slate-600">
            Sudah punya akun?{' '}
            <Link
              href="/login"
              className="font-bold text-[#0e4891] hover:underline"
            >
              Masuk di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}