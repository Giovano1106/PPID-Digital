'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/app/lib/supabase/client'

type KontenLanding = {
  id: number
  section_key: string
  judul: string
  isi_teks: string
  link_drive: string | null
}

export default function AdminKontenPage() {
  const supabase = createClient()
  const [listKonten, setListKonten] = useState<KontenLanding[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [message, setMessage] = useState('')

  // Fetch data dari tabel konten_landing
  const fetchKonten = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('konten_landing')
      .select('*')
      .order('id', { ascending: true })

    if (!error && data) {
      setListKonten(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchKonten()
  }, [])

  // Handle perubahan input lokal
  const handleInputChange = (id: number, field: keyof KontenLanding, value: string) => {
    setListKonten((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
  }

  // Simpan perubahan ke Supabase
  const handleSave = async (item: KontenLanding) => {
    setSavingId(item.id)
    setMessage('')

    const { error } = await supabase
      .from('konten_landing')
      .update({
        judul: item.judul,
        isi_teks: item.isi_teks,
        link_drive: item.link_drive,
      })
      .eq('id', item.id)

    if (error) {
      setMessage(`❌ Gagal menyimpan: ${error.message}`)
    } else {
      setMessage(`✅ Konten "${item.section_key}" berhasil diperbarui!`)
    }

    setSavingId(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Konten Landing Page</h1>
          <p className="text-sm text-gray-600">
            Perbarui deskripsi dan tautan Google Drive untuk masing-masing kategori informasi publik.
          </p>
        </div>
        <button
          onClick={fetchKonten}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {message && (
        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          {message}
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-gray-500">Memuat data konten...</div>
      ) : listKonten.length === 0 ? (
        <div className="rounded-2xl border bg-white p-12 text-center text-gray-500">
          Belum ada data konten di tabel <code>konten_landing</code>.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {listKonten.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                    {item.section_key.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-gray-400">ID: {item.id}</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Judul Kategori
                  </label>
                  <input
                    type="text"
                    value={item.judul || ''}
                    onChange={(e) => handleInputChange(item.id, 'judul', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-sm font-semibold focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Deskripsi Singkat (Isi Teks)
                  </label>
                  <textarea
                    rows={3}
                    value={item.isi_teks || ''}
                    onChange={(e) => handleInputChange(item.id, 'isi_teks', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Link Google Drive / Repository Dokumen
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={item.link_drive || ''}
                    onChange={(e) => handleInputChange(item.id, 'link_drive', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-sm text-blue-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                disabled={savingId === item.id}
                onClick={() => handleSave(item)}
                className="mt-6 w-full rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white shadow hover:bg-blue-700 transition active:scale-95 disabled:opacity-50"
              >
                {savingId === item.id ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}