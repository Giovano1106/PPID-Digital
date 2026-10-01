'use client'

import React, { useState } from 'react'
import { Warning, IdentificationCard, Phone, User, CheckCircle } from '@phosphor-icons/react'
import { completeUserProfile } from '@/app/actions/auth-profile'

interface WajibIsiDataDiriModalProps {
  isOpen: boolean
  defaultNama?: string
  defaultEmail?: string
  onSuccess: (data: { nama: string; nik: string; telepon: string }) => void
}

export default function WajibIsiDataDiriModal({
  isOpen,
  defaultNama = '',
  defaultEmail = '',
  onSuccess,
}: WajibIsiDataDiriModalProps) {
  const [nama, setNama] = useState(defaultNama)
  const [nik, setNik] = useState('')
  const [telepon, setTelepon] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    // Validasi Sederhana di Sisi Klien
    const cleanNama = nama.trim()
    if (cleanNama.length < 3) {
      setErrorMsg('Nama lengkap minimal terdiri dari 3 karakter.')
      setLoading(false)
      return
    }

    const cleanNik = nik.trim().replace(/\D/g, '')
    if (cleanNik.length !== 16) {
      setErrorMsg('NIK harus terdiri dari tepat 16 digit angka.')
      setLoading(false)
      return
    }

    const cleanTelepon = telepon.trim().replace(/\s+/g, '')
    if (!/^(\+62|62|0)8[1-9][0-9]{7,11}$/.test(cleanTelepon)) {
      setErrorMsg('Nomor telepon/WA tidak valid. Masukkan nomor yang diawali 08... atau 628... (10-14 digit).')
      setLoading(false)
      return
    }

    const res = await completeUserProfile({
      nama: cleanNama,
      nik: cleanNik,
      telepon: cleanTelepon,
    })

    if (!res.success) {
      setErrorMsg(res.error || 'Gagal menyimpan data diri. Silakan coba lagi.')
      setLoading(false)
      return
    }

    setLoading(false)
    onSuccess({
      nama,
      nik: cleanNik,
      telepon: cleanTelepon,
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* Header Visual */}
        <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0e4891] shrink-0">
            <IdentificationCard size={28} weight="duotone" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0e4891] bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded">
              Langkah Wajib Pemohon Baru
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">
              Lengkapi Data Diri Pemohon
            </h2>
          </div>
        </div>

        {/* Kotak Pemberitahuan Regulasi */}
        <div className="mb-5 rounded-xl bg-amber-50 border border-amber-200/80 p-3.5 text-xs text-amber-900 leading-relaxed font-medium flex items-start gap-2.5">
          <Warning size={18} weight="fill" className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            Sesuai amanat <strong>UU No. 14 Tahun 2008 (UU KIP)</strong>, pemohon informasi publik wajib mencantumkan identitas NIK dan kontak WhatsApp/telepon resmi untuk keperluan verifikasi tanda terima permohonan.
          </div>
        </div>

        {errorMsg && (
          <div className="mb-5 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs font-semibold text-rose-700 leading-relaxed flex items-start gap-2">
            <Warning size={16} weight="fill" className="text-rose-500 shrink-0 mt-0.5" />
            <div>{errorMsg}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {defaultEmail && (
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-1.5">
                Alamat Email (Google)
              </label>
              <input
                type="text"
                disabled
                value={defaultEmail}
                className="w-full rounded-xl border border-slate-200 bg-slate-100/80 p-3 text-xs font-medium text-slate-600 cursor-not-allowed"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
              Nama Lengkap (Sesuai KTP) <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Ahmad Abdullah, S.T."
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-all pl-10"
              />
              <User size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
              NIK (16 Digit Angka) <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                maxLength={16}
                value={nik}
                onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                placeholder="720101XXXXXXXXXX"
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-mono font-semibold text-slate-900 placeholder-slate-400 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-all pl-10"
              />
              <IdentificationCard size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Wajib 16 digit angka sesuai Kartu Tanda Penduduk.</p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
              Nomor WhatsApp / Telepon <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                value={telepon}
                onChange={(e) => setTelepon(e.target.value)}
                placeholder="0812XXXXXXXX / 628XXXXXXXX"
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-all pl-10 font-mono"
              />
              <Phone size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Digunakan untuk konfirmasi dan pemberitahuan berkas selesai.</p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#0e4891] hover:bg-[#0a366f] py-3.5 text-sm font-bold text-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                'Menyimpan Data...'
              ) : (
                <>
                  <CheckCircle size={18} weight="bold" />
                  Simpan & Lanjutkan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
