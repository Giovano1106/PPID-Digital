'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Modal from '@/components/Modal'
import ConfirmModal from '@/components/ConfirmModal'
import Toast, { ToastType } from '@/components/Toast'
import { isSafePublicUrl } from '@/app/lib/security'
import {
  FolderOpen,
  PencilSimple,
  Trash,
  Plus,
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
  FileText,
  WarningCircle,
} from '@phosphor-icons/react'

import {
  getAdminKonten,
  updateKontenKategori,
  addDokumen,
  updateDokumen,
  deleteDokumen,
  addKontenKategori,
  deleteKontenKategori,
} from '@/app/actions/admin'

interface KontenLanding {
  id: number
  section_key: string
  judul: string
  isi_teks: string
}

interface DokumenPublik {
  id: number | bigint
  kategori_key: string
  nama_dokumen: string
  file_url: string
}

const FOCUS_RING_CLASS =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e4891] focus-visible:ring-offset-2'

const INPUT_CLASS =
  'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-500 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-colors'

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

function formatCategoryLabel(key: string) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function DocumentUrlDisplay({ url }: { url: string }) {
  if (isSafePublicUrl(url)) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`text-[11px] text-[#0e4891] hover:underline truncate mt-1 font-mono inline-flex items-center gap-1 max-w-full rounded ${FOCUS_RING_CLASS}`}
      >
        <span className="truncate">{url}</span>
        <ArrowSquareOut size={11} weight="bold" className="shrink-0" />
      </a>
    )
  }

  return (
    <span
      className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-semibold max-w-full"
      title="URL dokumen tidak memenuhi skema http/https yang aman"
    >
      <WarningCircle size={12} weight="bold" className="shrink-0" />
      <span className="truncate">Tautan tidak valid (dinonaktifkan)</span>
    </span>
  )
}

