'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/app/lib/supabase/client'

type Permohonan = {
  id: string
  nama_pemohon: string
  nik: string
  no_hp: string
  alamat: string
  rincian_informasi: string
  tujuan_penggunaan: string
  cara_memperoleh: string
  cara_mendapatkan: string
  lampiran_ktp: string | null
  status: 'diajukan' | 'diproses' | 'disetujui' | 'ditolak'
  alasan_penolakan: string | null
  created_at: string
}

export default function AdminDashboardPage() {
  const supabase = createClient()
  const [listPermohonan, setListPermohonan] = useState<Permohonan[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Fetch semua permohonan
  const fetchPermohonan = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('permohonan')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setListPermohonan(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPermohonan()
  }, [])

  // Fungsi update status permohonan
  const handleUpdateStatus = async (id: string, newStatus: Permohonan['status']) => {
    setUpdatingId(id)
    let alasan = null

    if (newStatus === 'ditolak') {
      alasan = prompt('Masukkan alasan penolakan permohonan ini:')
      if (!alasan) {
        setUpdatingId(null)
        return
      }
    }

    const { error } = await supabase
      .from('permohonan')
      .update({
        status: newStatus,
        alasan_penolakan: alasan,
      })
      .eq('id', id)

    if (error) {
      alert('Gagal memperbarui status: ' + error.message)
    } else {
      fetchPermohonan()
    }
    setUpdatingId(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Permohonan Informasi</h1>
          <p className="text-sm text-gray-600">
            Daftar seluruh permohonan informasi publik yang diajukan oleh pemohon.
          </p>
        </div>
        <button
          onClick={fetchPermohonan}
          className="rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Refresh Data
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Memuat data permohonan...</div>
      ) : listPermohonan.length === 0 ? (
        <div className="rounded-2xl border bg-white p-12 text-center text-gray-500">
          Belum ada permohonan informasi yang masuk.
        </div>
      ) : (
        <div className="space-y-6">
          {listPermohonan.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-gray-900">{item.nama_pemohon}</h2>
                    <span className="text-xs bg-gray-100 px-2.5 py-1 rounded-md text-gray-600">
                      NIK: {item.nik}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    No HP/WA: {item.no_hp} | Diajukan pada:{' '}
                    {new Date(item.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                {/* BADGE STATUS */}
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                      item.status === 'disetujui'
                        ? 'bg-green-100 text-green-700'
                        : item.status === 'ditolak'
                        ? 'bg-red-100 text-red-700'
                        : item.status === 'diproses'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>

              {/* DETAIL PERMOHONAN */}
              <div className="mt-4 grid gap-4 md:grid-cols-2 text-sm">
                <div>
                  <p className="font-semibold text-gray-700">Rincian Informasi:</p>
                  <p className="text-gray-600 mt-1">{item.rincian_informasi}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Tujuan Penggunaan:</p>
                  <p className="text-gray-600 mt-1">{item.tujuan_penggunaan}</p>
                </div>
              </div>

              {item.alasan_penolakan && (
                <div className="mt-4 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                  <strong>Alasan Penolakan:</strong> {item.alasan_penolakan}
                </div>
              )}

              {/* ACTION BUTTONS ADMIN */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t pt-4">
                <span className="text-xs text-gray-500">
                  Cara Memperoleh: {item.cara_memperoleh.replace('_', ' ')}
                </span>

                <div className="flex flex-wrap gap-2">
                  <button
                    disabled={updatingId === item.id}
                    onClick={() => handleUpdateStatus(item.id, 'diproses')}
                    className="rounded-lg bg-yellow-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-yellow-600 disabled:opacity-50"
                  >
                    Proses
                  </button>
                  <button
                    disabled={updatingId === item.id}
                    onClick={() => handleUpdateStatus(item.id, 'disetujui')}
                    className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    Setujui
                  </button>
                  <button
                    disabled={updatingId === item.id}
                    onClick={() => handleUpdateStatus(item.id, 'ditolak')}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    Tolak
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