'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import Modal from '@/components/Modal'
import ConfirmModal from '@/components/ConfirmModal'
import Toast, { ToastType } from '@/components/Toast'
import {
  FolderOpen,
  PencilSimple,
  Trash,
  Plus,
  Lightbulb,
  ArrowsClockwise,
  Table,
  ArrowRight,
  ArrowSquareOut,
  Files,
  Target,
  Scroll,
  Handshake,
  Trophy,
  Scales,
  MagnifyingGlass,
  FilePdf,
  CheckCircle,
  Info
} from '@phosphor-icons/react'

import {
  getAdminKonten,
  updateKontenKategori,
  addDokumen,
  updateDokumen,
  deleteDokumen
} from '@/app/actions/admin'

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

// Icon mapper per kategori agar visual rapi & profesional
const getCategoryIcon = (key: string) => {
  switch (key) {
    case 'daftar_informasi_publik':
      return Table
    case 'surat_keputusan':
      return Files
    case 'visi_misi':
      return Target
    case 'sop_spm':
      return Scroll
    case 'pelayanan':
      return Handshake
    case 'penghargaan':
      return Trophy
    case 'permohonan_informasi':
      return Scales
    case 'dokumen_program_kegiatan':
    default:
      return FolderOpen
  }
}

// Format judul kategori ramah pengguna
function formatCategoryLabel(key: string) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())
}