export default function AdminKontenPage() {
  const [listKonten, setListKonten] = useState<KontenLanding[]>([])
  const [listDokumen, setListDokumen] = useState<DokumenPublik[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)

  // Active Category Selection (Master-Detail)
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>('daftar_informasi_publik')
  const [categorySearch, setCategorySearch] = useState('')
  const [docSearch, setDocSearch] = useState('')

  // Inline feedback & Toast & Modals
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  const [categoryError, setCategoryError] = useState<string | null>(null)
  const [modalError, setModalError] = useState<string | null>(null)
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

  // Form Inputs - Dokumen
  const [docNama, setDocNama] = useState('')
  const [docUrl, setDocUrl] = useState('')

  // Google Drive Upload States
  const [uploadMethod, setUploadMethod] = useState<'upload' | 'link'>('upload')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [driveConfigured, setDriveConfigured] = useState<boolean | null>(null)

  const closeToast = useCallback(() => {
    setToast(null)
  }, [])

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ message, type })
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const result = await getAdminKonten()

      if (result.success && result.data) {
        setListKonten((result.data.konten || []) as KontenLanding[])
        setListDokumen((result.data.dokumen || []) as DokumenPublik[])
      } else {
        const errMsg = result.error || 'Gagal memuat data CMS dan dokumen publik.'
        setFetchError(errMsg)
        showToast(`Gagal memuat data: ${errMsg}`, 'error')
      }
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error ? err.message : 'Terjadi kesalahan saat menghubungi server.'
      setFetchError(errMsg)
      showToast(`Gagal memuat data: ${errMsg}`, 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    let active = true

    const init = async () => {
      try {
        const [kontenResult, driveRes] = await Promise.all([
          getAdminKonten(),
          fetch('/api/admin/drive-status').catch(() => null),
        ])

        if (!active) return

        if (kontenResult.success && kontenResult.data) {
          setListKonten((kontenResult.data.konten || []) as KontenLanding[])
          setListDokumen((kontenResult.data.dokumen || []) as DokumenPublik[])
          setFetchError(null)
        } else {
          const errMsg = kontenResult.error || 'Gagal memuat data CMS dan dokumen publik.'
          setFetchError(errMsg)
          setToast({ message: `Gagal memuat data: ${errMsg}`, type: 'error' })
        }

        if (driveRes && driveRes.ok) {
          const driveData: { configured?: boolean } = await driveRes.json()
          if (!active) return
          const configured = Boolean(driveData.configured)
          setDriveConfigured(configured)
          if (!configured) {
            setUploadMethod('link')
          }
        } else {
          setDriveConfigured(false)
          setUploadMethod('link')
        }
      } catch (err: unknown) {
        if (!active) return
        const errMsg =
          err instanceof Error ? err.message : 'Terjadi kesalahan saat menghubungi server.'
        setFetchError(errMsg)
        setToast({ message: `Gagal memuat data: ${errMsg}`, type: 'error' })
        setDriveConfigured(false)
        setUploadMethod('link')
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void init()

    return () => {
      active = false
    }
  }, [])

  const activeKategori = useMemo(() => {
    return listKonten.find((k) => k.section_key === selectedCategoryKey) || listKonten[0] || null
  }, [listKonten, selectedCategoryKey])

  const totalDocsInActiveCategory = useMemo(() => {
    if (!activeKategori) return 0
    return listDokumen.filter((d) => d.kategori_key === activeKategori.section_key).length
  }, [listDokumen, activeKategori])

  const activeCategoryDocs = useMemo(() => {
    if (!activeKategori) return []
    let docs = listDokumen.filter((d) => d.kategori_key === activeKategori.section_key)
    if (docSearch.trim()) {
      const q = docSearch.toLowerCase()
      docs = docs.filter((d) => d.nama_dokumen.toLowerCase().includes(q))
    }
    return docs
  }, [listDokumen, activeKategori, docSearch])

  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return listKonten
    const q = categorySearch.toLowerCase()
    return listKonten.filter(
      (k) =>
        k.judul.toLowerCase().includes(q) ||
        k.section_key.toLowerCase().includes(q)
    )
  }, [listKonten, categorySearch])

  const handleInputChange = (id: number, field: keyof KontenLanding, value: string) => {
    setCategoryError(null)
    setListKonten((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
  }

  const handleSaveKategori = async (item: KontenLanding) => {
    if (!item.judul.trim()) {
      const msg = 'Judul kategori tidak boleh kosong.'
      setCategoryError(msg)
      showToast(msg, 'error')
      return
    }

    setCategoryError(null)
    setSavingId(`kat-${item.id}`)
    try {
      const result = await updateKontenKategori(item.id, item.judul, item.isi_teks)
      if (!result.success) {
        const msg = result.error || 'Gagal menyimpan perubahan kategori.'
        setCategoryError(msg)
        showToast(`Gagal menyimpan kategori: ${msg}`, 'error')
      } else {
        showToast(
          `Judul dan deskripsi kategori "${formatCategoryLabel(item.section_key)}" berhasil diperbarui.`
        )
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan perubahan kategori.'
      setCategoryError(msg)
      showToast(`Gagal menyimpan kategori: ${msg}`, 'error')
    } finally {
      setSavingId(null)
    }
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategoryJudul.trim()) {
      const msg = 'Judul kategori tidak boleh kosong.'
      setModalError(msg)
      showToast(msg, 'error')
      return
    }

    setModalError(null)
    setSubmittingCategory(true)
    try {
      const result = await addKontenKategori(
        newCategoryJudul,
        newCategoryDeskripsi,
        newCategoryKey
      )

      if (result.success && result.data) {
        const created = result.data as KontenLanding
        showToast(`Kategori "${created.judul}" berhasil dibuat.`)
        setActiveModal(null)
        setNewCategoryJudul('')
        setNewCategoryDeskripsi('')
        setNewCategoryKey('')
        await fetchData()
        setSelectedCategoryKey(created.section_key)
        setCategoryError(null)
      } else {
        const msg = result.error || 'Gagal menambahkan kategori baru.'
        setModalError(msg)
        showToast(msg, 'error')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menambahkan kategori baru.'
      setModalError(msg)
      showToast(msg, 'error')
    } finally {
      setSubmittingCategory(false)
    }
  }

  const handleDeleteCategory = async () => {
    if (!deleteCategoryConfirm) return
    const target = deleteCategoryConfirm
    setDeletingCategory(true)
    setCategoryError(null)

    try {
      const result = await deleteKontenKategori(target.id, target.section_key)
      setDeleteCategoryConfirm(null)

      if (result.success) {
        showToast('Kategori berhasil dihapus.')
        await fetchData()
        if (selectedCategoryKey === target.section_key) {
          setSelectedCategoryKey('daftar_informasi_publik')
        }
      } else {
        const msg = result.error || 'Gagal menghapus kategori.'
        setCategoryError(msg)
        showToast(msg, 'error')
      }
    } catch (err: unknown) {
      setDeleteCategoryConfirm(null)
      const msg = err instanceof Error ? err.message : 'Gagal menghapus kategori.'
      setCategoryError(msg)
      showToast(msg, 'error')
    } finally {
      setDeletingCategory(false)
    }
  }

  const openAddDocModal = (kategoriKey: string) => {
    setTargetKategoriKey(kategoriKey)
    setDocNama('')
    setDocUrl('')
    setUploadFile(null)
    setModalError(null)
    setUploadMethod(driveConfigured === false ? 'link' : 'upload')
    setActiveModal('addDoc')
  }

  const handleFileSelected = (file: File | null) => {
    setUploadFile(file)
    setModalError(null)
    if (file && !docNama.trim()) {
      const cleanName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]+/g, ' ')
        .trim()
      setDocNama(cleanName)
    }
  }

  const handleUploadDriveSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadFile) {
      const msg = 'Silakan pilih file dokumen terlebih dahulu.'
      setModalError(msg)
      showToast(msg, 'error')
      return
    }

    setModalError(null)
    setUploading(true)
    const formData = new FormData()
    formData.append('file', uploadFile)
    formData.append('kategori_key', targetKategoriKey)
    formData.append('folder_scope', 'informasi')
    formData.append('nama_dokumen', docNama.trim() || uploadFile.name.replace(/\.[^/.]+$/, ''))

    try {
      const res = await fetch('/api/admin/upload-drive', {
        method: 'POST',
        body: formData,
      })
      const data: { error?: string; folderPath?: string } = await res.json()
      if (!res.ok || data.error) {
        const msg = data.error || 'Gagal mengunggah ke Google Drive.'
        setModalError(msg)
        showToast(msg, 'error')
      } else {
        showToast(
          data.folderPath
            ? `Dokumen berhasil diunggah ke folder Drive "${data.folderPath}" dan disimpan.`
            : 'Dokumen berhasil diunggah langsung ke Google Drive dan disimpan.'
        )
        setActiveModal(null)
        setUploadFile(null)
        await fetchData()
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat mengunggah file.'
      setModalError(msg)
      showToast(`Error: ${msg}`, 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleAddDokumenSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!docNama.trim() || !docUrl.trim()) {
      const msg = 'Harap lengkapi nama dokumen dan tautan dokumen.'
      setModalError(msg)
      showToast(msg, 'error')
      return
    }
    if (!isSafePublicUrl(docUrl.trim())) {
      const msg = 'URL dokumen tidak valid. Gunakan tautan http:// atau https://.'
      setModalError(msg)
      showToast(msg, 'error')
      return
    }

    setModalError(null)
    setSavingId('add-doc')
    try {
      const result = await addDokumen(targetKategoriKey, docNama.trim(), docUrl.trim())
      if (!result.success) {
        const msg = result.error || 'Gagal menambahkan dokumen.'
        setModalError(msg)
        showToast(`Gagal menambah dokumen: ${msg}`, 'error')
      } else {
        showToast('Dokumen baru berhasil ditambahkan.')
        setActiveModal(null)
        await fetchData()
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menambahkan dokumen.'
      setModalError(msg)
      showToast(`Gagal menambah dokumen: ${msg}`, 'error')
    } finally {
      setSavingId(null)
    }
  }

  const openEditDocModal = (doc: DokumenPublik) => {
    setSelectedDoc(doc)
    setDocNama(doc.nama_dokumen)
    setDocUrl(doc.file_url)
    setModalError(null)
    setActiveModal('editDoc')
  }

  const handleEditDokumenSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDoc || !docNama.trim() || !docUrl.trim()) {
      const msg = 'Harap lengkapi nama dokumen dan tautan dokumen.'
      setModalError(msg)
      showToast(msg, 'error')
      return
    }
    if (!isSafePublicUrl(docUrl.trim())) {
      const msg = 'URL dokumen tidak valid. Gunakan tautan http:// atau https://.'
      setModalError(msg)
      showToast(msg, 'error')
      return
    }

    setModalError(null)
    setSavingId(`edit-doc-${selectedDoc.id}`)
    try {
      const result = await updateDokumen(selectedDoc.id, docNama.trim(), docUrl.trim())
      if (!result.success) {
        const msg = result.error || 'Gagal memperbarui dokumen.'
        setModalError(msg)
        showToast(`Gagal memperbarui dokumen: ${msg}`, 'error')
      } else {
        showToast('Dokumen berhasil diperbarui.')
        setActiveModal(null)
        await fetchData()
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui dokumen.'
      setModalError(msg)
      showToast(`Gagal memperbarui dokumen: ${msg}`, 'error')
    } finally {
      setSavingId(null)
    }
  }

  const openDeleteDocModal = (doc: DokumenPublik) => {
    setDeleteDocItem(doc)
  }

  const handleDeleteDokumenSubmit = async () => {
    if (!deleteDocItem) return

    setSavingId(`del-doc-${deleteDocItem.id}`)
    try {
      const result = await deleteDokumen(deleteDocItem.id)
      setDeleteDocItem(null)
      if (!result.success) {
        showToast(`Gagal menghapus dokumen: ${result.error || 'Terjadi kesalahan.'}`, 'error')
      } else {
        showToast('Dokumen telah berhasil dihapus dari CMS.', 'info')
        await fetchData()
      }
    } catch (err: unknown) {
      setDeleteDocItem(null)
      const msg = err instanceof Error ? err.message : 'Gagal menghapus dokumen.'
      showToast(`Gagal menghapus dokumen: ${msg}`, 'error')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="pb-16 font-plus-jakarta">
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

      {/* CONFIRM MODAL HAPUS DOKUMEN */}
      <ConfirmModal
        isOpen={!!deleteDocItem}
        title="Hapus Dokumen PDF?"
        message={`Apakah Anda yakin ingin menghapus dokumen "${deleteDocItem?.nama_dokumen || ''}"? Dokumen ini tidak akan lagi dapat diakses oleh publik.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        onConfirm={handleDeleteDokumenSubmit}
        onClose={() => {
          if (!savingId?.startsWith('del-doc-')) setDeleteDocItem(null)
        }}
        loading={savingId?.startsWith('del-doc-') ?? false}
        variant="danger"
      />

      {/* CONFIRM MODAL HAPUS KATEGORI */}
      <ConfirmModal
        isOpen={!!deleteCategoryConfirm}
        title={
          deleteCategoryConfirm
            ? `Hapus Kategori "${deleteCategoryConfirm.judul || deleteCategoryConfirm.section_key}"?`
            : 'Hapus Kategori?'
        }
        message={`Apakah Anda yakin ingin menghapus kategori "${
          deleteCategoryConfirm?.judul || deleteCategoryConfirm?.section_key || ''
        }" beserta seluruh dokumen di dalamnya? Halaman publik /informasi/${
          deleteCategoryConfirm?.section_key || ''
        } dan kartu kategori di halaman depan tidak akan dapat diakses lagi.`}
        confirmText="Ya, Hapus Kategori"
        cancelText="Batal"
        onConfirm={handleDeleteCategory}
        onClose={() => {
          if (!deletingCategory) setDeleteCategoryConfirm(null)
        }}
        loading={deletingCategory}
        variant="danger"
      />

      {/* HEADER PAGE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Kelola CMS &amp; Dokumen Publik
          </h1>
          <p className="text-xs md:text-sm text-slate-600 font-medium mt-1">
            Pilih kategori informasi di sebelah kiri untuk mengedit teks judul, deskripsi, dan berkas dokumen PDF.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void fetchData()}
          disabled={loading}
          className={`min-h-[44px] rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 self-start md:self-auto cursor-pointer disabled:opacity-50 shrink-0 ${FOCUS_RING_CLASS}`}
        >
          <ArrowsClockwise weight="bold" size={16} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* INLINE REFRESH ERROR BANNER WHEN EXISTING DATA IS PRESENT */}
      {!loading && fetchError && listKonten.length > 0 && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-start gap-2.5">
            <WarningCircle size={18} weight="bold" className="text-rose-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-rose-900">Gagal memperbarui data konten</p>
              <p className="text-xs text-rose-800 mt-0.5">{fetchError}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void fetchData()}
            className={`min-h-[44px] px-4 py-2 rounded-lg bg-[#0e4891] hover:bg-[#0a366f] text-white text-xs font-bold transition-colors shrink-0 self-start sm:self-auto cursor-pointer ${FOCUS_RING_CLASS}`}
          >
            Coba Lagi
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-16 bg-white rounded-xl border border-slate-200 animate-pulse" />
            ))}
          </div>
          <div className="lg:col-span-8 space-y-6">
            <div className="h-48 bg-white rounded-xl border border-slate-200 animate-pulse" />
            <div className="h-64 bg-white rounded-xl border border-slate-200 animate-pulse" />
          </div>
        </div>
      ) : fetchError && listKonten.length === 0 ? (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-white p-8 text-center max-w-xl mx-auto"
        >
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center mx-auto mb-3">
            <WarningCircle size={24} weight="bold" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Gagal Memuat Data Konten CMS</h2>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{fetchError}</p>
          <button
            type="button"
            onClick={() => void fetchData()}
            className={`mt-5 inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-lg bg-[#0e4891] hover:bg-[#0a366f] text-white text-xs font-bold transition-colors cursor-pointer ${FOCUS_RING_CLASS}`}
          >
            <ArrowsClockwise size={15} weight="bold" />
            <span>Coba Lagi</span>
          </button>
        </div>
      ) : (
        /* MASTER-DETAIL WORKSPACE LAYOUT */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* KOLOM KIRI: DAFTAR KATEGORI (SELECTOR) */}
          <div className="lg:col-span-4 min-w-0 bg-white rounded-xl border border-slate-200 p-4 lg:sticky lg:top-6">
            <div className="flex items-center justify-between mb-3 px-1 gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Kategori Informasi ({listKonten.length})
              </span>
              <span className="text-[11px] font-semibold text-slate-500 shrink-0">
                Pilih untuk kelola
              </span>
            </div>

            {/* Pencarian Kategori */}
            <div className="relative mb-3">
              <MagnifyingGlass
                size={14}
                weight="bold"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none"
              />
              <input
                type="text"
                aria-label="Cari kategori"
                placeholder="Cari kategori..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 placeholder:text-slate-600 focus:bg-white focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-colors"
              />
            </div>

            {/* List Kategori */}
            <div className="space-y-1.5">
              {filteredCategories.map((kat) => {
                const isSelected = kat.section_key === activeKategori?.section_key
                const IconComponent = getCategoryIcon(kat.section_key)
                const docCount = listDokumen.filter((d) => d.kategori_key === kat.section_key).length

                let badgeText = `${docCount} Dokumen`
                if (kat.section_key === 'visi_misi') badgeText = 'Profil Visual'
                else if (kat.section_key === 'daftar_informasi_publik') badgeText = 'Matriks Data'
                else if (kat.section_key === 'permohonan_informasi') badgeText = 'Alur & Regulasi'

                return (
                  <button
                    key={kat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategoryKey(kat.section_key)
                      setDocSearch('')
                      setCategoryError(null)
                    }}
                    className={`w-full min-h-[44px] text-left p-3 rounded-lg transition-colors flex items-center justify-between gap-3 border cursor-pointer ${FOCUS_RING_CLASS} ${
                      isSelected
                        ? 'bg-[#0e4891] text-white border-[#0e4891]'
                        : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-white/15 text-white'
                            : 'bg-slate-100 text-[#0e4891]'
                        }`}
                      >
                        <IconComponent size={18} weight={isSelected ? 'fill' : 'bold'} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-xs block leading-tight truncate">
                          {kat.judul || formatCategoryLabel(kat.section_key)}
                        </span>
                        <span
                          className={`text-[11px] block mt-0.5 truncate ${
                            isSelected ? 'text-blue-100' : 'text-slate-600'
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
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {badgeText}
                    </span>
                  </button>
                )
              })}

              {filteredCategories.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-4">
                  Tidak ada kategori yang sesuai pencarian.
                </p>
              )}
            </div>

            {/* Tombol Tambah Kategori */}
            <div className="mt-4 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setNewCategoryJudul('')
                  setNewCategoryDeskripsi('')
                  setNewCategoryKey('')
                  setModalError(null)
                  setActiveModal('addCategory')
                }}
                className={`w-full min-h-[44px] py-2.5 px-3 rounded-lg border border-dashed border-slate-300 hover:border-[#0e4891] text-slate-700 hover:text-[#0e4891] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${FOCUS_RING_CLASS}`}
              >
                <Plus size={14} weight="bold" />
                <span>Tambah Kategori Baru</span>
              </button>
            </div>
          </div>

          {/* KOLOM KANAN: WORKSPACE EDITOR TERFOKUS */}
          {activeKategori ? (
            <div className="lg:col-span-8 min-w-0 space-y-6">
              {/* INLINE CATEGORY ERROR FEEDBACK */}
              {categoryError && (
                <div
                  role="alert"
                  className="rounded-xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-2.5"
                >
                  <WarningCircle size={18} weight="bold" className="text-rose-700 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-rose-900">Terjadi kendala pada kategori</p>
                    <p className="text-xs text-rose-800 mt-0.5">{categoryError}</p>
                  </div>
                </div>
              )}

              {/* HEADER KATEGORI AKTIF */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0e4891] flex items-center justify-center shrink-0 border border-blue-200">
                    {(() => {
                      const Icon = getCategoryIcon(activeKategori.section_key)
                      return <Icon size={26} weight="bold" />
                    })()}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                      Kategori Aktif
                    </span>
                    <h2 className="font-bold text-xl text-slate-900 tracking-tight break-words">
                      {activeKategori.judul || formatCategoryLabel(activeKategori.section_key)}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap shrink-0">
                  <Link
                    href={`/informasi/${activeKategori.section_key}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 min-h-[44px] px-3.5 py-2 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors shrink-0 ${FOCUS_RING_CLASS}`}
                  >
                    <span>Lihat di Portal</span>
                    <ArrowSquareOut size={14} weight="bold" />
                  </Link>

                  {activeKategori.section_key !== 'daftar_informasi_publik' && (
                    <button
                      type="button"
                      onClick={() => setDeleteCategoryConfirm(activeKategori)}
                      disabled={deletingCategory}
                      className={`inline-flex items-center gap-1.5 min-h-[44px] px-3.5 py-2 rounded-lg border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 text-xs font-bold transition-colors shrink-0 cursor-pointer disabled:opacity-50 ${FOCUS_RING_CLASS}`}
                      title="Hapus kategori informasi ini"
                    >
                      <Trash size={14} weight="bold" />
                      <span>Hapus Kategori</span>
                    </button>
                  )}
                </div>
              </div>

              {/* CARD 1: EDIT JUDUL & DESKRIPSI KATEGORI */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="border-b border-slate-200 pb-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h3 className="font-bold text-sm text-slate-900">
                    Teks Pengantar &amp; Deskripsi Kategori
                  </h3>
                  <span className="text-[11px] font-medium text-slate-500">
                    Tampil pada header halaman publik
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="kategori-judul-input"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                    >
                      Judul Kategori
                    </label>
                    <input
                      id="kategori-judul-input"
                      type="text"
                      value={activeKategori.judul || ''}
                      onChange={(e) => handleInputChange(activeKategori.id, 'judul', e.target.value)}
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="kategori-isi-input"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                    >
                      Deskripsi Pengantar (Isi Teks)
                    </label>
                    <textarea
                      id="kategori-isi-input"
                      rows={3}
                      value={activeKategori.isi_teks || ''}
                      onChange={(e) => handleInputChange(activeKategori.id, 'isi_teks', e.target.value)}
                      className={`${INPUT_CLASS} leading-relaxed`}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 flex-wrap gap-3">
                    {activeKategori.section_key !== 'daftar_informasi_publik' ? (
                      <button
                        type="button"
                        onClick={() => setDeleteCategoryConfirm(activeKategori)}
                        disabled={deletingCategory}
                        className={`min-h-[44px] px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 hover:border-rose-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${FOCUS_RING_CLASS}`}
                        title="Hapus kategori informasi ini"
                      >
                        <Trash size={14} weight="bold" />
                        <span>Hapus Kategori</span>
                      </button>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-500 italic">
                        Kategori inti matriks KIP terlindungi
                      </span>
                    )}

                    <button
                      type="button"
                      disabled={savingId === `kat-${activeKategori.id}`}
                      onClick={() => void handleSaveKategori(activeKategori)}
                      className={`min-h-[44px] rounded-lg bg-[#0e4891] hover:bg-[#0a366f] px-5 py-2.5 text-xs font-bold text-white transition-colors disabled:opacity-50 cursor-pointer ${FOCUS_RING_CLASS}`}
                    >
                      {savingId === `kat-${activeKategori.id}` ? 'Menyimpan...' : 'Simpan Perubahan Teks'}
                    </button>
                  </div>
                </div>
              </div>

              {/* CARD 2: KONTEN KHUSUS ATAU PENGELOLA FILE PDF */}
              {activeKategori.section_key === 'visi_misi' ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                  <div className="w-16 h-16 bg-blue-50 text-[#0e4891] rounded-xl flex items-center justify-center mx-auto mb-4 border border-blue-200">
                    <Target size={32} weight="fill" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 mb-1">
                    Format Profil Visual Terstruktur
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed font-medium mb-6">
                    Kategori Visi &amp; Misi disajikan dalam bentuk kartu ilustrasi visual interaktif pada portal publik. Kategori ini tidak memerlukan unggahan berkas PDF dokumen.
                  </p>
                  <Link
                    href="/informasi/visi_misi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 min-h-[44px] bg-[#0e4891] hover:bg-[#0a366f] text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-colors ${FOCUS_RING_CLASS}`}
                  >
                    <span>Lihat Kartu Visi &amp; Misi di Portal</span>
                    <ArrowSquareOut size={15} weight="bold" />
                  </Link>
                </div>
              ) : activeKategori.section_key === 'daftar_informasi_publik' ? (
                <div className="space-y-6">
                  {/* Panel Akses CMS Matriks */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0e4891] flex items-center justify-center shrink-0 border border-blue-200">
                        <Table size={24} weight="bold" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="font-bold text-base text-slate-900">
                            Tabel Matriks Daftar Informasi Publik
                          </h4>
                          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                            CMS Matriks
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium max-w-xl">
                          Tabel tematik KIP, rincian dokumen, dan tautan per tahun dikelola secara khusus melalui antarmuka CMS Matriks.
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/admin/daftar-informasi"
                      className={`inline-flex items-center gap-2 min-h-[44px] bg-[#0e4891] hover:bg-[#0a366f] text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-colors shrink-0 cursor-pointer ${FOCUS_RING_CLASS}`}
                    >
                      <Table size={16} weight="bold" />
                      <span>Buka CMS Matriks</span>
                      <ArrowRight size={14} weight="bold" />
                    </Link>
                  </div>

                  {/* Dokumen Lampiran Tambahan (Optional) */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4 mb-4">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">
                          Dokumen Lampiran Tambahan (PDF)
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Opsional: Unggah berkas PDF umum terkait Daftar Informasi Publik jika ada.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => openAddDocModal(activeKategori.section_key)}
                        className={`min-h-[44px] text-xs bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shrink-0 ${FOCUS_RING_CLASS}`}
                      >
                        <UploadSimple weight="bold" size={14} />
                        <span>Unggah / Tambah Lampiran</span>
                      </button>
                    </div>

                    {activeCategoryDocs.length === 0 ? (
                      <div className="text-xs text-slate-500 italic py-6 text-center border border-dashed border-slate-200 rounded-xl bg-white">
                        Tidak ada lampiran PDF tambahan. Seluruh data utama ditampilkan melalui CMS Matriks.
                      </div>
                    ) : (
                      <ul className="space-y-2.5">
                        {activeCategoryDocs.map((doc) => (
                          <li
                            key={doc.id.toString()}
                            className="flex items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-slate-900 truncate" title={doc.nama_dokumen}>
                                {doc.nama_dokumen}
                              </p>
                              <DocumentUrlDisplay url={doc.file_url} />
                            </div>
                            <div className="flex shrink-0 gap-1.5">
                              <button
                                type="button"
                                onClick={() => openEditDocModal(doc)}
                                className={`min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-slate-700 hover:text-[#0e4891] rounded-lg bg-white border border-slate-300 transition-colors cursor-pointer ${FOCUS_RING_CLASS}`}
                                title="Edit dokumen"
                                aria-label={`Edit ${doc.nama_dokumen}`}
                              >
                                <PencilSimple weight="bold" size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => openDeleteDocModal(doc)}
                                className={`min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-slate-700 hover:text-rose-700 hover:bg-rose-50 rounded-lg bg-white border border-slate-300 transition-colors cursor-pointer ${FOCUS_RING_CLASS}`}
                                title="Hapus dokumen"
                                aria-label={`Hapus ${doc.nama_dokumen}`}
                              >
                                <Trash weight="bold" size={15} />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ) : (
                /* STANDAR: FILE MANAGER DOKUMEN PDF */
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-5">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">
                        Berkas Dokumen Informasi Publik
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Total {activeCategoryDocs.length} berkas terdaftar pada kategori ini.
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
                      {driveConfigured && (
                        <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                          <CheckCircle size={15} weight="fill" className="text-emerald-700" />
                          <span>Google Drive Aktif</span>
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => openAddDocModal(activeKategori.section_key)}
                        className={`min-h-[44px] text-xs bg-[#0e4891] hover:bg-[#0a366f] text-white font-bold py-2.5 px-4 rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${FOCUS_RING_CLASS}`}
                      >
                        <UploadSimple weight="bold" size={16} />
                        <span>Unggah / Tambah Dokumen</span>
                      </button>
                    </div>
                  </div>

                  {/* Search Dokumen */}
                  {totalDocsInActiveCategory > 3 && (
                    <div className="relative mb-4">
                      <MagnifyingGlass
                        size={14}
                        weight="bold"
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none"
                      />
                      <input
                        type="text"
                        aria-label="Cari nama dokumen"
                        placeholder="Cari nama dokumen pada kategori ini..."
                        value={docSearch}
                        onChange={(e) => setDocSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 placeholder:text-slate-600 focus:bg-white focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-colors"
                      />
                    </div>
                  )}

                  {/* Daftar Dokumen */}
                  {activeCategoryDocs.length === 0 ? (
                    <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-xl bg-white">
                      <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <FilePdf size={24} weight="bold" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 mb-1">
                        {docSearch.trim() ? 'Dokumen Tidak Ditemukan' : 'Belum Ada Berkas Dokumen'}
                      </h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4 leading-relaxed">
                        {docSearch.trim()
                          ? 'Tidak ada dokumen yang cocok dengan kata kunci pencarian Anda.'
                          : 'Kategori ini belum memiliki dokumen yang diunggah. Klik tombol di bawah untuk mengunggah dokumen langsung ke Google Drive atau menautkan link manual.'}
                      </p>
                      {!docSearch.trim() && (
                        <button
                          type="button"
                          onClick={() => openAddDocModal(activeKategori.section_key)}
                          className={`min-h-[44px] text-xs font-bold text-[#0e4891] inline-flex items-center gap-1.5 cursor-pointer bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg border border-blue-200 transition-colors ${FOCUS_RING_CLASS}`}
                        >
                          <UploadSimple weight="bold" size={14} />
                          <span>Unggah Dokumen Sekarang</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {activeCategoryDocs.map((doc) => (
                        <li
                          key={doc.id.toString()}
                          className="flex items-start justify-between gap-3 bg-slate-50 hover:bg-slate-100/70 p-4 rounded-xl border border-slate-200 transition-colors"
                        >
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center shrink-0 mt-0.5 border border-rose-200">
                              <FilePdf size={20} weight="fill" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-slate-900 truncate" title={doc.nama_dokumen}>
                                {doc.nama_dokumen}
                              </p>
                              <DocumentUrlDisplay url={doc.file_url} />
                            </div>
                          </div>

                          <div className="flex shrink-0 gap-1.5 items-center">
                            <button
                              type="button"
                              onClick={() => openEditDocModal(doc)}
                              className={`min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-slate-700 hover:text-[#0e4891] rounded-lg transition-colors border border-slate-300 bg-white cursor-pointer ${FOCUS_RING_CLASS}`}
                              title="Edit nama dokumen / URL"
                              aria-label={`Edit ${doc.nama_dokumen}`}
                            >
                              <PencilSimple weight="bold" size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => openDeleteDocModal(doc)}
                              className={`min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-slate-700 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-slate-300 bg-white cursor-pointer ${FOCUS_RING_CLASS}`}
                              title="Hapus dokumen"
                              aria-label={`Hapus ${doc.nama_dokumen}`}
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
          ) : (
            <div className="lg:col-span-8 min-w-0 bg-white rounded-xl border border-slate-200 p-8 text-center">
              <p className="text-xs font-semibold text-slate-500">
                Belum ada kategori informasi terdaftar. Klik &quot;Tambah Kategori Baru&quot; untuk memulai.
              </p>
            </div>
          )}
        </div>
      )}

      {/* MODAL: UNGGAH LANGSUNG KE GOOGLE DRIVE / TAUTKAN LINK MANUAL */}
      <Modal
        isOpen={activeModal === 'addDoc'}
        onClose={() => {
          if (!uploading) {
            setActiveModal(null)
            setModalError(null)
          }
        }}
        title="Unggah / Tambah Dokumen Publik"
      >
        <div className="space-y-4">
          {/* Target Kategori Badge */}
          <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                Kategori Tujuan
              </span>
              <span className="text-xs font-bold text-slate-900 truncate block">
                {formatCategoryLabel(targetKategoriKey)}
              </span>
            </div>
            {driveConfigured && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold shrink-0">
                <CheckCircle size={14} weight="fill" className="text-emerald-700" />
                <span>Drive Terhubung</span>
              </span>
            )}
          </div>

          {modalError && (
            <div
              role="alert"
              className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800"
            >
              {modalError}
            </div>
          )}

          {/* TAB PILIHAN METODE */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setUploadMethod('upload')
                setModalError(null)
              }}
              className={`min-h-[44px] flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer ${FOCUS_RING_CLASS} ${
                uploadMethod === 'upload'
                  ? 'bg-white text-[#0e4891] border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 border border-transparent'
              }`}
            >
              <UploadSimple size={16} weight="bold" />
              <span>Unggah Langsung (Drive API)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setUploadMethod('link')
                setModalError(null)
              }}
              className={`min-h-[44px] flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer ${FOCUS_RING_CLASS} ${
                uploadMethod === 'link'
                  ? 'bg-white text-[#0e4891] border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 border border-transparent'
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
                  Pilih File Dokumen <span className="text-rose-600">*</span>
                </label>

                <label className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 hover:border-[#0e4891] focus-within:border-[#0e4891] focus-within:ring-2 focus-within:ring-[#0e4891]/20 rounded-xl bg-slate-50 hover:bg-blue-50/40 transition-colors cursor-pointer text-center group">
                  <input
                    type="file"
                    required
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.zip"
                    onChange={(e) => handleFileSelected(e.target.files?.[0] || null)}
                    className="sr-only"
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
                      <p className="text-[11px] text-slate-600 font-mono mt-0.5">
                        {(uploadFile.size / 1024 / 1024).toFixed(2)} MB - Klik untuk ganti berkas
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 text-[#0e4891] group-hover:bg-blue-100 flex items-center justify-center mb-2 transition-colors">
                        <CloudArrowUp size={28} weight="bold" />
                      </div>
                      <p className="text-xs font-bold text-slate-900">
                        Klik untuk memilih file dokumen
                      </p>
                      <p className="text-[11px] text-slate-600 mt-1 max-w-xs leading-relaxed">
                        Mendukung PDF, Word (DOC/DOCX), Excel (XLS/XLSX) hingga maks. 25 MB.
                      </p>
                    </div>
                  )}
                </label>
              </div>

              <div>
                <label
                  htmlFor="add-doc-upload-name"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Nama Dokumen Publik <span className="text-rose-600">*</span>
                </label>
                <input
                  id="add-doc-upload-name"
                  type="text"
                  required
                  placeholder="Contoh: SK Pelayanan Informasi Publik 2024"
                  value={docNama}
                  onChange={(e) => setDocNama(e.target.value)}
                  disabled={uploading}
                  className={`${INPUT_CLASS} disabled:bg-slate-100`}
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Nama ini yang akan ditampilkan kepada publik di portal PPID.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-2.5">
                <Info size={16} weight="bold" className="text-[#0e4891] shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                  File akan otomatis diunggah langsung ke akun <strong>Google Drive PPID</strong> pada folder <code>ppid-digital</code> dan izin baca publik disetel secara otomatis.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => setActiveModal(null)}
                  className={`min-h-[44px] px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50 ${FOCUS_RING_CLASS}`}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={uploading || !uploadFile}
                  className={`min-h-[44px] bg-[#0e4891] hover:bg-[#0a366f] text-white px-5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2 ${FOCUS_RING_CLASS}`}
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
                <label
                  htmlFor="add-doc-manual-name"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Nama Dokumen <span className="text-rose-600">*</span>
                </label>
                <input
                  id="add-doc-manual-name"
                  type="text"
                  required
                  placeholder="Contoh: SK Penunjukan PPID Pelaksana Tahun 2024"
                  value={docNama}
                  onChange={(e) => {
                    setDocNama(e.target.value)
                    setModalError(null)
                  }}
                  className={INPUT_CLASS}
                />
              </div>

              <div>
                <label
                  htmlFor="add-doc-manual-url"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Link File Google Drive / URL Dokumen <span className="text-rose-600">*</span>
                </label>
                <input
                  id="add-doc-manual-url"
                  type="url"
                  required
                  placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                  value={docUrl}
                  onChange={(e) => {
                    setDocUrl(e.target.value)
                    setModalError(null)
                  }}
                  className={`${INPUT_CLASS} font-mono`}
                />
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Pastikan pengaturan tautan Google Drive disetel ke <strong>&quot;Siapa saja yang memiliki link dapat melihat&quot;</strong>.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className={`min-h-[44px] px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer ${FOCUS_RING_CLASS}`}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingId === 'add-doc'}
                  className={`min-h-[44px] bg-[#0e4891] hover:bg-[#0a366f] text-white px-5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 ${FOCUS_RING_CLASS}`}
                >
                  {savingId === 'add-doc' ? 'Menyimpan...' : 'Simpan Tautan Dokumen'}
                </button>
              </div>
            </form>
          )}
        </div>
      </Modal>

      {/* MODAL: EDIT DOKUMEN PDF */}
      <Modal
        isOpen={activeModal === 'editDoc'}
        onClose={() => {
          setActiveModal(null)
          setModalError(null)
        }}
        title="Edit Dokumen PDF"
      >
        <form onSubmit={handleEditDokumenSubmit} className="space-y-4">
          {modalError && (
            <div
              role="alert"
              className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800"
            >
              {modalError}
            </div>
          )}

          <div>
            <label
              htmlFor="edit-doc-name"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Nama Dokumen <span className="text-rose-600">*</span>
            </label>
            <input
              id="edit-doc-name"
              type="text"
              required
              value={docNama}
              onChange={(e) => {
                setDocNama(e.target.value)
                setModalError(null)
              }}
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label
              htmlFor="edit-doc-url"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Link File Google Drive / PDF <span className="text-rose-600">*</span>
            </label>
            <input
              id="edit-doc-url"
              type="url"
              required
              value={docUrl}
              onChange={(e) => {
                setDocUrl(e.target.value)
                setModalError(null)
              }}
              className={`${INPUT_CLASS} font-mono`}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className={`min-h-[44px] px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer ${FOCUS_RING_CLASS}`}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={savingId?.startsWith('edit-doc-') ?? false}
              className={`min-h-[44px] bg-[#0e4891] hover:bg-[#0a366f] text-white px-5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 ${FOCUS_RING_CLASS}`}
            >
              {savingId?.startsWith('edit-doc-') ? 'Menyimpan...' : 'Perbarui Dokumen'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: TAMBAH KATEGORI INFORMASI BARU */}
      <Modal
        isOpen={activeModal === 'addCategory'}
        onClose={() => {
          if (!submittingCategory) {
            setActiveModal(null)
            setModalError(null)
          }
        }}
        title="Tambah Kategori Informasi Publik Baru"
      >
        <form onSubmit={handleCreateCategory} className="space-y-4">
          {modalError && (
            <div
              role="alert"
              className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800"
            >
              {modalError}
            </div>
          )}

          <div>
            <label
              htmlFor="new-category-judul"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Judul Kategori <span className="text-rose-600">*</span>
            </label>
            <input
              id="new-category-judul"
              type="text"
              required
              placeholder="Contoh: Regulasi Daerah & Kebijakan Teknis"
              value={newCategoryJudul}
              onChange={(e) => {
                setNewCategoryJudul(e.target.value)
                setModalError(null)
              }}
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label
              htmlFor="new-category-slug"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Slug URL / Kategori Key (Opsional)
            </label>
            <input
              id="new-category-slug"
              type="text"
              placeholder="Contoh: regulasi_daerah (otomatis dari judul jika kosong)"
              value={newCategoryKey}
              onChange={(e) => {
                setNewCategoryKey(e.target.value)
                setModalError(null)
              }}
              className={`${INPUT_CLASS} font-mono`}
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Halaman publik kategori ini akan dapat diakses di: <code className="text-slate-700 font-mono">/informasi/[slug]</code>
            </p>
          </div>

          <div>
            <label
              htmlFor="new-category-desc"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Deskripsi Pengantar <span className="text-rose-600">*</span>
            </label>
            <textarea
              id="new-category-desc"
              rows={3}
              required
              placeholder="Jelaskan ringkasan informasi yang termuat pada kategori ini..."
              value={newCategoryDeskripsi}
              onChange={(e) => {
                setNewCategoryDeskripsi(e.target.value)
                setModalError(null)
              }}
              className={`${INPUT_CLASS} leading-relaxed`}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              disabled={submittingCategory}
              onClick={() => setActiveModal(null)}
              className={`min-h-[44px] px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50 ${FOCUS_RING_CLASS}`}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submittingCategory}
              className={`min-h-[44px] bg-[#0e4891] hover:bg-[#0a366f] text-white px-5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 ${FOCUS_RING_CLASS}`}
            >
              {submittingCategory ? 'Menyimpan...' : 'Simpan Kategori'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
