'use client'

import { FormEvent, useEffect, useId, useRef, useState } from 'react'
import Modal from '@/components/Modal'
import ConfirmModal from '@/components/ConfirmModal'
import LaporanModal from '@/components/LaporanModal'
import {
  ChatTeardropText,
  XCircle,
  Clock,
  CloudArrowUp,
  CircleNotch,
  CheckCircle,
  WarningCircle,
  Info,
  LinkSimple,
  ArrowSquareOut,
} from '@phosphor-icons/react'
import type { Permohonan } from './AdminPermohonanTable'
import { isSafePublicUrl } from '@/app/lib/security'

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.zip']
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024

type DriveAuthMethod = 'apps_script' | 'oauth2' | 'service_account' | 'none'

interface DriveStatusPayload {
  configured?: boolean
  method?: DriveAuthMethod
  folderConfigured?: boolean
}

interface UploadedDriveItem {
  fileName: string
  fileUrl: string
  folderPath?: string
}

interface DriveUploadHelperProps {
  permohonanId?: number | null
  onAttachUrl: (url: string) => void
  disabled: boolean
  onUploadingChange: (uploading: boolean) => void
}

function getMethodLabel(method: DriveAuthMethod): string {
  switch (method) {
    case 'oauth2':
      return 'OAuth 2.0 Tersambung'
    case 'apps_script':
      return 'Apps Script Tersambung'
    case 'service_account':
      return 'Service Account Tersambung'
    default:
      return 'Drive API Belum Aktif'
  }
}

