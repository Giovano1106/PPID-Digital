'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/app/lib/supabase/client'
import Modal from '@/components/Modal'
import Toast, { ToastType } from '@/components/Toast'

type KontenLanding = {
  id: number
  section_key: string
  judul: string
  isi_teks: string
}

type DokumenPublik = {
  id: number | bigint
  kategori_key: string
  nama_dokumen: string
  file_url: string
}

export default function AdminKontenPage() {
  const supabase = createClient()
  const [listKonten, setListKonten] = useState<KontenLanding[]>([])
  const [listDokumen, setListDokumen] = useState<DokumenPublik[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)

  // State Toast
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  // State Modals
  const [activeModal, setActiveModal] = useState<'addDoc' | 'editDoc' | 'deleteDoc' | null>(null)
  const [targetKategoriKey, setTargetKategoriKey] = useState<string>('')
  const [selectedDoc, setSelectedDoc] = useState<DokumenPublik | null>(null)

  // Form Inputs
  const [docNama, setDocNama] = useState('')
  const [docUrl, setDocUrl] = useState('')

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type })
  }

  const fetchData = async () => {
    setLoading(true)
    const [kontenRes, dokumenRes] = await Promise.all([
      supabase.from('konten_landing').select('id, section_key, judul, isi_teks').order('id', { ascending: true }),
      supabase.from('dokumen_publik').select('*').order('created_at', { ascending: true })
    ])

    if (!kontenRes.error && kontenRes.data) setListKonten(kontenRes.data)
    if (!dokumenRes.error && dokumenRes.data) setListDokumen(dokumenRes.data)
    
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Handle perubahan input text kategori
  const handleInputChange = (id: number, field: keyof KontenLanding, value: string) => {
    setListKonten((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
  }

  // Simpan perubahan kategori ke Supabase
  const handleSaveKategori = async (item: KontenLanding) => {
    setSavingId(`kat-${item.id}`)

    const { error } = await supabase
      .from('konten_landing')
      .update({
        judul: item.judul,
        isi_teks: item.isi_teks,
      })
      .eq('id', item.id)

    if (error) {
      showToast(`Gagal menyimpan kategori: ${error.message}`, 'error')
    } else {
      showToast(`Judul & deskripsi kategori "${item.section_key}" berhasil diperbarui!`)
    }
    setSavingId(null)
  }

  // Buka Modal Tambah Dokumen
  const openAddDocModal = (kategoriKey: string) => {
    setTargetKategoriKey(kategoriKey)
    setDocNama('')
    setDocUrl('')
    setActiveModal('addDoc')
  }

  // Submit Tambah Dokumen
  const handleAddDokumenSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetKategoriKey || !docNama.trim() || !docUrl.trim()) return

    setSavingId('add-doc')
    const { data: userData } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('dokumen_publik')
      .insert({
        kategori_key: targetKategoriKey,
        nama_dokumen: docNama.trim(),
        file_url: docUrl.trim(),
        uploaded_by: userData?.user?.id
      })

    if (error) {
      showToast(`Gagal menambah dokumen: ${error.message}`, 'error')
    } else {
      showToast('Dokumen PDF berhasil ditambahkan!')
      setActiveModal(null)
      fetchData()
    }
    setSavingId(null)
  }

  // Buka Modal Edit Dokumen
  const openEditDocModal = (doc: DokumenPublik) => {
    setSelectedDoc(doc)
    setDocNama(doc.nama_dokumen)
    setDocUrl(doc.file_url)
    setActiveModal('editDoc')
  }

  // Submit Edit Dokumen
  const handleEditDokumenSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDoc || !docNama.trim() || !docUrl.trim()) return

    setSavingId(`edit-doc-${selectedDoc.id}`)

    const { error } = await supabase
      .from('dokumen_publik')
      .update({
        nama_dokumen: docNama.trim(),
        file_url: docUrl.trim(),
      })
      .eq('id', selectedDoc.id)

    if (error) {
      showToast(`Gagal memperbarui dokumen: ${error.message}`, 'error')
    } else {
      showToast('Dokumen berhasil diperbarui!')
      setActiveModal(null)
      fetchData()
    }
    setSavingId(null)
  }

  // Buka Modal Hapus Dokumen
  const openDeleteDocModal = (doc: DokumenPublik) => {
    setSelectedDoc(doc)
    setActiveModal('deleteDoc')
  }

  // Submit Hapus Dokumen
  const handleDeleteDokumenSubmit = async () => {
    if (!selectedDoc) return

    setSavingId(`del-doc-${selectedDoc.id}`)
    const { error } = await supabase
      .from('dokumen_publik')
      .delete()
      .eq('id', selectedDoc.id)

    if (error) {
      showToast(`Gagal menghapus dokumen: ${error.message}`, 'error')
    } else {
      showToast('Dokumen telah berhasil dihapus dari CMS.', 'info')
      setActiveModal(null)
      fetchData()
    }
    setSavingId(null)
  }

  return (
    <div className="pb-12 font-plus-jakarta">
      {/* TOAST NOTIFICATION */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* HEADER PAGE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-black text-2xl md:text-3xl text-slate-900 tracking-tight">Kelola CMS & Dokumen Publik</h1>
          <p className="text-xs md:text-sm text-slate-600 font-medium mt-1">
            Perbarui deskripsi kategori dan kelola file PDF Google Drive untuk masing-masing kategori.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2 self-start md:self-auto"
        >
          🔄 Refresh Data
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-2xl">Memuat data CMS...</div>
      ) : (
        <div className="space-y-8">
          {listKonten.map((kategori) => {
            const docs = listDokumen.filter(d => d.kategori_key === kategori.section_key)

            return (
              <div
                key={kategori.id}
                className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
              >
                {/* Header Kategori */}
                <div className="bg-slate-100 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                    📂 Kategori: {kategori.section_key.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {docs.length} File Terunggah
                  </span>
                </div>

                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* KIRI: Edit Deskripsi Kategori */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">Deskripsi Tampilan Kategori</h3>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Judul Kategori</label>
                      <input
                        type="text"
                        value={kategori.judul || ''}
                        onChange={(e) => handleInputChange(kategori.id, 'judul', e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs font-medium text-slate-900 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-all shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Deskripsi Singkat (Isi Teks)</label>
                      <textarea
                        rows={3}
                        value={kategori.isi_teks || ''}
                        onChange={(e) => handleInputChange(kategori.id, 'isi_teks', e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs font-medium text-slate-900 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-all shadow-sm leading-relaxed"
                      />
                    </div>
                    <button
                      disabled={savingId === `kat-${kategori.id}`}
                      onClick={() => handleSaveKategori(kategori)}
                      className="rounded-xl bg-[#0e4891] hover:bg-[#0a366f] px-4 py-2.5 text-xs font-bold text-white transition-all disabled:opacity-50 shadow-sm"
                    >
                      {savingId === `kat-${kategori.id}` ? 'Menyimpan...' : 'Simpan Deskripsi'}
                    </button>
                  </div>

                  {/* KANAN: Daftar Dokumen */}
                  <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <h3 className="font-bold text-sm text-slate-900">Daftar File PDF Google Drive</h3>
                      <button
                        onClick={() => openAddDocModal(kategori.section_key)}
                        className="text-xs bg-[#0e4891] hover:bg-[#0a366f] text-white font-bold py-2 px-3.5 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <span>+</span> Tambah Dokumen
                      </button>
                    </div>

                    {/* List Dokumen */}
                    {docs.length === 0 ? (
                      <div className="text-xs text-slate-500 italic py-6 text-center">Belum ada dokumen PDF diunggah untuk kategori ini.</div>
                    ) : (
                      <ul className="space-y-3">
                        {docs.map(doc => (
                          <li key={doc.id.toString()} className="flex items-start justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <div className="overflow-hidden flex-1">
                              <p className="text-xs font-bold text-slate-900 truncate" title={doc.nama_dokumen}>{doc.nama_dokumen}</p>
                              <a href={doc.file_url} target="_blank" rel="noreferrer" className="text-[11px] text-[#0e4891] hover:underline truncate block mt-1 font-mono">
                                {doc.file_url}
                              </a>
                            </div>
                            <div className="flex shrink-0 gap-1.5">
                              <button
                                onClick={() => openEditDocModal(doc)}
                                className="text-slate-600 hover:text-[#0e4891] hover:bg-slate-100 p-2 rounded-lg transition-colors border border-slate-200"
                                title="Edit dokumen"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => openDeleteDocModal(doc)}
                                className="text-slate-600 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-colors border border-slate-200"
                                title="Hapus dokumen"
                              >
                                🗑️
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* MODAL TAMBAH DOKUMEN */}
      <Modal
        isOpen={activeModal === 'addDoc'}
        onClose={() => setActiveModal(null)}
        title="➕ Tambah Dokumen PDF Baru"
      >
        <form onSubmit={handleAddDokumenSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Nama Dokumen / Berkas</label>
            <input
              required
              type="text"
              value={docNama}
              onChange={e => setDocNama(e.target.value)}
              placeholder="Contoh: Laporan Realisasi Anggaran 2024"
              className="w-full text-xs border border-slate-300 rounded-xl bg-white p-3 text-slate-900 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Link Google Drive PDF</label>
            <input
              required
              type="url"
              value={docUrl}
              onChange={e => setDocUrl(e.target.value)}
              placeholder="https://drive.google.com/file/d/..."
              className="w-full text-xs border border-slate-300 rounded-xl bg-white p-3 text-slate-900 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 outline-none transition-all"
            />
            <p className="text-[11px] text-slate-500 mt-1.5 leading-normal">
              💡 Pastikan akses link Google Drive sudah disetel ke <strong>"Siapa saja yang memiliki link (Viewer)"</strong>.
            </p>
          </div>
          <div className="flex gap-3 justify-end pt-3">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="text-xs font-bold px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={savingId === 'add-doc'}
              className="text-xs px-5 py-2 bg-[#0e4891] hover:bg-[#0a366f] text-white font-bold rounded-xl shadow-sm disabled:opacity-50 transition-all"
            >
              {savingId === 'add-doc' ? 'Menyimpan...' : 'Simpan Dokumen'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL EDIT DOKUMEN */}
      <Modal
        isOpen={activeModal === 'editDoc'}
        onClose={() => setActiveModal(null)}
        title="✏️ Edit Dokumen PDF"
      >
        <form onSubmit={handleEditDokumenSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Edit Nama Dokumen</label>
            <input
              required
              type="text"
              value={docNama}
              onChange={e => setDocNama(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-xl bg-white p-3 text-slate-900 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Edit Link Google Drive PDF</label>
            <input
              required
              type="url"
              value={docUrl}
              onChange={e => setDocUrl(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-xl bg-white p-3 text-slate-900 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 outline-none transition-all"
            />
          </div>
          <div className="flex gap-3 justify-end pt-3">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="text-xs font-bold px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={savingId?.startsWith('edit-doc')}
              className="text-xs px-5 py-2 bg-[#0e4891] hover:bg-[#0a366f] text-white font-bold rounded-xl shadow-sm disabled:opacity-50 transition-all"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL HAPUS DOKUMEN */}
      <Modal
        isOpen={activeModal === 'deleteDoc'}
        onClose={() => setActiveModal(null)}
        title="🗑️ Hapus Dokumen PDF"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-700 font-medium leading-relaxed">
            Apakah Anda yakin ingin menghapus dokumen <strong className="text-slate-900 font-bold">{selectedDoc?.nama_dokumen}</strong> dari sistem? Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="text-xs font-bold px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={savingId?.startsWith('del-doc')}
              onClick={handleDeleteDokumenSubmit}
              className="text-xs px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-sm disabled:opacity-50 transition-all"
            >
              Ya, Hapus Dokumen
            </button>
          </div>
        </div>
      </Modal>

    </div>
  )
}