export default function AdminKontenPage() {
  const [listKonten, setListKonten] = useState<KontenLanding[]>([])
  const [listDokumen, setListDokumen] = useState<DokumenPublik[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)

  // Active Category Selection (Master-Detail)
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>('daftar_informasi_publik')
  const [categorySearch, setCategorySearch] = useState('')
  const [docSearch, setDocSearch] = useState('')

  // State Toast & Modals
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  const [activeModal, setActiveModal] = useState<'addDoc' | 'editDoc' | null>(null)
  const [deleteDocItem, setDeleteDocItem] = useState<DokumenPublik | null>(null)
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
    const result = await getAdminKonten()

    if (result.success && result.data) {
      setListKonten(result.data.konten as KontenLanding[])
      setListDokumen(result.data.dokumen as DokumenPublik[])
    } else {
      showToast('Gagal memuat data: ' + result.error, 'error')
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Cari kategori aktif
  const activeKategori = useMemo(() => {
    return listKonten.find((k) => k.section_key === selectedCategoryKey) || listKonten[0] || null
  }, [listKonten, selectedCategoryKey])

  // Dokumen pada kategori aktif
  const activeCategoryDocs = useMemo(() => {
    if (!activeKategori) return []
    let docs = listDokumen.filter((d) => d.kategori_key === activeKategori.section_key)
    if (docSearch.trim()) {
      const q = docSearch.toLowerCase()
      docs = docs.filter((d) => d.nama_dokumen.toLowerCase().includes(q))
    }
    return docs
  }, [listDokumen, activeKategori, docSearch])

  // Filter daftar kategori di kolom kiri
  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return listKonten
    const q = categorySearch.toLowerCase()
    return listKonten.filter(
      (k) =>
        k.judul.toLowerCase().includes(q) ||
        k.section_key.toLowerCase().includes(q)
    )
  }, [listKonten, categorySearch])

  // Handle perubahan input text kategori
  const handleInputChange = (id: number, field: keyof KontenLanding, value: string) => {
    setListKonten((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
  }

  // Simpan perubahan kategori menggunakan Server Actions
  const handleSaveKategori = async (item: KontenLanding) => {
    setSavingId(`kat-${item.id}`)

    const result = await updateKontenKategori(item.id, item.judul, item.isi_teks)

    if (!result.success) {
      showToast(`Gagal menyimpan kategori: ${result.error}`, 'error')
    } else {
      showToast(`Judul & deskripsi kategori "${formatCategoryLabel(item.section_key)}" berhasil diperbarui!`)
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
    if (!docNama.trim() || !docUrl.trim()) {
      showToast('Harap lengkapi nama dokumen dan link Google Drive.', 'error')
      return
    }

    setSavingId('add-doc')
    const result = await addDokumen(targetKategoriKey, docNama.trim(), docUrl.trim())

    if (!result.success) {
      showToast(`Gagal menambah dokumen: ${result.error}`, 'error')
    } else {
      showToast('Dokumen baru berhasil ditambahkan!')
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
    if (!selectedDoc || !docNama.trim() || !docUrl.trim()) {
      showToast('Harap lengkapi nama dokumen dan link Google Drive.', 'error')
      return
    }

    setSavingId(`edit-doc-${selectedDoc.id}`)
    const result = await updateDokumen(selectedDoc.id, docNama.trim(), docUrl.trim())

    if (!result.success) {
      showToast(`Gagal memperbarui dokumen: ${result.error}`, 'error')
    } else {
      showToast('Dokumen berhasil diperbarui!')
      setActiveModal(null)
      fetchData()
    }
    setSavingId(null)
  }

  // Hapus Dokumen
  const openDeleteDocModal = (doc: DokumenPublik) => {
    setDeleteDocItem(doc)
  }

  const handleDeleteDokumenSubmit = async () => {
    if (!deleteDocItem) return

    setSavingId(`del-doc-${deleteDocItem.id}`)
    const result = await deleteDokumen(deleteDocItem.id)

    setDeleteDocItem(null)
    if (!result.success) {
      showToast(`Gagal menghapus dokumen: ${result.error}`, 'error')
    } else {
      showToast('Dokumen telah berhasil dihapus dari CMS.', 'info')
      fetchData()
    }
    setSavingId(null)
  }

  return (
    <div className="pb-16 font-plus-jakarta">
      {/* TOAST NOTIFICATION */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* CONFIRM MODAL HAPUS DOKUMEN */}
      <ConfirmModal
        isOpen={!!deleteDocItem}
        title="Hapus Dokumen PDF?"
        message={`Apakah Anda yakin ingin menghapus dokumen "${deleteDocItem?.nama_dokumen}"? Dokumen ini tidak akan lagi dapat diakses oleh publik.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        onConfirm={handleDeleteDokumenSubmit}
        onClose={() => setDeleteDocItem(null)}
        loading={savingId?.startsWith('del-doc-')}
        variant="danger"
      />

      {/* HEADER PAGE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100/70 text-[#0e4891] border border-blue-200">
              Workspace Konten & Berkas
            </span>
          </div>
          <h1 className="font-black text-2xl md:text-3xl text-slate-900 tracking-tight">
            Kelola CMS & Dokumen Publik
          </h1>
          <p className="text-xs md:text-sm text-slate-600 font-medium mt-1">
            Pilih kategori informasi di sebelah kiri untuk mengedit teks judul, deskripsi, dan file berkas PDF.
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs flex items-center gap-2 self-start md:self-auto cursor-pointer disabled:opacity-50"
        >
          <ArrowsClockwise weight="bold" size={16} className={loading ? 'animate-spin' : ''} />
          Refresh Data
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-16 bg-white rounded-2xl border border-slate-200 animate-pulse" />
            ))}
          </div>
          <div className="lg:col-span-8 space-y-6">
            <div className="h-48 bg-white rounded-2xl border border-slate-200 animate-pulse" />
            <div className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          </div>
        </div>
      ) : (
        /* MASTER-DETAIL WORKSPACE LAYOUT */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* KOLOM KIRI: DAFTAR KATEGORI (SELECTOR) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sticky top-6">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                Kategori Informasi ({listKonten.length})
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                Pilih untuk kelola
              </span>
            </div>

            {/* Pencarian Kategori */}
            <div className="relative mb-3">
              <MagnifyingGlass
                size={14}
                weight="bold"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Cari kategori..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-all"
              />
            </div>

            {/* List Kategori */}
            <div className="space-y-1.5">
              {filteredCategories.map((kat) => {
                const isSelected = kat.section_key === activeKategori?.section_key
                const IconComponent = getCategoryIcon(kat.section_key)
                const docCount = listDokumen.filter((d) => d.kategori_key === kat.section_key).length

                // Label badge status
                let badgeText = `${docCount} Dokumen`
                if (kat.section_key === 'visi_misi') badgeText = 'Profil Visual'
                else if (kat.section_key === 'daftar_informasi_publik') badgeText = 'Matriks Data'
                else if (kat.section_key === 'permohonan_informasi') badgeText = 'Alur & Regulasi'

                return (
                  <button
                    key={kat.id}
                    onClick={() => {
                      setSelectedCategoryKey(kat.section_key)
                      setDocSearch('')
                    }}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between gap-3 border cursor-pointer ${
                      isSelected
                        ? 'bg-[#0e4891] text-white border-[#0e4891] shadow-sm'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-white/15 text-white'
                            : 'bg-slate-100 text-[#0e4891]'
                        }`}
                      >
                        <IconComponent size={18} weight={isSelected ? 'fill' : 'bold'} />
                      </div>
                      <div className="overflow-hidden">
                        <span className="font-extrabold text-xs block leading-tight truncate">
                          {kat.judul || formatCategoryLabel(kat.section_key)}
                        </span>
                        <span
                          className={`text-[10px] block mt-0.5 truncate ${
                            isSelected ? 'text-blue-100' : 'text-slate-400'
                          }`}
                        >
                          /{kat.section_key}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 whitespace-nowrap ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {badgeText}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* KOLOM KANAN: WORKSPACE EDITOR TERFOKUS */}
          {activeKategori && (
            <div className="lg:col-span-8 space-y-8">
              
              {/* HEADER KATEGORI AKTIF */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0e4891] flex items-center justify-center shrink-0 border border-blue-100">
                    {(() => {
                      const Icon = getCategoryIcon(activeKategori.section_key)
                      return <Icon size={26} weight="bold" />
                    })()}
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Kategori Aktif
                    </span>
                    <h2 className="font-black text-xl text-slate-900 tracking-tight">
                      {activeKategori.judul || formatCategoryLabel(activeKategori.section_key)}
                    </h2>
                  </div>
                </div>

                <Link
                  href={`/informasi/${activeKategori.section_key}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all shadow-2xs shrink-0"
                >
                  <span>Lihat di Portal</span>
                  <ArrowSquareOut size={14} weight="bold" />
                </Link>
              </div>

              {/* CARD 1: EDIT JUDUL & DESKRIPSI KATEGORI */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
                <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
                  <span>Teks Pengantar & Deskripsi Kategori</span>
                  <span className="text-[11px] font-medium text-slate-500">
                    Tampil pada header halaman publik
                  </span>
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Judul Kategori
                    </label>
                    <input
                      type="text"
                      value={activeKategori.judul || ''}
                      onChange={(e) => handleInputChange(activeKategori.id, 'judul', e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs font-medium text-slate-900 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-all shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Deskripsi Pengantar (Isi Teks)
                    </label>
                    <textarea
                      rows={3}
                      value={activeKategori.isi_teks || ''}
                      onChange={(e) => handleInputChange(activeKategori.id, 'isi_teks', e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs font-medium text-slate-900 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-all shadow-2xs leading-relaxed"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      disabled={savingId === `kat-${activeKategori.id}`}
                      onClick={() => handleSaveKategori(activeKategori)}
                      className="rounded-xl bg-[#0e4891] hover:bg-[#0a366f] px-5 py-2.5 text-xs font-bold text-white transition-all disabled:opacity-50 shadow-sm cursor-pointer"
                    >
                      {savingId === `kat-${activeKategori.id}` ? 'Menyimpan...' : 'Simpan Perubahan Teks'}
                    </button>
                  </div>
                </div>
              </div>

              {/* CARD 2: KONTEN KHUSUS ATAU PENGELOLA FILE PDF */}
              {activeKategori.section_key === 'visi_misi' ? (
                /* KHUSUS: VISI DAN MISI */
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-8 text-center">
                  <div className="w-16 h-16 bg-blue-50 text-[#0e4891] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
                    <Target size={32} weight="fill" />
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900 mb-1">
                    Format Profil Visual Terstruktur
                  </h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed font-medium mb-6">
                    Kategori Visi & Misi disajikan dalam bentuk kartu ilustrasi visual interaktif pada portal publik. Kategori ini tidak memerlukan unggahan berkas PDF dokumen.
                  </p>
                  <Link
                    href="/informasi/visi_misi"
                    target="_blank"
                    className="inline-flex items-center gap-2 bg-[#0e4891] hover:bg-[#0a366f] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm"
                  >
                    <span>Lihat Kartu Visi & Misi di Portal</span>
                    <ArrowSquareOut size={15} weight="bold" />
                  </Link>
                </div>
              ) : activeKategori.section_key === 'daftar_informasi_publik' ? (
                /* KHUSUS: DAFTAR INFORMASI PUBLIK */
                <div className="space-y-6">
                  {/* Panel Akses CMS Matriks */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0e4891] flex items-center justify-center shrink-0 border border-blue-100">
                        <Table size={24} weight="bold" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="font-extrabold text-base text-slate-900">
                            10 Tabel Matriks Daftar Informasi Publik (2022–2026)
                          </h4>
                          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                            CMS Matriks
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium max-w-xl">
                          Tabel-tabel tematik KIP, rincian dokumen, dan tautan per tahun (2022 s.d. 2026) dikelola secara khusus melalui antarmuka CMS Matriks.
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/admin/daftar-informasi"
                      className="inline-flex items-center gap-2 bg-[#0e4891] hover:bg-[#0a366f] text-white text-xs font-bold px-5 py-3 rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
                    >
                      <Table size={16} weight="bold" />
                      <span>Buka CMS Matriks</span>
                      <ArrowRight size={14} weight="bold" />
                    </Link>
                  </div>

                  {/* Dokumen Lampiran Tambahan (Optional) */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">
                          Dokumen Lampiran Tambahan (PDF)
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Opsional: Unggah file PDF umum terkait Daftar Informasi Publik jika ada.
                        </p>
                      </div>
                      <button
                        onClick={() => openAddDocModal(activeKategori.section_key)}
                        className="text-xs bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-3.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                      >
                        <Plus weight="bold" size={14} /> Tambah Lampiran PDF
                      </button>
                    </div>

                    {activeCategoryDocs.length === 0 ? (
                      <div className="text-xs text-slate-400 italic py-6 text-center border border-dashed border-slate-200 rounded-xl">
                        Tidak ada lampiran PDF tambahan. Seluruh data utama ditampilkan melalui CMS Matriks.
                      </div>
                    ) : (
                      <ul className="space-y-2.5">
                        {activeCategoryDocs.map((doc) => (
                          <li
                            key={doc.id.toString()}
                            className="flex items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-100/70 transition-colors"
                          >
                            <div className="overflow-hidden flex-1">
                              <p className="text-xs font-bold text-slate-900 truncate" title={doc.nama_dokumen}>
                                {doc.nama_dokumen}
                              </p>
                              <a
                                href={doc.file_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-[#0e4891] hover:underline truncate block mt-0.5 font-mono"
                              >
                                {doc.file_url}
                              </a>
                            </div>
                            <div className="flex shrink-0 gap-1.5">
                              <button
                                onClick={() => openEditDocModal(doc)}
                                className="text-slate-600 hover:text-[#0e4891] p-2 rounded-lg bg-white border border-slate-200 transition-colors cursor-pointer"
                                title="Edit"
                              >
                                <PencilSimple weight="bold" size={14} />
                              </button>
                              <button
                                onClick={() => openDeleteDocModal(doc)}
                                className="text-slate-600 hover:text-rose-600 p-2 rounded-lg bg-white border border-slate-200 transition-colors cursor-pointer"
                                title="Hapus"
                              >
                                <Trash weight="bold" size={14} />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ) : (
                /* STANDAR: FILE MANAGER DOKUMEN PDF (SK, SOP, Pelayanan, Penghargaan, dll.) */
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">
                        Berkas Dokumen PDF Google Drive
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Total {activeCategoryDocs.length} dokumen PDF terdaftar pada kategori ini.
                      </p>
                    </div>

                    <button
                      onClick={() => openAddDocModal(activeKategori.section_key)}
                      className="text-xs bg-[#0e4891] hover:bg-[#0a366f] text-white font-bold py-2.5 px-4 rounded-xl shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                    >
                      <Plus weight="bold" size={15} /> Tambah Dokumen PDF
                    </button>
                  </div>

                  {/* Search Dokumen */}
                  {listDokumen.filter((d) => d.kategori_key === activeKategori.section_key).length > 3 && (
                    <div className="relative mb-4">
                      <MagnifyingGlass
                        size={14}
                        weight="bold"
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="text"
                        placeholder="Cari nama dokumen pada kategori ini..."
                        value={docSearch}
                        onChange={(e) => setDocSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-all"
                      />
                    </div>
                  )}

                  {/* Daftar Dokumen */}
                  {activeCategoryDocs.length === 0 ? (
                    <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-2xl">
                      <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FilePdf size={24} weight="bold" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 mb-1">Belum Ada Dokumen PDF</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4 leading-relaxed">
                        Kategori ini belum memiliki dokumen PDF yang diunggah. Klik tombol di bawah untuk menambahkan dokumen dari link Google Drive.
                      </p>
                      <button
                        onClick={() => openAddDocModal(activeKategori.section_key)}
                        className="text-xs font-bold text-[#0e4891] hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Plus weight="bold" size={13} /> Tambah Dokumen Sekarang
                      </button>
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {activeCategoryDocs.map((doc) => (
                        <li
                          key={doc.id.toString()}
                          className="flex items-start justify-between gap-3 bg-slate-50/70 hover:bg-slate-50 p-4 rounded-xl border border-slate-200 transition-all shadow-2xs"
                        >
                          <div className="flex items-start gap-3 overflow-hidden flex-1">
                            <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 border border-rose-100">
                              <FilePdf size={20} weight="fill" />
                            </div>
                            <div className="overflow-hidden flex-1">
                              <p className="text-xs font-extrabold text-slate-900 truncate" title={doc.nama_dokumen}>
                                {doc.nama_dokumen}
                              </p>
                              <a
                                href={doc.file_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-[#0e4891] hover:underline truncate block mt-1 font-mono inline-flex items-center gap-1 max-w-full"
                              >
                                <span className="truncate">{doc.file_url}</span>
                                <ArrowSquareOut size={11} weight="bold" className="shrink-0" />
                              </a>
                            </div>
                          </div>

                          <div className="flex shrink-0 gap-1.5 items-center">
                            <button
                              onClick={() => openEditDocModal(doc)}
                              className="text-slate-600 hover:text-[#0e4891] hover:bg-white p-2 rounded-lg transition-colors border border-slate-200 bg-white cursor-pointer shadow-2xs"
                              title="Edit nama dokumen / URL"
                            >
                              <PencilSimple weight="bold" size={15} />
                            </button>
                            <button
                              onClick={() => openDeleteDocModal(doc)}
                              className="text-slate-600 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-colors border border-slate-200 bg-white cursor-pointer shadow-2xs"
                              title="Hapus dokumen"
                            >
                              <Trash weight="bold" size={15} />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TAMBAH DOKUMEN PDF */}
      {/* ========================================================================= */}
      <Modal
        isOpen={activeModal === 'addDoc'}
        onClose={() => setActiveModal(null)}
        title="Tambah Dokumen PDF Baru"
      >
        <form onSubmit={handleAddDokumenSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Kategori Terpilih
            </label>
            <input
              type="text"
              disabled
              value={formatCategoryLabel(targetKategoriKey)}
              className="w-full rounded-xl border border-slate-200 bg-slate-100 p-3 text-xs font-bold text-slate-600 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Nama Dokumen <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: SK Penunjukan PPID Pelaksana Tahun 2024"
              value={docNama}
              onChange={(e) => setDocNama(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs font-medium text-slate-900 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-all shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Link File Google Drive / PDF <span className="text-rose-500">*</span>
            </label>
            <input
              type="url"
              required
              placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
              value={docUrl}
              onChange={(e) => setDocUrl(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs font-mono text-slate-900 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-all shadow-2xs"
            />
            <p className="text-[11px] text-slate-500 mt-1.5">
              Pastikan pengaturan tautan Google Drive disetel ke <strong>"Siapa saja yang memiliki link dapat melihat"</strong>.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={savingId === 'add-doc'}
              className="bg-[#0e4891] hover:bg-[#0a366f] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {savingId === 'add-doc' ? 'Menyimpan...' : 'Simpan Dokumen'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: EDIT DOKUMEN PDF */}
      {/* ========================================================================= */}
      <Modal
        isOpen={activeModal === 'editDoc'}
        onClose={() => setActiveModal(null)}
        title="Edit Dokumen PDF"
      >
        <form onSubmit={handleEditDokumenSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Nama Dokumen <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={docNama}
              onChange={(e) => setDocNama(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs font-medium text-slate-900 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-all shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Link File Google Drive / PDF <span className="text-rose-500">*</span>
            </label>
            <input
              type="url"
              required
              value={docUrl}
              onChange={(e) => setDocUrl(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs font-mono text-slate-900 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-all shadow-2xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={savingId?.startsWith('edit-doc-')}
              className="bg-[#0e4891] hover:bg-[#0a366f] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {savingId?.startsWith('edit-doc-') ? 'Menyimpan...' : 'Perbarui Dokumen'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  )
}