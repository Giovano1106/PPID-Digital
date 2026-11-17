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
  Info,
  UploadSimple,
  LinkSimple,
  CloudArrowUp,
  CircleNotch,
  FileText
} from '@phosphor-icons/react'

import {
  getAdminKonten,
  updateKontenKategori,
  addDokumen,
  updateDokumen,
  deleteDokumen,
  addKontenKategori,
  deleteKontenKategori
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
  const [activeModal, setActiveModal] = useState<'addDoc' | 'editDoc' | 'addCategory' | null>(null)
  const [deleteDocItem, setDeleteDocItem] = useState<DokumenPublik | null>(null)
  const [deleteCategoryConfirm, setDeleteCategoryConfirm] = useState<KontenLanding | null>(null)
  const [submittingCategory, setSubmittingCategory] = useState(false)
  const [deletingCategory, setDeletingCategory] = useState(false)

  // Form Inputs - Kategori Baru
  const [newCategoryJudul, setNewCategoryJudul] = useState('')
  const [newCategoryDeskripsi, setNewCategoryDeskripsi] = useState('')
  const [newCategoryKey, setNewCategoryKey] = useState('')
  const [targetKategoriKey, setTargetKategoriKey] = useState<string>('')
  const [selectedDoc, setSelectedDoc] = useState<DokumenPublik | null>(null)

  // Form Inputs
  const [docNama, setDocNama] = useState('')
  const [docUrl, setDocUrl] = useState('')

  // Google Drive Upload States
  const [uploadMethod, setUploadMethod] = useState<'upload' | 'link'>('upload')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [driveConfigured, setDriveConfigured] = useState<boolean | null>(null)

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type })
  }

  const checkDriveStatus = async () => {
    try {
      const res = await fetch('/api/admin/drive-status')
      const data = await res.json()
      setDriveConfigured(Boolean(data.configured))
      if (!data.configured) {
        setUploadMethod('link')
      }
    } catch {
      setDriveConfigured(false)
      setUploadMethod('link')
    }
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
    checkDriveStatus()
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

  // Tambah Kategori Baru
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategoryJudul.trim()) {
      showToast('Judul kategori tidak boleh kosong.', 'error')
      return
    }

    setSubmittingCategory(true)
    const result = await addKontenKategori(
      newCategoryJudul,
      newCategoryDeskripsi,
      newCategoryKey
    )
    setSubmittingCategory(false)

    if (result.success && result.data) {
      showToast(`Kategori "${result.data.judul}" berhasil dibuat!`)
      setActiveModal(null)
      setNewCategoryJudul('')
      setNewCategoryDeskripsi('')
      setNewCategoryKey('')
      await fetchData()
      setSelectedCategoryKey(result.data.section_key)
    } else {
      showToast(result.error || 'Gagal menambahkan kategori.', 'error')
    }
  }

  // Hapus Kategori
  const handleDeleteCategory = async () => {
    if (!deleteCategoryConfirm) return
    setDeletingCategory(true)
    const result = await deleteKontenKategori(
      deleteCategoryConfirm.id,
      deleteCategoryConfirm.section_key
    )
    setDeletingCategory(false)
    const deletedKey = deleteCategoryConfirm.section_key
    setDeleteCategoryConfirm(null)

    if (result.success) {
      showToast('Kategori berhasil dihapus.')
      await fetchData()
      if (selectedCategoryKey === deletedKey) {
        setSelectedCategoryKey('daftar_informasi_publik')
      }
    } else {
      showToast(result.error || 'Gagal menghapus kategori.', 'error')
    }
  }

  // Buka Modal Tambah Dokumen
  const openAddDocModal = (kategoriKey: string) => {
    setTargetKategoriKey(kategoriKey)
    setDocNama('')
    setDocUrl('')
    setUploadFile(null)
    setUploadMethod(driveConfigured === false ? 'link' : 'upload')
    setActiveModal('addDoc')
  }

  // Handle Pemilihan Berkas untuk Unggah
  const handleFileSelected = (file: File | null) => {
    setUploadFile(file)
    if (file && !docNama.trim()) {
      const cleanName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]+/g, ' ')
        .trim()
      setDocNama(cleanName)
    }
  }

  // Handle Unggah Berkas Langsung ke Google Drive API
  const handleUploadDriveSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadFile) {
      showToast('Silakan pilih file dokumen terlebih dahulu.', 'error')
      return
    }
    setUploading(true)
    const formData = new FormData()
    formData.append('file', uploadFile)
    formData.append('kategori_key', targetKategoriKey)
    formData.append('nama_dokumen', docNama.trim() || uploadFile.name.replace(/\.[^/.]+$/, ''))

    try {
      const res = await fetch('/api/admin/upload-drive', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        showToast(data.error || 'Gagal mengunggah ke Google Drive.', 'error')
      } else {
        showToast('Dokumen berhasil diunggah langsung ke Google Drive & disimpan!')
        setActiveModal(null)
        setUploadFile(null)
        fetchData()
      }
    } catch (err: any) {
      showToast('Error: ' + err?.message, 'error')
    } finally {
      setUploading(false)
    }
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

      {/* CONFIRM MODAL HAPUS KATEGORI */}
      <ConfirmModal
        isOpen={!!deleteCategoryConfirm}
        title={`Hapus Kategori "${deleteCategoryConfirm?.judul || deleteCategoryConfirm?.section_key}"?`}
        message={`Apakah Anda yakin ingin menghapus kategori "${deleteCategoryConfirm?.judul || deleteCategoryConfirm?.section_key}" beserta seluruh dokumen di dalamnya? Halaman publik /informasi/${deleteCategoryConfirm?.section_key} dan kartu kategori di halaman depan tidak akan dapat diakses lagi.`}
        confirmText="Ya, Hapus Kategori"
        cancelText="Batal"
        onConfirm={handleDeleteCategory}
        onClose={() => setDeleteCategoryConfirm(null)}
        loading={deletingCategory}
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

            {/* Tombol Tambah Kategori di Bawah Sidebar Kiri */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setNewCategoryJudul('')
                  setNewCategoryDeskripsi('')
                  setNewCategoryKey('')
                  setActiveModal('addCategory')
                }}
                className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-300 hover:border-[#0e4891] text-slate-600 hover:text-[#0e4891] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} weight="bold" />
                Tambah Kategori Baru
              </button>
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

                <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
                  <Link
                    href={`/informasi/${activeKategori.section_key}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all shadow-2xs shrink-0"
                  >
                    <span>Lihat di Portal</span>
                    <ArrowSquareOut size={14} weight="bold" />
                  </Link>

                  {activeKategori.section_key !== 'daftar_informasi_publik' && (
                    <button
                      type="button"
                      onClick={() => setDeleteCategoryConfirm(activeKategori)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 text-xs font-bold transition-all shadow-2xs shrink-0 cursor-pointer"
                      title="Hapus kategori informasi ini"
                    >
                      <Trash size={14} weight="bold" />
                      <span>Hapus Kategori</span>
                    </button>
                  )}
                </div>
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

                  <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
                    {activeKategori.section_key !== 'daftar_informasi_publik' ? (
                      <button
                        type="button"
                        onClick={() => setDeleteCategoryConfirm(activeKategori)}
                        className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                        title="Hapus kategori informasi ini"
                      >
                        <Trash size={14} weight="bold" />
                        <span>Hapus Kategori</span>
                      </button>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-400 italic">
                        Kategori inti matriks KIP terlindungi
                      </span>
                    )}

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
                        <UploadSimple weight="bold" size={14} /> Unggah / Tambah Lampiran
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
                        Berkas Dokumen Informasi Publik
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Total {activeCategoryDocs.length} berkas terdaftar pada kategori ini.
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
                      {driveConfigured && (
                        <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold shadow-2xs">
                          <CheckCircle size={15} weight="fill" className="text-emerald-500" />
                          Google Drive Aktif
                        </span>
                      )}
                      <button
                        onClick={() => openAddDocModal(activeKategori.section_key)}
                        className="text-xs bg-[#0e4891] hover:bg-[#0a366f] text-white font-bold py-2.5 px-4 rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <UploadSimple weight="bold" size={16} />
                        <span>Unggah / Tambah Dokumen</span>
                      </button>
                    </div>
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
                      <h4 className="text-xs font-bold text-slate-800 mb-1">Belum Ada Berkas Dokumen</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4 leading-relaxed">
                        Kategori ini belum memiliki dokumen yang diunggah. Klik tombol di bawah untuk mengunggah dokumen langsung ke Google Drive atau menautkan link manual.
                      </p>
                      <button
                        onClick={() => openAddDocModal(activeKategori.section_key)}
                        className="text-xs font-bold text-[#0e4891] hover:underline inline-flex items-center gap-1.5 cursor-pointer bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl border border-blue-200 transition-colors"
                      >
                        <UploadSimple weight="bold" size={14} /> Unggah Dokumen Sekarang
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
      {/* MODAL: UNGGAH LANGSUNG KE GOOGLE DRIVE / TAUTKAN LINK MANUAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={activeModal === 'addDoc'}
        onClose={() => {
          if (!uploading) setActiveModal(null)
        }}
        title="Unggah / Tambah Dokumen Publik"
      >
        <div className="space-y-4">
          {/* Target Kategori Badge */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Kategori Tujuan
              </span>
              <span className="text-xs font-black text-slate-900">
                {formatCategoryLabel(targetKategoriKey)}
              </span>
            </div>
            {driveConfigured && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                <CheckCircle size={14} weight="fill" className="text-emerald-500" />
                Drive Terhubung
              </span>
            )}
          </div>

          {/* TAB PILIHAN METODE */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setUploadMethod('upload')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                uploadMethod === 'upload'
                  ? 'bg-white text-[#0e4891] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UploadSimple size={16} weight="bold" />
              <span>Unggah Langsung (Drive API)</span>
            </button>
            <button
              type="button"
              onClick={() => setUploadMethod('link')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                uploadMethod === 'link'
                  ? 'bg-white text-[#0e4891] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LinkSimple size={16} weight="bold" />
              <span>Tautkan Link Manual</span>
            </button>
          </div>

          {/* TAB 1: UNGGAH LANGSUNG KE GOOGLE DRIVE */}
          {uploadMethod === 'upload' ? (
            <form onSubmit={handleUploadDriveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Pilih File Dokumen <span className="text-rose-500">*</span>
                </label>
                
                <label className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 hover:border-[#0e4891] rounded-2xl bg-slate-50/60 hover:bg-blue-50/30 transition-all cursor-pointer text-center group">
                  <input
                    type="file"
                    required
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.zip"
                    onChange={(e) => handleFileSelected(e.target.files?.[0] || null)}
                    className="hidden"
                    disabled={uploading}
                  />

                  {uploadFile ? (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 text-[#0e4891] flex items-center justify-center mb-2">
                        <FileText size={28} weight="bold" />
                      </div>
                      <p className="text-xs font-bold text-slate-900 max-w-xs truncate" title={uploadFile.name}>
                        {uploadFile.name}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {(uploadFile.size / 1024 / 1024).toFixed(2)} MB • Klik untuk ganti berkas
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 text-[#0e4891] group-hover:bg-blue-100 flex items-center justify-center mb-2 transition-colors">
                        <CloudArrowUp size={28} weight="bold" />
                      </div>
                      <p className="text-xs font-bold text-slate-800">
                        Klik untuk memilih file dokumen
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1 max-w-xs leading-relaxed">
                        Mendukung PDF, Word (DOC/DOCX), Excel (XLS/XLSX) hingga maks. 25 MB.
                      </p>
                    </div>
                  )}
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nama Dokumen Publik <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: SK Pelayanan Informasi Publik 2024"
                  value={docNama}
                  onChange={(e) => setDocNama(e.target.value)}
                  disabled={uploading}
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs font-medium text-slate-900 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-all shadow-2xs disabled:bg-slate-100"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Nama ini yang akan ditampilkan kepada publik di portal PPID.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-2.5">
                <Info size={16} weight="bold" className="text-[#0e4891] shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                  File akan otomatis diunggah langsung ke akun <strong>Google Drive PPID</strong> pada folder <code>ppid-digital</code> dan izin baca publik disetel secara otomatis.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={uploading || !uploadFile}
                  className="bg-[#0e4891] hover:bg-[#0a366f] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <CircleNotch size={15} weight="bold" className="animate-spin" />
                      <span>Mengunggah ke Drive...</span>
                    </>
                  ) : (
                    <>
                      <UploadSimple size={15} weight="bold" />
                      <span>Unggah Langsung ke Drive</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* TAB 2: FORM TAUTKAN LINK MANUAL */
            <form onSubmit={handleAddDokumenSubmit} className="space-y-4">
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
                  Link File Google Drive / URL Dokumen <span className="text-rose-500">*</span>
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
                  Pastikan pengaturan tautan Google Drive disetel ke <strong>&quot;Siapa saja yang memiliki link dapat melihat&quot;</strong>.
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
                  {savingId === 'add-doc' ? 'Menyimpan...' : 'Simpan Tautan Dokumen'}
                </button>
              </div>
            </form>
          )}
        </div>
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

      {/* ========================================================================= */}
      {/* MODAL: TAMBAH KATEGORI INFORMASI BARU */}
      {/* ========================================================================= */}
      <Modal
        isOpen={activeModal === 'addCategory'}
        onClose={() => setActiveModal(null)}
        title="Tambah Kategori Informasi Publik Baru"
      >
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Judul Kategori <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Regulasi Daerah & Kebijakan Teknis"
              value={newCategoryJudul}
              onChange={(e) => setNewCategoryJudul(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs font-medium text-slate-900 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-all shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Slug URL / Kategori Key (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: regulasi_daerah (otomatis dari judul jika kosong)"
              value={newCategoryKey}
              onChange={(e) => setNewCategoryKey(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs font-mono text-slate-900 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-all shadow-2xs"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Halaman publik kategori ini akan dapat diakses di: <code className="text-slate-600 font-mono">/informasi/[slug]</code>
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Deskripsi Pengantar <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              placeholder="Jelaskan ringkasan informasi yang termuat pada kategori ini..."
              value={newCategoryDeskripsi}
              onChange={(e) => setNewCategoryDeskripsi(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs font-medium text-slate-900 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-all shadow-2xs leading-relaxed"
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
              disabled={submittingCategory}
              className="bg-[#0e4891] hover:bg-[#0a366f] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {submittingCategory ? 'Menyimpan...' : 'Simpan Kategori'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  )
}