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
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Navigation link back */}
      <Link
        href="/permohonan-saya"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0e4891] hover:underline mb-6"
      >
        ← Kembali ke Riwayat Permohonan
      </Link>

      {/* Header Form CIKASDA */}
      <div className="bg-[#0e4891] rounded-2xl p-6 md:p-8 text-white shadow-lg mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400 opacity-10 rounded-full blur-2xl"></div>
        <div className="inline-block w-12 h-1 bg-amber-400 mb-3 rounded-full"></div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide uppercase">
          Formulir Permohonan Informasi
        </h1>
        <p className="text-sm text-blue-100 mt-1 font-medium">
          Dinas Cipta Karya dan Sumber Daya Air Provinsi Sulawesi Tengah
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 md:p-10">
        {errorMsg && (
          <div className="mb-8 rounded-xl bg-red-50 border border-red-200 p-4 text-sm font-semibold text-red-700">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-800 tracking-wider mb-2">
              Kategori Jenis Informasi Publik <span className="text-red-600">*</span>
            </label>
            <select
              name="jenis_informasi"
              value={form.jenis_informasi}
              onChange={handleChange}
              className="w-full rounded-lg border-2 border-slate-300 p-3 text-sm font-semibold text-slate-900 bg-white focus:border-[#0e4891] focus:outline-none"
            >
              <option value="Informasi Berkala">Informasi Berkala</option>
              <option value="Informasi Serta Merta">Informasi Serta Merta</option>
              <option value="Informasi Setiap Saat">Informasi Setiap Saat</option>
              <option value="Informasi Dikecualikan">Informasi Dikecualikan</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-800 tracking-wider mb-2">
              Deskripsi & Rincian Kebutuhan Informasi <span className="text-red-600">*</span>
            </label>
            <textarea
              name="deskripsi"
              required
              rows={5}
              value={form.deskripsi}
              onChange={handleChange}
              placeholder="Jelaskan dokumen/informasi publik yang Anda minta secara spesifik beserta tujuan penggunaannya..."
              className="w-full rounded-lg border-2 border-slate-300 p-3 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-[#0e4891] focus:bg-blue-50/20 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-800 tracking-wider mb-2">
              Cara Memperoleh / Bentuk Salinan <span className="text-red-600">*</span>
            </label>
            <select
              name="cara_memperoleh"
              value={form.cara_memperoleh}
              onChange={handleChange}
              className="w-full rounded-lg border-2 border-slate-300 p-3 text-sm font-semibold text-slate-900 bg-white focus:border-[#0e4891] focus:outline-none"
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

          <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-xs text-blue-900 leading-relaxed">
            ℹ️ <strong>Batas Waktu Pengolahan (SLA):</strong> Sesuai UU KIP No. 14 Tahun 2008, permohonan ini memiliki batas waktu jawaban maksimal <strong>10 hari kerja</strong> sejak diajukan.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#0e4891] hover:bg-[#0a366f] py-4 text-sm font-extrabold text-white tracking-wider uppercase shadow-lg transition active:scale-98 disabled:opacity-50"
          >
            {loading ? 'Mengirim Permohonan...' : 'KIRIM PERMOHONAN INFORMASI'}
          </button>
        </form>
      </div>
    </div>
  )
}