'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/app/lib/supabase/client'

type Profile = {
  nama: string
  nik: string | null
  email: string | null
  telepon: string | null
}

type Permohonan = {
  id: number
  user_id: string
  jenis_informasi: string
  deskripsi: string
  cara_memperoleh: string
  status: 'diajukan' | 'diproses' | 'dijawab' | 'ditolak'
  jawaban_admin: string | null
  deadline_awal: string | null
  diperpanjang: boolean
  alasan_perpanjangan: string | null
  deadline_akhir: string | null
  created_at: string
  profiles?: Profile | null
}

export default function AdminDashboardPage() {
  const supabase = createClient()
  const [listPermohonan, setListPermohonan] = useState<Permohonan[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  // Fetch semua permohonan beserta profil pemohon
  const fetchPermohonan = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('permohonan')
      .select(`
        *,
        profiles (
          nama,
          nik,
          email,
          telepon
        )
      `)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setListPermohonan(data as unknown as Permohonan[])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPermohonan()
  }, [])

  // Update status (Diproses)
  const handleSetDiproses = async (id: number) => {
    setUpdatingId(id)
    const { error } = await supabase
      .from('permohonan')
      .update({ status: 'diproses' })
      .eq('id', id)

    if (error) alert('Gagal memperbarui status: ' + error.message)
    else fetchPermohonan()
    setUpdatingId(null)
  }

  // Jawab permohonan (Dijawab)
  const handleJawab = async (id: number) => {
    const jawaban = prompt('Masukkan teks jawaban / tautan dokumen untuk pemohon:')
    if (!jawaban || !jawaban.trim()) return

    setUpdatingId(id)
    const { error } = await supabase
      .from('permohonan')
      .update({
        status: 'dijawab',
        jawaban_admin: jawaban.trim(),
      })
      .eq('id', id)

    if (error) alert('Gagal mengirim jawaban: ' + error.message)
    else fetchPermohonan()
    setUpdatingId(null)
  }

  // Tolak permohonan (Ditolak)
  const handleTolak = async (id: number) => {
    const alasan = prompt('Masukkan alasan penolakan permohonan ini:')
    if (!alasan || !alasan.trim()) return

    setUpdatingId(id)
    const { error } = await supabase
      .from('permohonan')
      .update({
        status: 'ditolak',
        jawaban_admin: `[DITOLAK] Alasan: ${alasan.trim()}`,
      })
      .eq('id', id)

    if (error) alert('Gagal menolak permohonan: ' + error.message)
    else fetchPermohonan()
    setUpdatingId(null)
  }

  // Perpanjang SLA (+7 Hari Kerja)
  const handlePerpanjangSLA = async (item: Permohonan) => {
    const alasan = prompt('Masukkan alasan perpanjangan waktu SLA (+7 hari kerja):')
    if (!alasan || !alasan.trim()) return

    setUpdatingId(item.id)

    // Hitung deadline akhir (+7 hari kerja dari deadline_awal)
    const baseDate = new Date(item.deadline_awal || item.created_at)
    let count = 0
    const newDeadline = new Date(baseDate)
    while (count < 7) {
      newDeadline.setDate(newDeadline.getDate() + 1)
      const day = newDeadline.getDay()
      if (day !== 0 && day !== 6) count++
    }
    const deadlineAkhirStr = newDeadline.toISOString().split('T')[0]

    const { error } = await supabase
      .from('permohonan')
      .update({
        diperpanjang: true,
        alasan_perpanjangan: alasan.trim(),
        deadline_akhir: deadlineAkhirStr,
      })
      .eq('id', item.id)

    if (error) alert('Gagal memperpanjang SLA: ' + error.message)
    else fetchPermohonan()
    setUpdatingId(null)
  }

  // Hitung statistik ringkas
  const countDiajukan = listPermohonan.filter((p) => p.status === 'diajukan').length
  const countDiproses = listPermohonan.filter((p) => p.status === 'diproses').length

  return (
    <div>
      {/* HEADER DASHBOARD */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Kelola Permohonan Informasi</h1>
          <p className="text-sm text-slate-600 mt-1">
            Tinjau permohonan masuk, berikan jawaban resmi, dan kelola SLA.
          </p>
        </div>
        <button
          onClick={fetchPermohonan}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition"
        >
          🔄 Refresh Data
        </button>
      </div>

      {/* STATS BADGES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-400">Total Permohonan</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{listPermohonan.length}</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 shadow-sm">
          <p className="text-xs font-bold uppercase text-amber-700">Perlu Diproses</p>
          <p className="text-2xl font-black text-amber-900 mt-1">{countDiajukan}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 shadow-sm">
          <p className="text-xs font-bold uppercase text-blue-700">Sedang Diproses</p>
          <p className="text-2xl font-black text-blue-900 mt-1">{countDiproses}</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 shadow-sm">
          <p className="text-xs font-bold uppercase text-emerald-700">Selesai / Dijawab</p>
          <p className="text-2xl font-black text-emerald-900 mt-1">
            {listPermohonan.filter((p) => p.status === 'dijawab').length}
          </p>
        </div>
      </div>

      {/* LIST PERMOHONAN */}
      {loading ? (
        <div className="p-8 text-center text-slate-500 font-medium">Memuat data permohonan...</div>
      ) : listPermohonan.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center text-slate-500 font-medium">
          Belum ada permohonan informasi yang masuk.
        </div>
      ) : (
        <div className="space-y-6">
          {listPermohonan.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition"
            >
              {/* HEADER KARTU */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-slate-900">
                      {item.profiles?.nama || 'Pemohon'}
                    </h2>
                    {item.profiles?.nik && (
                      <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-md text-slate-600 font-mono">
                        NIK: {item.profiles.nik}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Email: {item.profiles?.email || '-'} | WA/Telp: {item.profiles?.telepon || '-'} | Diajukan:{' '}
                    {new Date(item.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                {/* BADGE STATUS & SLA */}
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black uppercase ${
                      item.status === 'dijawab'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'ditolak'
                        ? 'bg-rose-100 text-rose-800'
                        : item.status === 'diproses'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {item.status}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    Deadline SLA: {item.deadline_akhir || item.deadline_awal || '-'}
                  </span>
                </div>
              </div>

              {/* DETAIL PERMOHONAN */}
              <div className="mt-4 text-sm space-y-2">
                <div>
                  <span className="inline-block bg-blue-50 text-[#0e4891] font-bold text-xs px-2.5 py-0.5 rounded-md mb-1">
                    {item.jenis_informasi}
                  </span>
                  <p className="font-bold text-slate-800">Deskripsi / Rincian Kebutuhan:</p>
                  <p className="text-slate-600 whitespace-pre-line leading-relaxed mt-0.5">
                    {item.deskripsi}
                  </p>
                </div>
                <p className="text-xs text-slate-500 italic">
                  Cara Memperoleh: {item.cara_memperoleh}
                </p>
              </div>

              {/* JAWABAN ADMIN (JIKA ADA) */}
              {item.jawaban_admin && (
                <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs">
                  <p className="font-bold text-slate-900">Jawaban Admin Saat Ini:</p>
                  <p className="text-slate-700 whitespace-pre-line mt-1">{item.jawaban_admin}</p>
                </div>
              )}

              {/* ALASAN PERPANJANGAN (JIKA ADA) */}
              {item.diperpanjang && item.alasan_perpanjangan && (
                <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
                  <strong>Status Perpanjangan SLA:</strong> Diperpanjang 7 hari kerja ({item.alasan_perpanjangan})
                </div>
              )}

              {/* ACTION BUTTONS */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <div className="flex flex-wrap gap-2">
                  {!item.diperpanjang && item.status !== 'dijawab' && item.status !== 'ditolak' && (
                    <button
                      disabled={updatingId === item.id}
                      onClick={() => handlePerpanjangSLA(item)}
                      className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100 disabled:opacity-50"
                    >
                      ⏱️ Perpanjang SLA (+7 Hari)
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {item.status === 'diajukan' && (
                    <button
                      disabled={updatingId === item.id}
                      onClick={() => handleSetDiproses(item.id)}
                      className="rounded-lg bg-amber-500 px-4 py-1.5 text-xs font-bold text-white hover:bg-amber-600 disabled:opacity-50"
                    >
                      Proses Permohonan
                    </button>
                  )}

                  <button
                    disabled={updatingId === item.id}
                    onClick={() => handleJawab(item.id)}
                    className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    💬 Jawab Permohonan
                  </button>

                  <button
                    disabled={updatingId === item.id}
                    onClick={() => handleTolak(item.id)}
                    className="rounded-lg bg-rose-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50"
                  >
                    ❌ Tolak
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}