function DriveUploadHelper({
  permohonanId,
  onAttachUrl,
  disabled,
  onUploadingChange,
}: DriveUploadHelperProps) {
  const fileInputId = useId()
  const manualInputId = useId()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [driveStatus, setDriveStatus] = useState<{
    configured: boolean
    method: DriveAuthMethod
    folderConfigured: boolean
  } | null>(null)
  const [attachMode, setAttachMode] = useState<'upload' | 'manual'>('upload')
  const [manualUrl, setManualUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedDriveItem[]>([])
  const [driveError, setDriveError] = useState<string | null>(null)
  const [driveSuccess, setDriveSuccess] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    fetch('/api/admin/drive-status')
      .then((res) =>
        res.ok
          ? (res.json() as Promise<DriveStatusPayload>)
          : Promise.resolve({ configured: false, method: 'none' as DriveAuthMethod })
      )
      .then((data: DriveStatusPayload) => {
        if (!active) return
        const configured = Boolean(data.configured)
        const method: DriveAuthMethod = data.method || (configured ? 'oauth2' : 'none')
        setDriveStatus({
          configured,
          method,
          folderConfigured: Boolean(data.folderConfigured),
        })
        if (!configured) {
          setAttachMode('manual')
        }
      })
      .catch(() => {
        if (!active) return
        setDriveStatus({ configured: false, method: 'none', folderConfigured: false })
        setAttachMode('manual')
      })
    return () => {
      active = false
    }
  }, [])

  const handleFileChange = async (file: File | null) => {
    if (!file) return

    setDriveError(null)
    setDriveSuccess(null)

    const lowerName = file.name.toLowerCase()
    const hasAllowedExt = ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext))
    if (!hasAllowedExt) {
      setDriveError(
        'Format berkas tidak didukung. Gunakan PDF, DOC/DOCX, XLS/XLSX, PPT/PPTX, atau ZIP.'
      )
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    if (file.size <= 0) {
      setDriveError('Berkas kosong tidak dapat diunggah.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      setDriveError('Ukuran berkas melebihi batas maksimal 25 MB.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setUploading(true)
    onUploadingChange(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('raw_only', 'true')
      formData.append('kategori_key', 'raw_upload')
      formData.append('folder_scope', 'jawaban_permohonan')
      if (permohonanId) {
        formData.append('permohonan_id', String(permohonanId))
      }

      const res = await fetch('/api/admin/upload-drive', {
        method: 'POST',
        body: formData,
      })
      const payload = (await res.json()) as {
        success?: boolean
        fileUrl?: string
        fileName?: string
        folderPath?: string
        error?: string
      }

      if (!res.ok || payload.error || !payload.fileUrl) {
        setDriveError(payload.error || 'Gagal mengunggah berkas ke Google Drive.')
      } else {
        const finalName = payload.fileName || file.name
        onAttachUrl(payload.fileUrl)
        setUploadedFiles((prev) => [
          ...prev,
          { fileName: finalName, fileUrl: payload.fileUrl!, folderPath: payload.folderPath },
        ])
        setDriveSuccess(
          payload.folderPath
            ? `Berkas "${finalName}" berhasil diunggah ke folder Drive "${payload.folderPath}" dan tautannya disisipkan ke jawaban.`
            : `Berkas "${finalName}" berhasil diunggah ke Google Drive dan tautannya disisipkan ke jawaban.`
        )
      }
    } catch {
      setDriveError('Terjadi gangguan koneksi saat mengunggah berkas ke Google Drive.')
    } finally {
      setUploading(false)
      onUploadingChange(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleAttachManualLink = () => {
    setDriveError(null)
    setDriveSuccess(null)
    const cleanUrl = manualUrl.trim()

    if (!cleanUrl) {
      setDriveError('Tempelkan tautan Google Drive terlebih dahulu sebelum menyisipkan.')
      return
    }

    if (!isSafePublicUrl(cleanUrl)) {
      setDriveError('Format tautan tidak valid. Gunakan URL awalan http:// atau https://.')
      return
    }

    onAttachUrl(cleanUrl)
    setManualUrl('')
    setDriveSuccess('Tautan Google Drive berhasil disisipkan ke kolom jawaban.')
  }

  const isDriveReady = driveStatus?.configured === true
  const currentWitaYear = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Makassar',
    year: 'numeric',
  }).format(new Date())
  const previewTargetFolder = permohonanId
    ? `Jawaban Permohonan / ${currentWitaYear} / Tiket #${permohonanId}`
    : `Jawaban Permohonan / ${currentWitaYear}`

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-bold text-slate-900">
            Lampiran Dokumen (2 Jalur Google Drive)
          </p>
          <p className="text-[11px] text-slate-600 font-medium">
            Unggah file langsung ke Google Drive atau tempel tautan Drive yang sudah ada.
          </p>
        </div>

        {driveStatus !== null && (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-bold whitespace-nowrap ${
              isDriveReady
                ? 'border-blue-200 bg-blue-50 text-[#0e4891]'
                : 'border-amber-200 bg-amber-50 text-amber-800'
            }`}
          >
            {isDriveReady ? (
              <CheckCircle size={13} weight="fill" aria-hidden="true" />
            ) : (
              <WarningCircle size={13} weight="fill" aria-hidden="true" />
            )}
            <span>{getMethodLabel(driveStatus.method)}</span>
          </span>
        )}
      </div>

      {/* Selector 2 Jalur */}
      <div
        role="tablist"
        aria-label="Pilih metode lampiran Google Drive"
        className="grid grid-cols-2 gap-1.5 p-1 rounded-lg bg-slate-200/70 border border-slate-200"
      >
        <button
          type="button"
          role="tab"
          aria-selected={attachMode === 'upload'}
          onClick={() => {
            setDriveError(null)
            setAttachMode('upload')
          }}
          className={`min-h-[38px] px-3 py-1.5 rounded-md text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e4891] focus-visible:ring-offset-1 ${
            attachMode === 'upload'
              ? 'bg-white text-[#0e4891] border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 border border-transparent'
          }`}
        >
          <CloudArrowUp size={15} weight="bold" aria-hidden="true" />
          <span>Unggah File ke Drive</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={attachMode === 'manual'}
          onClick={() => {
            setDriveError(null)
            setAttachMode('manual')
          }}
          className={`min-h-[38px] px-3 py-1.5 rounded-md text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e4891] focus-visible:ring-offset-1 ${
            attachMode === 'manual'
              ? 'bg-white text-[#0e4891] border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 border border-transparent'
          }`}
        >
          <LinkSimple size={15} weight="bold" aria-hidden="true" />
          <span>Tempel Link Manual</span>
        </button>
      </div>

      {/* Konten Jalur 1: Unggah Langsung ke Drive */}
      {attachMode === 'upload' && (
        <div className="space-y-2.5">
          {driveStatus?.configured === false ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 font-medium leading-relaxed">
              Kredensial Google Drive API belum terdeteksi di server. Gunakan tab{' '}
              <strong>Tempel Link Manual</strong> di sebelah kanan, atau lengkapi variabel Google Drive pada{' '}
              <code className="px-1 py-0.5 bg-amber-100 rounded font-mono text-[11px]">.env.local</code>.
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white border border-slate-200 rounded-lg p-3">
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900">
                  Pilih file dokumen untuk diunggah ke Drive
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  PDF, DOC/DOCX, XLS/XLSX, PPT/PPTX, atau ZIP (maks. 25 MB). Tujuan folder:{' '}
                  <span className="font-semibold text-slate-700">{previewTargetFolder}</span>.
                </p>
              </div>

              <div className="shrink-0">
                <input
                  ref={fileInputRef}
                  id={fileInputId}
                  type="file"
                  accept={ALLOWED_EXTENSIONS.join(',')}
                  disabled={disabled || uploading || driveStatus === null}
                  onChange={(e) => void handleFileChange(e.target.files?.[0] || null)}
                  className="sr-only"
                />
                <button
                  type="button"
                  disabled={disabled || uploading || driveStatus === null}
                  onClick={() => fileInputRef.current?.click()}
                  className="min-h-[42px] whitespace-nowrap px-3.5 py-2 rounded-lg bg-[#0e4891] hover:bg-[#0a366f] text-xs font-bold text-white disabled:opacity-50 transition-colors inline-flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e4891] focus-visible:ring-offset-2"
                >
                  {uploading ? (
                    <>
                      <CircleNotch size={15} weight="bold" className="animate-spin" aria-hidden="true" />
                      <span>Mengunggah...</span>
                    </>
                  ) : (
                    <>
                      <CloudArrowUp size={16} weight="bold" aria-hidden="true" />
                      <span>Pilih &amp; Unggah File</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {uploadedFiles.length > 0 && (
            <ul className="space-y-1.5" aria-label="Berkas terunggah pada jawaban ini">
              {uploadedFiles.map((item, idx) => (
                <li
                  key={`${item.fileUrl}-${idx}`}
                  className="flex items-center justify-between gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs"
                >
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-800 truncate block">
                      {item.fileName}
                    </span>
                    {item.folderPath && (
                      <span className="text-[11px] text-slate-500 font-medium block truncate">
                        Folder: {item.folderPath}
                      </span>
                    )}
                  </div>
                  <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#0e4891] hover:underline font-bold shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e4891] rounded-sm"
                  >
                    <span>Lihat di Drive</span>
                    <ArrowSquareOut size={13} weight="bold" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Konten Jalur 2: Tempel Link Manual */}
      {attachMode === 'manual' && (
        <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
          <label htmlFor={manualInputId} className="block text-xs font-bold text-slate-800">
            Tautan Google Drive / Dokumen Publik
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id={manualInputId}
              type="url"
              value={manualUrl}
              disabled={disabled}
              onChange={(e) => setManualUrl(e.target.value)}
              placeholder="https://drive.google.com/file/d/..."
              className="flex-1 min-w-0 min-h-[40px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-500 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none"
            />
            <button
              type="button"
              disabled={disabled || !manualUrl.trim()}
              onClick={handleAttachManualLink}
              className="min-h-[40px] whitespace-nowrap shrink-0 px-3.5 py-2 rounded-lg border border-[#0e4891] bg-blue-50/60 hover:bg-blue-100 text-[#0e4891] text-xs font-bold disabled:opacity-50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e4891] focus-visible:ring-offset-2"
            >
              Sisipkan ke Jawaban
            </button>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Pastikan izin akses link di Google Drive sudah disetel ke siapa saja yang memiliki tautan (Viewer).
          </p>
        </div>
      )}

      {driveSuccess && (
        <div
          role="status"
          className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-[#0e4891] flex items-start gap-2"
        >
          <CheckCircle size={15} weight="fill" className="shrink-0 mt-0.5" aria-hidden="true" />
          <span>{driveSuccess}</span>
        </div>
      )}

      {driveError && (
        <div
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800 flex items-start gap-2"
        >
          <WarningCircle size={15} weight="fill" className="shrink-0 mt-0.5" aria-hidden="true" />
          <span>{driveError}</span>
        </div>
      )}
    </div>
  )
}

function formatDateWitaDisplay(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  const match = dateStr.trim().match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (match) {
    const [, y, m, d] = match.map(Number)
    return new Date(y, m - 1, d).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }
  const parsed = new Date(dateStr)
  if (Number.isNaN(parsed.getTime())) return dateStr
  return parsed.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

interface AdminPermohonanModalsProps {
  activeModal: 'jawab' | 'tolak' | 'perpanjang' | null
  setActiveModal: (modal: 'jawab' | 'tolak' | 'perpanjang' | null) => void
  inputText: string
  setInputText: (text: string) => void
  submitJawab: (e: FormEvent) => Promise<void>
  submitTolak: (e: FormEvent) => Promise<void>
  submitPerpanjang: (e: FormEvent) => Promise<void>
  updatingId: number | null
  confirmProcessItem: Permohonan | null
  setConfirmProcessItem: (item: Permohonan | null) => void
  executeSetDiproses: () => Promise<void>
  showLaporanModal: boolean
  setShowLaporanModal: (v: boolean) => void
  selectedItem?: Permohonan | null
}

export default function AdminPermohonanModals({
  activeModal,
  setActiveModal,
  inputText,
  setInputText,
  submitJawab,
  submitTolak,
  submitPerpanjang,
  updatingId,
  confirmProcessItem,
  setConfirmProcessItem,
  executeSetDiproses,
  showLaporanModal,
  setShowLaporanModal,
  selectedItem,
}: AdminPermohonanModalsProps) {
  const [uploadingDrive, setUploadingDrive] = useState(false)
  const jawabTextareaId = useId()
  const tolakTextareaId = useId()
  const perpanjangTextareaId = useId()

  const closeActiveModal = () => {
    if (updatingId !== null || uploadingDrive) return
    setActiveModal(null)
  }

  const handleAttachDriveUrl = (url: string) => {
    const trimmed = inputText.trim()
    setInputText(trimmed ? `${trimmed}\n\nDokumen lampiran: ${url}` : url)
  }

  const selectedContextLabel = selectedItem
    ? `#${selectedItem.id} - ${selectedItem.profiles?.nama || 'Pemohon'}`
    : null

  return (
    <>
      {/* MODAL JAWAB */}
      <Modal
        isOpen={activeModal === 'jawab'}
        onClose={closeActiveModal}
        title={
          <span className="flex items-center gap-2">
            <ChatTeardropText size={18} weight="bold" className="text-[#0e4891]" aria-hidden="true" />
            <span>Jawab Permohonan Informasi</span>
          </span>
        }
      >
        <form onSubmit={submitJawab} className="space-y-4">
          {selectedContextLabel && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-700">
              Tiket tujuan: <span className="font-bold text-slate-900">{selectedContextLabel}</span>
            </div>
          )}

          {activeModal === 'jawab' && (
            <DriveUploadHelper
              permohonanId={selectedItem?.id ?? null}
              onAttachUrl={handleAttachDriveUrl}
              disabled={updatingId !== null}
              onUploadingChange={setUploadingDrive}
            />
          )}

          <div>
            <label
              htmlFor={jawabTextareaId}
              className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-2"
            >
              Teks Jawaban / Link Dokumen Google Drive
            </label>
            <textarea
              id={jawabTextareaId}
              required
              rows={5}
              maxLength={8000}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Tuliskan jawaban resmi atau cantumkan tautan Google Drive dokumen yang diminta..."
              className="w-full rounded-lg border border-slate-300 bg-white p-3.5 text-xs font-medium text-slate-900 placeholder:text-slate-500 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-colors"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={closeActiveModal}
              disabled={updatingId !== null || uploadingDrive}
              className="min-h-[44px] px-4 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e4891] focus-visible:ring-offset-2"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={updatingId !== null || uploadingDrive}
              className="min-h-[44px] px-5 py-2 rounded-lg bg-[#0e4891] hover:bg-[#0a366f] text-white text-xs font-bold disabled:opacity-50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e4891] focus-visible:ring-offset-2"
            >
              {updatingId !== null ? 'Memproses...' : 'Kirim Jawaban'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL TOLAK */}
      <Modal
        isOpen={activeModal === 'tolak'}
        onClose={closeActiveModal}
        title={
          <span className="flex items-center gap-2">
            <XCircle size={18} weight="bold" className="text-rose-600" aria-hidden="true" />
            <span>Tolak Permohonan Informasi</span>
          </span>
        }
      >
        <form onSubmit={submitTolak} className="space-y-4">
          {selectedContextLabel && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-900">
              Menolak permohonan: <span className="font-bold">{selectedContextLabel}</span>
            </div>
          )}

          <div>
            <label
              htmlFor={tolakTextareaId}
              className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-2"
            >
              Alasan Penolakan Permohonan
            </label>
            <textarea
              id={tolakTextareaId}
              required
              rows={4}
              maxLength={4000}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Jelaskan alasan mengapa permohonan informasi ini ditolak..."
              className="w-full rounded-lg border border-slate-300 bg-white p-3.5 text-xs font-medium text-slate-900 placeholder:text-slate-500 focus:border-rose-600 focus:ring-2 focus:ring-rose-600/20 focus:outline-none transition-colors"
            />
            <p className="text-[11px] text-slate-500 font-medium mt-1.5">
              Alasan ini akan dicatat sebagai keputusan resmi dan dikirimkan melalui notifikasi email ke pemohon.
            </p>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={closeActiveModal}
              disabled={updatingId !== null}
              className="min-h-[44px] px-4 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e4891] focus-visible:ring-offset-2"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={updatingId !== null}
              className="min-h-[44px] px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold disabled:opacity-50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2"
            >
              {updatingId !== null ? 'Memproses...' : 'Tolak Permohonan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL PERPANJANG SLA */}
      <Modal
        isOpen={activeModal === 'perpanjang'}
        onClose={closeActiveModal}
        title={
          <span className="flex items-center gap-2">
            <Clock size={18} weight="bold" className="text-[#0e4891]" aria-hidden="true" />
            <span>Perpanjang SLA (+7 Hari Kerja WITA)</span>
          </span>
        }
      >
        <form onSubmit={submitPerpanjang} className="space-y-4">
          <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-3.5 text-xs text-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[#0e4891]">
              <Info size={15} weight="fill" aria-hidden="true" />
              <span>+7 Hari Kerja WITA (dihitung otomatis oleh sistem)</span>
            </div>
            <p className="text-slate-600 font-medium leading-relaxed">
              {selectedContextLabel ? `${selectedContextLabel} - ` : ''}
              Tenggat awal:{' '}
              <span className="font-bold text-slate-900">
                {formatDateWitaDisplay(selectedItem?.deadline_awal || selectedItem?.created_at)}
              </span>
              . Batas akhir baru akan ditambahkan 7 hari kerja (Senin sampai Jumat) di zona waktu WITA oleh server.
            </p>
          </div>

          <div>
            <label
              htmlFor={perpanjangTextareaId}
              className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-2"
            >
              Alasan Perpanjangan Waktu SLA
            </label>
            <textarea
              id={perpanjangTextareaId}
              required
              rows={4}
              maxLength={2000}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Jelaskan alasan teknis perpanjangan batas waktu respon..."
              className="w-full rounded-lg border border-slate-300 bg-white p-3.5 text-xs font-medium text-slate-900 placeholder:text-slate-500 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-colors"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={closeActiveModal}
              disabled={updatingId !== null}
              className="min-h-[44px] px-4 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e4891] focus-visible:ring-offset-2"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={updatingId !== null}
              className="min-h-[44px] px-5 py-2 rounded-lg bg-[#0e4891] hover:bg-[#0a366f] text-white text-xs font-bold disabled:opacity-50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e4891] focus-visible:ring-offset-2"
            >
              {updatingId !== null ? 'Memproses...' : 'Simpan Perpanjangan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM PROCESS MODAL */}
      <ConfirmModal
        isOpen={confirmProcessItem !== null}
        onClose={() => setConfirmProcessItem(null)}
        onConfirm={executeSetDiproses}
        title="Konfirmasi Proses Permohonan"
        message={`Apakah Anda yakin ingin memproses permohonan informasi dari ${
          confirmProcessItem?.profiles?.nama || 'Pemohon'
        }? Status permohonan akan diperbarui menjadi "Diproses".`}
        confirmText="Ya, Proses Permohonan"
        cancelText="Batal"
        variant="primary"
        loading={updatingId !== null}
      />

      {/* LAPORAN MODAL (PDF / EXCEL EXPORT) */}
      <LaporanModal
        isOpen={showLaporanModal}
        onClose={() => setShowLaporanModal(false)}
      />
    </>
  )
}
