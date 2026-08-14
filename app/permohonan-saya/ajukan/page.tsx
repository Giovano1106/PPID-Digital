'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/client'

export default function FormPermohonanPage() {
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    nama_pemohon: '',
    nik: '',
    no_hp: '',
    alamat: '',
    rincian_informasi: '',
    tujuan_penggunaan: '',
    cara_memperoleh: 'melihat_membaca',
    cara_mendapatkan: 'salinan_cetak',
  })

  const [fileKtp, setFileKtp] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setErrorMsg('Sesi Anda telah berakhir. Silakan login kembali.')
      setLoading(false)
      return
    }

    let fileUrl = null

    // 1. Upload KTP ke Supabase Storage
    if (fileKtp) {
      const fileExt = fileKtp.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('berkas-ktp')
        .upload(fileName, fileKtp)

      if (uploadError) {
        setErrorMsg(`Gagal mengunggah file KTP: ${uploadError.message}`)
        setLoading(false)
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from('berkas-ktp')
        .getPublicUrl(fileName)

      fileUrl = publicUrlData.publicUrl
    }

    // 2. Simpan permohonan ke Database
    const { error: insertError } = await supabase.from('permohonan').insert({
      user_id: user.id,
      nama_pemohon: form.nama_pemohon,
      nik: form.nik,
      no_hp: form.no_hp,
      alamat: form.alamat,
      rincian_informasi: form.rincian_informasi,
      tujuan_penggunaan: form.tujuan_penggunaan,
      cara_memperoleh: form.cara_memperoleh,
      cara_mendapatkan: form.cara_mendapatkan,
      lampiran_ktp: fileUrl,
      status: 'diajukan',
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
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header Form CIKASDA */}
      <div className="bg-[#0e4891] rounded-2xl p-6 md:p-8 text-white shadow-lg mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400 opacity-10 rounded-full blur-2xl"></div>
        <div className="inline-block w-12 h-1 bg-amber-400 mb-3 rounded-full"></div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide">
          FORMULIR PERMOHONAN INFORMASI PUBLIK
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

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SECTION 1: IDENTITAS PEMOHON */}
          <div>
            <div className="flex items-center gap-3 border-b-2 border-[#0e4891] pb-2 mb-6">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#0e4891] text-white text-xs font-bold">1</span>
              <h2 className="text-lg font-bold text-slate-900 tracking-wide uppercase">Identitas Pemohon</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-800 tracking-wider mb-2">
                  Nama Lengkap (Sesuai KTP) <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="nama_pemohon"
                  required
                  value={form.nama_pemohon}
                  onChange={handleChange}
                  placeholder="Masukkan nama lengkap"
                  className="w-full rounded-lg border-2 border-slate-300 p-3 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-[#0e4891] focus:bg-blue-50/20 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-800 tracking-wider mb-2">
                  NIK (KTP) <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="nik"
                  required
                  value={form.nik}
                  onChange={handleChange}
                  placeholder="16 digit angka NIK"
                  className="w-full rounded-lg border-2 border-slate-300 p-3 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-[#0e4891] focus:bg-blue-50/20 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-800 tracking-wider mb-2">
                  No. WhatsApp / Telepon <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="no_hp"
                  required
                  value={form.no_hp}
                  onChange={handleChange}
                  placeholder="0812xxxxxxxx"
                  className="w-full rounded-lg border-2 border-slate-300 p-3 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-[#0e4891] focus:bg-blue-50/20 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-800 tracking-wider mb-2">
                  Unggah File KTP (JPG / PNG / PDF) <span className="text-red-600">*</span>
                </label>
                <input
                  type="file"
                  required
                  accept="image/*,.pdf"
                  onChange={(e) => setFileKtp(e.target.files?.[0] || null)}
                  className="w-full rounded-lg border-2 border-slate-300 p-2 text-sm font-medium text-slate-800 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-[#0e4891] file:text-white file:text-xs file:font-bold hover:file:bg-[#0a366f]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase text-slate-800 tracking-wider mb-2">
                  Alamat Lengkap <span className="text-red-600">*</span>
                </label>
                <textarea
                  name="alamat"
                  required
                  rows={2}
                  value={form.alamat}
                  onChange={handleChange}
                  placeholder="Alamat domisili lengkap sesuai KTP"
                  className="w-full rounded-lg border-2 border-slate-300 p-3 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-[#0e4891] focus:bg-blue-50/20 focus:outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: RINCIAN PERMOHONAN */}
          <div>
            <div className="flex items-center gap-3 border-b-2 border-[#0e4891] pb-2 mb-6">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#0e4891] text-white text-xs font-bold">2</span>
              <h2 className="text-lg font-bold text-slate-900 tracking-wide uppercase">Rincian Informasi Publik</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-800 tracking-wider mb-2">
                  Rincian Informasi yang Dibutuhkan <span className="text-red-600">*</span>
                </label>
                <textarea
                  name="rincian_informasi"
                  required
                  rows={4}
                  value={form.rincian_informasi}
                  onChange={handleChange}
                  placeholder="Jelaskan secara spesifik dokumen atau data informasi publik yang Anda minta..."
                  className="w-full rounded-lg border-2 border-slate-300 p-3 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-[#0e4891] focus:bg-blue-50/20 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-800 tracking-wider mb-2">
                  Tujuan Penggunaan Informasi <span className="text-red-600">*</span>
                </label>
                <textarea
                  name="tujuan_penggunaan"
                  required
                  rows={3}
                  value={form.tujuan_penggunaan}
                  onChange={handleChange}
                  placeholder="Sebutkan tujuan penggunaan informasi tersebut (misal: Penelitian Akademis / Bahan Analisis)..."
                  className="w-full rounded-lg border-2 border-slate-300 p-3 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-[#0e4891] focus:bg-blue-50/20 focus:outline-none transition"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-800 tracking-wider mb-2">
                    Cara Memperoleh Informasi
                  </label>
                  <select
                    name="cara_memperoleh"
                    value={form.cara_memperoleh}
                    onChange={handleChange}
                    className="w-full rounded-lg border-2 border-slate-300 p-3 text-sm font-semibold text-slate-900 bg-white focus:border-[#0e4891] focus:outline-none"
                  >
                    <option value="melihat_membaca">Melihat / Membaca / Mendengarkan</option>
                    <option value="mendapatkan_salinan">Mendapatkan Salinan Informasi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-800 tracking-wider mb-2">
                    Bentuk Salinan Informasi
                  </label>
                  <select
                    name="cara_mendapatkan"
                    value={form.cara_mendapatkan}
                    onChange={handleChange}
                    className="w-full rounded-lg border-2 border-slate-300 p-3 text-sm font-semibold text-slate-900 bg-white focus:border-[#0e4891] focus:outline-none"
                  >
                    <option value="salinan_cetak">Salinan Cetak (Hardcopy)</option>
                    <option value="salinan_elektronik">Salinan Elektronik (Softcopy / Digital)</option>
                  </select>
                </div>
              </div>
            </div>
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