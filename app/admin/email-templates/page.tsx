'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import {
  PaperPlaneTilt,
  FloppyDisk,
  ArrowCounterClockwise,
  Eye,
  PencilSimple,
  DeviceMobile,
  Desktop,
  Tag,
  Info,
  ArrowsClockwise,
  WarningCircle,
} from '@phosphor-icons/react'
import Toast, { ToastType } from '@/components/Toast'
import ConfirmModal from '@/components/ConfirmModal'
import Modal from '@/components/Modal'
import {
  getAdminEmailTemplates,
  updateAdminEmailTemplate,
  resetAdminEmailTemplate,
  renderLivePreviewHtml,
  sendAdminTestEmail,
} from '@/app/actions/email-templates'
import { EmailTemplateData } from '@/app/lib/email/default-templates'

interface EmailFormValues {
  subjek: string
  badge_label: string
  judul_heading: string
  pesan_pembuka: string
  pesan_penutup: string
  cta_label: string
}

type EmailFormField = keyof EmailFormValues

const VALID_FORM_FIELDS: readonly EmailFormField[] = [
  'subjek',
  'badge_label',
  'judul_heading',
  'pesan_pembuka',
  'pesan_penutup',
  'cta_label',
]

const DEFAULT_TEMPLATE_KEY = 'pengajuan_baru_admin'
const PREVIEW_DEBOUNCE_MS = 350

const FOCUS_RING_CLASS =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e4891] focus-visible:ring-offset-2'

const INPUT_CLASS =
  'w-full text-xs font-medium px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-colors'

function toFormValues(tpl: EmailTemplateData): EmailFormValues {
  return {
    subjek: tpl.subjek || '',
    badge_label: tpl.badge_label || '',
    judul_heading: tpl.judul_heading || '',
    pesan_pembuka: tpl.pesan_pembuka || '',
    pesan_penutup: tpl.pesan_penutup || '',
    cta_label: tpl.cta_label || '',
  }
}

