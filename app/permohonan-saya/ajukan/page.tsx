'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/app/lib/supabase/client'

export default function FormPermohonanPage() {
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    jenis_informasi: 'Informasi Berkala',
    deskripsi: '',
    cara_memperoleh: 'Melihat / Membaca / Mendengarkan',
  })

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setErrorMsg('Sesi Anda telah berakhir. Silakan login kembali.')
      setLoading(false)
      return
    }

    // Hitung SLA 10 Hari Kerja dari hari ini
    const now = new Date()
    let count = 0
    const deadline = new Date(now)
    while (count < 10) {
      deadline.setDate(deadline.getDate() + 1)
      const day = deadline.getDay()
      if (day !== 0 && day !== 6) {
        count++
      }
    }
    const deadlineAwalStr = deadline.toISOString().split('T')[0]

    // Simpan permohonan ke Database sesuai skema PRD
    const { error: insertError } = await supabase.from('permohonan').insert({
      user_id: user.id,
      jenis_informasi: form.jenis_informasi,
      deskripsi: form.deskripsi,
      cara_memperoleh: form.cara_memperoleh,
      status: 'diajukan',
      deadline_awal: deadlineAwalStr,
    })

    if (insertError) {
      setErrorMsg(`Gagal mengirim permohonan: ${insertError.message}`)
      setLoading(false)
    } else {
      router.push('/permohonan-saya')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-plus-jakarta py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Navigation link back */}
        <Link
          href="/permohonan-saya"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0e4891] hover:underline mb-6 transition-colors"
        >
          ← Kembali ke Riwayat Permohonan
        </Link>

        {/* Header Form CIKASDA */}
        <div className="bg-[#0e4891] text-white rounded-2xl p-6 md:p-8 shadow-sm mb-6 relative overflow-hidden flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-400 font-black text-2xl shrink-0">
            P
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight uppercase">
              Formulir Permohonan Informasi
            </h1>
            <p className="text-xs text-blue-100 mt-1 font-medium">
              Dinas Cipta Karya dan Sumber Daya Air Provinsi Sulawesi Tengah
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          {errorMsg && (
            <div className="mb-6 rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-700">
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-2">
                Kategori Jenis Informasi Publik <span className="text-rose-600">*</span>
              </label>
              <select
                name="jenis_informasi"
                value={form.jenis_informasi}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-sm font-semibold text-slate-900 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-all cursor-pointer"
              >
                <option value="Informasi Berkala">Informasi Berkala</option>
                <option value="Informasi Serta Merta">Informasi Serta Merta</option>
                <option value="Informasi Setiap Saat">Informasi Setiap Saat</option>
                <option value="Informasi Dikecualikan">Informasi Dikecualikan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-2">
                Deskripsi & Rincian Kebutuhan Informasi <span className="text-rose-600">*</span>
              </label>
              <textarea
                name="deskripsi"
                required
                rows={5}
                value={form.deskripsi}
                onChange={handleChange}
                placeholder="Jelaskan dokumen/informasi publik yang Anda minta secara spesifik beserta tujuan penggunaannya..."
                className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-2">
                Cara Memperoleh / Bentuk Salinan <span className="text-rose-600">*</span>
              </label>
              <select
                name="cara_memperoleh"
                value={form.cara_memperoleh}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-sm font-semibold text-slate-900 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-all cursor-pointer"
              >
                <option value="Melihat / Membaca / Mendengarkan">
                  Melihat / Membaca / Mendengarkan
                </option>
                <option value="Salinan Elektronik (Softcopy / Digital)">
                  Salinan Elektronik (Softcopy / Digital)
                </option>
                <option value="Salinan Cetak (Hardcopy)">
                  Salinan Cetak (Hardcopy)
                </option>
              </select>
            </div>

            <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-xs text-slate-700 leading-relaxed font-medium">
              ℹ️ <strong className="font-bold text-[#0e4891]">Batas Waktu Pengolahan (SLA):</strong> Sesuai UU KIP No. 14 Tahun 2008, permohonan ini memiliki batas waktu jawaban maksimal <strong className="font-bold">10 hari kerja</strong> sejak diajukan.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#0e4891] hover:bg-[#0a366f] py-4 text-sm font-bold text-white tracking-wider uppercase shadow-sm transition-all disabled:opacity-50 mt-4 focus:outline-none focus:ring-4 focus:ring-[#0e4891]/20"
            >
              {loading ? 'Mengirim Permohonan...' : 'KIRIM PERMOHONAN INFORMASI'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}