export default function AdminEmailTemplatesPage() {
  const [templates, setTemplates] = useState<Record<string, EmailTemplateData>>({})
  const [selectedKey, setSelectedKey] = useState<string>(DEFAULT_TEMPLATE_KEY)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [defaultAdminEmail, setDefaultAdminEmail] = useState('sipardig2026@gmail.com')

  // Form State
  const [formData, setFormData] = useState<EmailFormValues>({
    subjek: '',
    badge_label: '',
    judul_heading: '',
    pesan_pembuka: '',
    pesan_penutup: '',
    cta_label: '',
  })

  // Live Preview State
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor')
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [previewSubject, setPreviewSubject] = useState('')
  const [previewHtml, setPreviewHtml] = useState('')
  const [previewLoading, setPreviewLoading] = useState(false)

  // Modals & Feedback
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  const [showResetModal, setShowResetModal] = useState(false)
  const [showTestModal, setShowTestModal] = useState(false)
  const [testTargetEmail, setTestTargetEmail] = useState('')
  const [sendingTest, setSendingTest] = useState(false)

  // Refs for input cursor insertion, unmount safety, debounce, and stale preview guard
  const activeInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)
  const pembukaRef = useRef<HTMLTextAreaElement | null>(null)
  const previewDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const previewRequestIdRef = useRef(0)
  const isMountedRef = useRef(true)

  const closeToast = useCallback(() => {
    setToast(null)
  }, [])

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ message, type })
  }, [])

  const runPreviewRender = useCallback(
    async (key: string, data: EmailFormValues, requestId: number) => {
      if (!isMountedRef.current || requestId !== previewRequestIdRef.current) {
        return
      }
      setPreviewLoading(true)
      try {
        const res = await renderLivePreviewHtml(key, data)
        if (!isMountedRef.current || requestId !== previewRequestIdRef.current) {
          return
        }
        if (res.success && res.html) {
          setPreviewHtml(res.html)
          setPreviewSubject(res.subject || data.subjek)
        }
      } catch {
        // Ignore transient preview errors while keeping last valid preview
      } finally {
        if (isMountedRef.current && requestId === previewRequestIdRef.current) {
          setPreviewLoading(false)
        }
      }
    },
    []
  )

  const triggerImmediatePreview = useCallback(
    (key: string, data: EmailFormValues) => {
      if (previewDebounceTimerRef.current) {
        clearTimeout(previewDebounceTimerRef.current)
        previewDebounceTimerRef.current = null
      }
      const requestId = ++previewRequestIdRef.current
      void runPreviewRender(key, data, requestId)
    },
    [runPreviewRender]
  )

  const scheduleDebouncedPreview = useCallback(
    (key: string, data: EmailFormValues) => {
      if (previewDebounceTimerRef.current) {
        clearTimeout(previewDebounceTimerRef.current)
      }
      const requestId = ++previewRequestIdRef.current
      previewDebounceTimerRef.current = setTimeout(() => {
        previewDebounceTimerRef.current = null
        void runPreviewRender(key, data, requestId)
      }, PREVIEW_DEBOUNCE_MS)
    },
    [runPreviewRender]
  )

  const loadTemplates = useCallback(
    async (preferredKey?: string) => {
      setLoading(true)
      setFetchError(null)
      try {
        const res = await getAdminEmailTemplates()
        if (!isMountedRef.current) return

        if (res.success && res.templates) {
          setTemplates(res.templates)
          if (res.defaultAdminEmail) {
            setDefaultAdminEmail(res.defaultAdminEmail)
            setTestTargetEmail((prev) => prev || res.defaultAdminEmail || '')
          }

          const targetKey = preferredKey || selectedKey
          const current = res.templates[targetKey] || Object.values(res.templates)[0]
          if (current) {
            const nextForm = toFormValues(current)
            setSelectedKey(current.template_key)
            setFormData(nextForm)
            triggerImmediatePreview(current.template_key, nextForm)
          }
        } else {
          const msg = res.error || 'Gagal memuat template email.'
          setFetchError(msg)
          showToast(msg, 'error')
        }
      } catch (err: unknown) {
        if (!isMountedRef.current) return
        const msg =
          err instanceof Error ? err.message : 'Terjadi kesalahan saat menghubungi server.'
        setFetchError(msg)
        showToast(msg, 'error')
      } finally {
        if (isMountedRef.current) {
          setLoading(false)
        }
      }
    },
    [selectedKey, showToast, triggerImmediatePreview]
  )

  useEffect(() => {
    isMountedRef.current = true
    let active = true

    const init = async () => {
      try {
        const res = await getAdminEmailTemplates()
        if (!active || !isMountedRef.current) return

        if (res.success && res.templates) {
          setTemplates(res.templates)
          setFetchError(null)
          if (res.defaultAdminEmail) {
            setDefaultAdminEmail(res.defaultAdminEmail)
            setTestTargetEmail(res.defaultAdminEmail)
          }

          const current =
            res.templates[DEFAULT_TEMPLATE_KEY] || Object.values(res.templates)[0]
          if (current) {
            const initialForm = toFormValues(current)
            setSelectedKey(current.template_key)
            setFormData(initialForm)

            const requestId = ++previewRequestIdRef.current
            setPreviewLoading(true)
            const previewRes = await renderLivePreviewHtml(current.template_key, initialForm)
            if (active && isMountedRef.current && requestId === previewRequestIdRef.current) {
              if (previewRes.success && previewRes.html) {
                setPreviewHtml(previewRes.html)
                setPreviewSubject(previewRes.subject || initialForm.subjek)
              }
              setPreviewLoading(false)
            }
          }
        } else {
          const msg = res.error || 'Gagal memuat template email.'
          setFetchError(msg)
          setToast({ message: msg, type: 'error' })
        }
      } catch (err: unknown) {
        if (!active || !isMountedRef.current) return
        const msg =
          err instanceof Error ? err.message : 'Terjadi kesalahan saat menghubungi server.'
        setFetchError(msg)
        setToast({ message: msg, type: 'error' })
      } finally {
        if (active && isMountedRef.current) {
          setLoading(false)
        }
      }
    }

    void init()

    return () => {
      active = false
      isMountedRef.current = false
      if (previewDebounceTimerRef.current) {
        clearTimeout(previewDebounceTimerRef.current)
        previewDebounceTimerRef.current = null
      }
    }
  }, [])

  const handleSelectTemplate = (key: string) => {
    if (key === selectedKey) return
    const tpl = templates[key]
    if (!tpl) return
    const nextForm = toFormValues(tpl)
    setSelectedKey(key)
    setFormData(nextForm)
    triggerImmediatePreview(tpl.template_key, nextForm)
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    if (!VALID_FORM_FIELDS.includes(name as EmailFormField)) return
    const updated = { ...formData, [name]: value }
    setFormData(updated)
    scheduleDebouncedPreview(selectedKey, updated)
  }

  const insertVariable = (variableKey: string) => {
    const input = activeInputRef.current || pembukaRef.current
    const fieldName = input?.name as EmailFormField | undefined

    if (input && fieldName && VALID_FORM_FIELDS.includes(fieldName)) {
      const start = input.selectionStart ?? input.value.length
      const end = input.selectionEnd ?? input.value.length
      const text = formData[fieldName]
      const before = text.substring(0, start)
      const after = text.substring(end)
      const newValue = before + variableKey + after

      const updated = { ...formData, [fieldName]: newValue }
      setFormData(updated)
      scheduleDebouncedPreview(selectedKey, updated)

      setTimeout(() => {
        if (!isMountedRef.current) return
        input.focus()
        const cursorPos = start + variableKey.length
        input.setSelectionRange(cursorPos, cursorPos)
      }, 0)

      showToast(`Variabel ${variableKey} disisipkan`, 'info')
    } else {
      const updated = {
        ...formData,
        pesan_pembuka: `${formData.pesan_pembuka} ${variableKey}`.trimStart(),
      }
      setFormData(updated)
      scheduleDebouncedPreview(selectedKey, updated)
      showToast(`Variabel ${variableKey} disisipkan ke Pesan Pembuka`, 'info')
    }
  }

  const handleSave = () => {
    if (!formData.subjek.trim() || !formData.judul_heading.trim()) {
      showToast('Subjek dan Judul Heading email tidak boleh kosong.', 'error')
      return
    }

    startTransition(async () => {
      try {
        const res = await updateAdminEmailTemplate(selectedKey, formData)
        if (res.success) {
          showToast('Template email berhasil disimpan dan diperbarui.', 'success')
          setTemplates((prev) => ({
            ...prev,
            [selectedKey]: {
              ...prev[selectedKey],
              ...formData,
              updated_at: new Date().toISOString(),
            },
          }))
        } else {
          showToast(res.error || 'Gagal menyimpan perubahan template.', 'error')
        }
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : 'Gagal menyimpan perubahan template.'
        showToast(msg, 'error')
      }
    })
  }

  const handleConfirmReset = () => {
    setShowResetModal(false)
    startTransition(async () => {
      try {
        const res = await resetAdminEmailTemplate(selectedKey)
        if (res.success) {
          showToast('Template berhasil dikembalikan ke format standar dinas.', 'info')
          await loadTemplates(selectedKey)
        } else {
          showToast(res.error || 'Gagal mengembalikan template ke default.', 'error')
        }
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : 'Gagal mengembalikan template ke default.'
        showToast(msg, 'error')
      }
    })
  }

  const handleSendTest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!testTargetEmail.trim() || !testTargetEmail.includes('@')) {
      showToast('Mohon masukkan alamat email yang valid.', 'error')
      return
    }

    setSendingTest(true)
    try {
      const res = await sendAdminTestEmail(selectedKey, testTargetEmail, formData)
      setShowTestModal(false)

      if (res.success) {
        if (res.mocked) {
          showToast(
            'Simulasi terkirim ke log server. Isi SMTP_PASS di .env.local untuk pengiriman nyata.',
            'info'
          )
        } else {
          showToast(`Email uji coba berhasil dikirim ke ${testTargetEmail}.`, 'success')
        }
      } else {
        showToast(res.error || 'Gagal mengirim email uji coba.', 'error')
      }
    } catch (err: unknown) {
      setShowTestModal(false)
      const msg = err instanceof Error ? err.message : 'Gagal mengirim email uji coba.'
      showToast(msg, 'error')
    } finally {
      setSendingTest(false)
    }
  }

  const templateList = Object.values(templates)
  const currentTemplate = templates[selectedKey]

  return (
    <div className="space-y-6 pb-16 font-plus-jakarta">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Kelola Template Notifikasi Email
          </h1>
          <p className="text-xs md:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed font-medium">
            Sesuaikan redaksi subjek, salam resmi, dan arahan pesan pada setiap alur notifikasi email Dinas CIKASDA Sulteng tanpa perlu mengubah kode program.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap shrink-0">
          <button
            type="button"
            onClick={() => setShowTestModal(true)}
            disabled={loading || !!fetchError || !currentTemplate}
            className={`min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 ${FOCUS_RING_CLASS}`}
          >
            <PaperPlaneTilt weight="bold" size={16} className="text-[#0e4891]" />
            <span>Kirim Uji Coba</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending || loading || !currentTemplate}
            className={`min-h-[44px] inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#0e4891] hover:bg-[#0a366f] text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 ${FOCUS_RING_CLASS}`}
          >
            <FloppyDisk weight="bold" size={16} />
            <span>{isPending ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
          </button>
        </div>
      </div>

      {/* INLINE ERROR BANNER WHEN TEMPLATES ALREADY EXIST */}
      {!loading && fetchError && templateList.length > 0 && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-start gap-2.5">
            <WarningCircle size={18} weight="bold" className="text-rose-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-rose-900">Gagal memuat pembaruan template</p>
              <p className="text-xs text-rose-800 mt-0.5">{fetchError}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void loadTemplates(selectedKey)}
            className={`min-h-[44px] px-4 py-2 rounded-lg bg-[#0e4891] hover:bg-[#0a366f] text-white text-xs font-bold transition-colors shrink-0 self-start sm:self-auto cursor-pointer ${FOCUS_RING_CLASS}`}
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* INITIAL FETCH ERROR STATE */}
      {!loading && fetchError && templateList.length === 0 ? (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-white p-8 text-center max-w-xl mx-auto"
        >
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center mx-auto mb-3">
            <WarningCircle size={24} weight="bold" />
          </div>
          <h2 className="text-base font-bold text-slate-900">
            Gagal Memuat Template Notifikasi Email
          </h2>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{fetchError}</p>
          <button
            type="button"
            onClick={() => void loadTemplates()}
            className={`mt-5 inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-lg bg-[#0e4891] hover:bg-[#0a366f] text-white text-xs font-bold transition-colors cursor-pointer ${FOCUS_RING_CLASS}`}
          >
            <ArrowsClockwise size={15} weight="bold" />
            <span>Coba Lagi</span>
          </button>
        </div>
      ) : (
        /* MAIN MASTER-DETAIL WORKSPACE */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT PANEL: TEMPLATE LIST (4 COLS) */}
          <div className="lg:col-span-4 min-w-0 space-y-4">
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-3 px-1">
                Daftar Template ({templateList.length})
              </h2>

              {loading ? (
                <div className="space-y-2 py-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-20 bg-slate-50 rounded-lg border border-slate-200 animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {templateList.map((tpl) => {
                    const isSelected = tpl.template_key === selectedKey
                    const isAdmin = tpl.target_penerima === 'admin'

                    return (
                      <button
                        key={tpl.template_key}
                        type="button"
                        onClick={() => handleSelectTemplate(tpl.template_key)}
                        className={`w-full min-h-[44px] text-left p-3.5 rounded-lg border transition-colors flex flex-col gap-1.5 cursor-pointer ${FOCUS_RING_CLASS} ${
                          isSelected
                            ? 'bg-blue-50 border-[#0e4891]'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 w-full min-w-0">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md tracking-wide shrink-0 ${
                              isAdmin
                                ? 'bg-[#0e4891] text-white'
                                : 'bg-slate-200 text-slate-800'
                            }`}
                          >
                            {isAdmin ? 'Petugas PPID' : 'Pemohon'}
                          </span>
                          <span className="text-[10px] text-slate-600 font-mono truncate">
                            {tpl.template_key}
                          </span>
                        </div>

                        <span
                          className={`text-xs font-bold leading-snug line-clamp-2 ${
                            isSelected ? 'text-[#0e4891]' : 'text-slate-900'
                          }`}
                        >
                          {tpl.nama_template}
                        </span>

                        <span className="text-[11px] text-slate-600 truncate w-full">
                          {tpl.subjek}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* SIMPLE INFORMATION CARD */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-slate-700 text-xs leading-relaxed space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                <Info weight="bold" size={15} className="text-[#0e4891] shrink-0" />
                <span>Catatan Sistem</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Kop surat dinas CIKASDA Sulteng dan format tabel resmi telah terkunci agar tampilan email selalu rapi di HP maupun komputer.
              </p>
            </div>
          </div>

          {/* RIGHT PANEL: EDITOR & LIVE PREVIEW (8 COLS) */}
          <div className="lg:col-span-8 min-w-0 space-y-4">
            {/* TAB CONTROLS */}
            <div className="bg-white rounded-xl p-2 border border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div role="tablist" aria-label="Mode editor template" className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'editor'}
                  onClick={() => setActiveTab('editor')}
                  className={`min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${FOCUS_RING_CLASS} ${
                    activeTab === 'editor'
                      ? 'bg-[#0e4891] text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <PencilSimple weight="bold" size={15} />
                  <span>Editor Formulir</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'preview'}
                  onClick={() => setActiveTab('preview')}
                  className={`min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${FOCUS_RING_CLASS} ${
                    activeTab === 'preview'
                      ? 'bg-[#0e4891] text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Eye weight="bold" size={15} />
                  <span>Pratinjau Visual (Live)</span>
                </button>
              </div>

              {activeTab === 'preview' && (
                <div
                  role="group"
                  aria-label="Ukuran layar pratinjau"
                  className="flex items-center gap-1 border border-slate-200 rounded-lg p-1 bg-slate-50"
                >
                  <button
                    type="button"
                    aria-pressed={previewDevice === 'desktop'}
                    aria-label="Tampilan Komputer / Desktop"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`min-h-[44px] min-w-[44px] px-3 rounded-lg text-xs font-bold transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer ${FOCUS_RING_CLASS} ${
                      previewDevice === 'desktop'
                        ? 'bg-white text-[#0e4891] border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900 border border-transparent'
                    }`}
                    title="Tampilan Komputer / Desktop"
                  >
                    <Desktop weight="bold" size={16} />
                    <span className="hidden sm:inline">Desktop</span>
                  </button>
                  <button
                    type="button"
                    aria-pressed={previewDevice === 'mobile'}
                    aria-label="Tampilan Ponsel / Mobile"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`min-h-[44px] min-w-[44px] px-3 rounded-lg text-xs font-bold transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer ${FOCUS_RING_CLASS} ${
                      previewDevice === 'mobile'
                        ? 'bg-white text-[#0e4891] border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900 border border-transparent'
                    }`}
                    title="Tampilan Ponsel / Mobile"
                  >
                    <DeviceMobile weight="bold" size={16} />
                    <span className="hidden sm:inline">Mobile</span>
                  </button>
                </div>
              )}
            </div>

            {/* TAB CONTENT: EDITOR */}
            {activeTab === 'editor' && (
              <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {currentTemplate?.nama_template || 'Memuat template...'}
                    </h3>
                    <span className="text-xs text-slate-500">
                      Kunci: <code className="text-slate-700 font-bold">{selectedKey}</code>
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={loading || isPending || !currentTemplate}
                    onClick={() => setShowResetModal(true)}
                    className={`min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-xs font-bold transition-colors self-start sm:self-auto shrink-0 cursor-pointer disabled:opacity-50 ${FOCUS_RING_CLASS}`}
                  >
                    <ArrowCounterClockwise weight="bold" size={14} />
                    <span>Reset ke Standar Dinas</span>
                  </button>
                </div>

                {/* FIELD 1: SUBJEK EMAIL */}
                <div>
                  <label
                    htmlFor="email-subjek-input"
                    className="block text-xs font-bold text-slate-700 mb-1.5"
                  >
                    Subjek Email <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="email-subjek-input"
                    type="text"
                    name="subjek"
                    value={formData.subjek}
                    onChange={handleInputChange}
                    onFocus={(e) => {
                      activeInputRef.current = e.target
                    }}
                    placeholder="Subjek email..."
                    className={INPUT_CLASS}
                  />
                </div>

                {/* ROW: BADGE & HEADING */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <label
                      htmlFor="email-badge-input"
                      className="block text-xs font-bold text-slate-700 mb-1.5"
                    >
                      Label Kategori (Badge)
                    </label>
                    <input
                      id="email-badge-input"
                      type="text"
                      name="badge_label"
                      value={formData.badge_label}
                      onChange={handleInputChange}
                      onFocus={(e) => {
                        activeInputRef.current = e.target
                      }}
                      placeholder="Label lencana..."
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label
                      htmlFor="email-heading-input"
                      className="block text-xs font-bold text-slate-700 mb-1.5"
                    >
                      Judul Heading Dalam Email <span className="text-rose-600">*</span>
                    </label>
                    <input
                      id="email-heading-input"
                      type="text"
                      name="judul_heading"
                      value={formData.judul_heading}
                      onChange={handleInputChange}
                      onFocus={(e) => {
                        activeInputRef.current = e.target
                      }}
                      placeholder="Judul besar email..."
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>

                {/* CARD VARIABEL DINAMIS */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Tag weight="bold" size={14} className="text-[#0e4891]" />
                      <span>Variabel Otomatis</span>
                    </span>
                    <span className="text-[11px] text-slate-600">
                      Bisa disisipkan ke <strong>Subjek</strong>, <strong>Pesan Pembuka</strong>, atau <strong>Pesan Penutup</strong>
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {currentTemplate?.available_variables?.map((v) => (
                      <button
                        key={v.key}
                        type="button"
                        onClick={() => insertVariable(v.key)}
                        className={`min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#0e4891] hover:text-white border border-slate-200 hover:border-[#0e4891] rounded-lg text-xs transition-colors group cursor-pointer ${FOCUS_RING_CLASS}`}
                        title={`Klik untuk menyisipkan ${v.key} (Contoh isi: ${v.example})`}
                      >
                        <code className="font-mono text-[#0e4891] group-hover:text-white font-bold text-[11px]">
                          {v.key}
                        </code>
                        <span className="text-[11px] text-slate-600 group-hover:text-white">
                          {v.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* FIELD 2: PESAN PEMBUKA */}
                <div>
                  <label
                    htmlFor="email-pembuka-input"
                    className="block text-xs font-bold text-slate-700 mb-1.5"
                  >
                    Salam &amp; Pesan Pembuka <span className="text-rose-600">*</span>
                  </label>
                  <textarea
                    id="email-pembuka-input"
                    ref={pembukaRef}
                    name="pesan_pembuka"
                    rows={4}
                    value={formData.pesan_pembuka}
                    onChange={handleInputChange}
                    onFocus={(e) => {
                      activeInputRef.current = e.target
                    }}
                    placeholder="Ketik kalimat pembuka..."
                    className={`${INPUT_CLASS} leading-relaxed`}
                  />
                </div>

                {/* FIELD 3: PESAN PENUTUP */}
                <div>
                  <label
                    htmlFor="email-penutup-input"
                    className="block text-xs font-bold text-slate-700 mb-1.5"
                  >
                    Pesan Penutup / Catatan Bantuan
                  </label>
                  <textarea
                    id="email-penutup-input"
                    name="pesan_penutup"
                    rows={3}
                    value={formData.pesan_penutup}
                    onChange={handleInputChange}
                    onFocus={(e) => {
                      activeInputRef.current = e.target
                    }}
                    placeholder="Ketik kalimat penutup..."
                    className={`${INPUT_CLASS} leading-relaxed`}
                  />
                </div>

                {/* FIELD 4: TOMBOL CTA */}
                <div>
                  <label
                    htmlFor="email-cta-input"
                    className="block text-xs font-bold text-slate-700 mb-1.5"
                  >
                    Teks Tombol Aksi (Call To Action)
                  </label>
                  <input
                    id="email-cta-input"
                    type="text"
                    name="cta_label"
                    value={formData.cta_label}
                    onChange={handleInputChange}
                    onFocus={(e) => {
                      activeInputRef.current = e.target
                    }}
                    placeholder="Teks tombol..."
                    className={INPUT_CLASS}
                  />
                </div>

                {/* ACTION BUTTONS FOOTER */}
                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-500">
                    Perubahan akan diterapkan pada semua pengiriman email selanjutnya.
                  </span>

                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isPending || loading || !currentTemplate}
                    className={`min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-2 rounded-lg bg-[#0e4891] hover:bg-[#0a366f] text-white text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer shrink-0 ${FOCUS_RING_CLASS}`}
                  >
                    <FloppyDisk weight="bold" size={16} />
                    <span>{isPending ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: LIVE VISUAL PREVIEW */}
            {activeTab === 'preview' && (
              <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200 space-y-4">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="font-bold text-slate-600 uppercase text-[10px] shrink-0">
                      Subjek Hasil:
                    </span>
                    <span className="font-bold text-slate-900 truncate">
                      {previewSubject || formData.subjek}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 shrink-0">
                    (Simulasi data aktual terisi)
                  </div>
                </div>

                {/* SIMULATED VIEWPORT */}
                <div className="flex justify-center bg-slate-50 p-2 sm:p-4 rounded-xl border border-slate-200 min-h-[500px] overflow-hidden">
                  <div
                    className={`bg-white rounded-xl border border-slate-200 overflow-hidden transition-all duration-300 ${
                      previewDevice === 'mobile' ? 'w-full max-w-[375px]' : 'w-full max-w-[650px]'
                    }`}
                  >
                    {previewLoading ? (
                      <div className="py-24 text-center text-xs font-medium text-slate-500">
                        Merender pratinjau...
                      </div>
                    ) : (
                      <iframe
                        srcDoc={previewHtml}
                        sandbox=""
                        title="Pratinjau Email"
                        className="w-full h-[640px] border-none bg-white"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONFIRM RESET MODAL */}
      <ConfirmModal
        isOpen={showResetModal}
        title="Kembalikan Template ke Default?"
        message={`Apakah Anda yakin ingin mengembalikan template "${currentTemplate?.nama_template || ''}" ke format standar bawaan dinas? Seluruh perubahan redaksi yang pernah Anda buat akan diatur ulang.`}
        confirmText="Ya, Kembalikan ke Default"
        cancelText="Batal"
        variant="danger"
        loading={isPending}
        onConfirm={handleConfirmReset}
        onClose={() => {
          if (!isPending) setShowResetModal(false)
        }}
      />

      {/* SEND TEST EMAIL MODAL */}
      <Modal
        isOpen={showTestModal}
        onClose={() => {
          if (!sendingTest) setShowTestModal(false)
        }}
        title="Kirim Email Uji Coba (Test Send)"
      >
        <form onSubmit={(e) => void handleSendTest(e)} className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Kirimkan simulasi email <strong>{currentTemplate?.nama_template}</strong> dengan data contoh untuk memverifikasi tampilannya secara nyata di aplikasi email Anda.
          </p>

          <div>
            <label
              htmlFor="test-target-email"
              className="block text-xs font-bold text-slate-700 mb-1.5"
            >
              Alamat Email Tujuan <span className="text-rose-600">*</span>
            </label>
            <input
              id="test-target-email"
              type="email"
              required
              value={testTargetEmail}
              onChange={(e) => setTestTargetEmail(e.target.value)}
              placeholder="contoh@gmail.com"
              className={INPUT_CLASS}
            />
            <span className="text-[11px] text-slate-500 mt-1.5 block">
              Default otomatis diisi dengan akun dinas: {defaultAdminEmail}
            </span>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={sendingTest}
              onClick={() => setShowTestModal(false)}
              className={`min-h-[44px] px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50 ${FOCUS_RING_CLASS}`}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={sendingTest}
              className={`min-h-[44px] inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#0e4891] hover:bg-[#0a366f] text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 ${FOCUS_RING_CLASS}`}
            >
              <PaperPlaneTilt weight="bold" size={15} />
              <span>{sendingTest ? 'Mengirim...' : 'Kirim Sekarang'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
    </div>
  )
}
