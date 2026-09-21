'use client'

import { useState, useEffect, useTransition, useRef } from 'react'
import {
  EnvelopeSimple,
  PaperPlaneTilt,
  FloppyDisk,
  ArrowCounterClockwise,
  Eye,
  PencilSimple,
  DeviceMobile,
  Desktop,
  Tag,
  Info,
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

export default function AdminEmailTemplatesPage() {
  const [templates, setTemplates] = useState<Record<string, EmailTemplateData>>({})
  const [selectedKey, setSelectedKey] = useState<string>('pengajuan_baru_admin')
  const [loading, setLoading] = useState(true)
  const [defaultAdminEmail, setDefaultAdminEmail] = useState('sipardig2026@gmail.com')

  // Form State
  const [formData, setFormData] = useState({
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

  // Reference for active input
  const activeInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)
  const pembukaRef = useRef<HTMLTextAreaElement | null>(null)

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type })
  }

  // Fetch initial templates
  const loadTemplates = async () => {
    setLoading(true)
    const res = await getAdminEmailTemplates()
    if (res.success && res.templates) {
      setTemplates(res.templates)
      if (res.defaultAdminEmail) {
        setDefaultAdminEmail(res.defaultAdminEmail)
        setTestTargetEmail(res.defaultAdminEmail)
      }

      // Initialize form with current selectedKey or first template
      const current = res.templates[selectedKey] || Object.values(res.templates)[0]
      if (current) {
        setSelectedKey(current.template_key)
        syncFormData(current)
      }
    } else {
      showToast(res.error || 'Gagal memuat template email', 'error')
    }
    setLoading(false)
  }

  useEffect(() => {
    loadTemplates()
  }, [])

  // Sync form data when selecting a different template
  const syncFormData = (tpl: EmailTemplateData) => {
    const updated = {
      subjek: tpl.subjek || '',
      badge_label: tpl.badge_label || '',
      judul_heading: tpl.judul_heading || '',
      pesan_pembuka: tpl.pesan_pembuka || '',
      pesan_penutup: tpl.pesan_penutup || '',
      cta_label: tpl.cta_label || '',
    }
    setFormData(updated)
    updatePreview(tpl.template_key, updated)
  }

  const handleSelectTemplate = (key: string) => {
    if (key === selectedKey) return
    setSelectedKey(key)
    const tpl = templates[key]
    if (tpl) {
      syncFormData(tpl)
    }
  }

  // Update live preview HTML
  const updatePreview = async (
    key: string,
    data: {
      subjek: string
      badge_label: string
      judul_heading: string
      pesan_pembuka: string
      pesan_penutup: string
      cta_label: string
    }
  ) => {
    setPreviewLoading(true)
    const res = await renderLivePreviewHtml(key, data)
    if (res.success && res.html) {
      setPreviewHtml(res.html)
      setPreviewSubject(res.subject || data.subjek)
    }
    setPreviewLoading(false)
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    const updated = { ...formData, [name]: value }
    setFormData(updated)
    updatePreview(selectedKey, updated)
  }

  // Simple, clean variable insertion at cursor
  const insertVariable = (variableKey: string) => {
    const input = activeInputRef.current || pembukaRef.current

    if (input) {
      const start = input.selectionStart || 0
      const end = input.selectionEnd || 0
      const text = input.value || ''
      const before = text.substring(0, start)
      const after = text.substring(end, text.length)
      const newValue = before + variableKey + after

      const fieldName = input.name
      const updated = { ...formData, [fieldName]: newValue }
      setFormData(updated)
      updatePreview(selectedKey, updated)

      setTimeout(() => {
        input.focus()
        input.setSelectionRange(start + variableKey.length, start + variableKey.length)
      }, 0)

      showToast(`Variabel ${variableKey} disisipkan`, 'info')
    } else {
      // Default: append to pesan_pembuka
      const updated = {
        ...formData,
        pesan_pembuka: formData.pesan_pembuka + ' ' + variableKey,
      }
      setFormData(updated)
      updatePreview(selectedKey, updated)
      showToast(`Variabel ${variableKey} disisipkan ke Pesan Pembuka`, 'info')
    }
  }

  // Save changes
  const handleSave = () => {
    if (!formData.subjek.trim() || !formData.judul_heading.trim()) {
      showToast('Subjek dan Judul Heading email tidak boleh kosong', 'error')
      return
    }

    startTransition(async () => {
      const res = await updateAdminEmailTemplate(selectedKey, formData)
      if (res.success) {
        showToast('Template email berhasil disimpan dan diperbarui!', 'success')
        setTemplates((prev) => ({
          ...prev,
          [selectedKey]: {
            ...prev[selectedKey],
            ...formData,
            updated_at: new Date().toISOString(),
          },
        }))
      } else {
        showToast(res.error || 'Gagal menyimpan perubahan template', 'error')
      }
    })
  }

  // Reset to default
  const handleConfirmReset = async () => {
    setShowResetModal(false)
    startTransition(async () => {
      const res = await resetAdminEmailTemplate(selectedKey)
      if (res.success) {
        showToast('Template berhasil dikembalikan ke format standar dinas', 'info')
        await loadTemplates()
      } else {
        showToast(res.error || 'Gagal mengembalikan template ke default', 'error')
      }
    })
  }

  // Send test email
  const handleSendTest = async () => {
    if (!testTargetEmail.trim() || !testTargetEmail.includes('@')) {
      showToast('Mohon masukkan alamat email yang valid', 'error')
      return
    }

    setSendingTest(true)
    const res = await sendAdminTestEmail(selectedKey, testTargetEmail, formData)
    setSendingTest(false)
    setShowTestModal(false)

    if (res.success) {
      if (res.mocked) {
        showToast(
          `Simulasi terkirim ke log server. Isi SMTP_PASS di .env.local untuk pengiriman nyata.`,
          'info'
        )
      } else {
        showToast(`Email uji coba berhasil dikirim ke ${testTargetEmail}!`, 'success')
      }
    } else {
      showToast(res.error || 'Gagal mengirim email uji coba', 'error')
    }
  }

  const currentTemplate = templates[selectedKey]

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-extrabold tracking-wide uppercase bg-[#0e4891]/10 text-[#0e4891]">
              <EnvelopeSimple weight="bold" size={13} /> CMS Notifikasi Email
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Kelola Template Notifikasi Email
          </h1>
          <p className="text-xs md:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Sesuaikan redaksi subjek, salam resmi, dan arahan pesan pada setiap alur notifikasi email Dinas CIKASDA Sulteng tanpa perlu mengubah kode program.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setShowTestModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
          >
            <PaperPlaneTilt weight="bold" size={16} className="text-[#0e4891]" />
            Kirim Uji Coba
          </button>
          <button
            onClick={handleSave}
            disabled={isPending || loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0e4891] hover:bg-[#0b3871] text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50"
          >
            <FloppyDisk weight="bold" size={16} />
            {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>

      {/* MAIN MASTER-DETAIL WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT PANEL: TEMPLATE LIST (4 COLS) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3 px-2">
              Daftar Template ({Object.keys(templates).length})
            </h2>

            {loading ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Memuat daftar template...
              </div>
            ) : (
              <div className="space-y-1.5">
                {Object.values(templates).map((tpl) => {
                  const isSelected = tpl.template_key === selectedKey
                  const isAdmin = tpl.target_penerima === 'admin'

                  return (
                    <button
                      key={tpl.template_key}
                      onClick={() => handleSelectTemplate(tpl.template_key)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1.5 ${
                        isSelected
                          ? 'bg-[#0e4891]/5 border-[#0e4891] shadow-2xs'
                          : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wide ${
                            isAdmin
                              ? 'bg-[#0e4891] text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {isAdmin ? 'Petugas PPID' : 'Pemohon'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {tpl.template_key}
                        </span>
                      </div>

                      <span
                        className={`text-xs font-bold leading-snug line-clamp-2 ${
                          isSelected ? 'text-[#0e4891]' : 'text-slate-800'
                        }`}
                      >
                        {tpl.nama_template}
                      </span>

                      <span className="text-[11px] text-slate-500 line-clamp-1 truncate">
                        {tpl.subjek}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* SIMPLE INFORMATION CARD */}
          <div className="bg-slate-100/80 rounded-2xl p-4 border border-slate-200 text-slate-700 text-xs leading-relaxed space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
              <Info weight="bold" size={15} className="text-[#0e4891]" />
              Catatan Sistem
            </div>
            <p className="text-[11px] text-slate-600">
              Kop surat dinas CIKASDA Sulteng dan format tabel resmi telah terkunci agar tampilan email selalu rapi di HP maupun komputer.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL: EDITOR & LIVE PREVIEW (8 COLS) */}
        <div className="lg:col-span-8 space-y-4">
          {/* TAB CONTROLS */}
          <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('editor')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'editor'
                    ? 'bg-[#0e4891] text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <PencilSimple weight="bold" size={15} />
                Editor Formulir
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'preview'
                    ? 'bg-[#0e4891] text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Eye weight="bold" size={15} />
                Pratinjau Visual (Live)
              </button>
            </div>

            {activeTab === 'preview' && (
              <div className="flex items-center gap-1 border border-slate-200 rounded-xl p-1 bg-slate-50">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                    previewDevice === 'desktop'
                      ? 'bg-white shadow-2xs text-[#0e4891]'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Tampilan Komputer / Desktop"
                >
                  <Desktop weight="bold" size={16} />
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                    previewDevice === 'mobile'
                      ? 'bg-white shadow-2xs text-[#0e4891]'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Tampilan Ponsel / Mobile"
                >
                  <DeviceMobile weight="bold" size={16} />
                </button>
              </div>
            )}
          </div>

          {/* TAB CONTENT: EDITOR */}
          {activeTab === 'editor' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {currentTemplate?.nama_template || 'Memuat...'}
                  </h3>
                  <span className="text-xs text-slate-500">
                    Kunci: <code className="text-slate-700 font-bold">{selectedKey}</code>
                  </span>
                </div>

                <button
                  onClick={() => setShowResetModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-xs font-bold transition-colors"
                >
                  <ArrowCounterClockwise weight="bold" size={14} />
                  Reset ke Standar Dinas
                </button>
              </div>

              {/* FIELD 1: SUBJEK EMAIL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Subjek Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="subjek"
                  value={formData.subjek}
                  onChange={handleInputChange}
                  onFocus={(e) => (activeInputRef.current = e.target)}
                  placeholder="Subjek email..."
                  className="w-full text-xs font-medium px-4 py-3 rounded-xl border border-slate-300 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 outline-none transition-all"
                />
              </div>

              {/* ROW: BADGE & HEADING */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Label Kategori (Badge)
                  </label>
                  <input
                    type="text"
                    name="badge_label"
                    value={formData.badge_label}
                    onChange={handleInputChange}
                    onFocus={(e) => (activeInputRef.current = e.target)}
                    placeholder="Label lencana..."
                    className="w-full text-xs font-medium px-4 py-3 rounded-xl border border-slate-300 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 outline-none transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Judul Heading Dalam Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="judul_heading"
                    value={formData.judul_heading}
                    onChange={handleInputChange}
                    onFocus={(e) => (activeInputRef.current = e.target)}
                    placeholder="Judul besar email..."
                    className="w-full text-xs font-medium px-4 py-3 rounded-xl border border-slate-300 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* CARD VARIABEL DINAMIS - MINIMALIS & JELAS */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Tag weight="bold" size={14} className="text-[#0e4891]" />
                    Variabel Otomatis
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Bisa disisipkan ke <strong>Subjek</strong>, <strong>Pesan Pembuka</strong>, atau <strong>Pesan Penutup</strong>
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {currentTemplate?.available_variables?.map((v) => (
                    <button
                      key={v.key}
                      type="button"
                      onClick={() => insertVariable(v.key)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-[#0e4891] hover:text-white border border-slate-200 hover:border-[#0e4891] rounded-lg text-xs transition-colors group shadow-2xs"
                      title={`Klik untuk menyisipkan ${v.key} (Contoh isi: ${v.example})`}
                    >
                      <code className="font-mono text-[#0e4891] group-hover:text-white font-bold text-[11px]">
                        {v.key}
                      </code>
                      <span className="text-[11px] text-slate-500 group-hover:text-white/80">
                        {v.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* FIELD 2: PESAN PEMBUKA */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Salam & Pesan Pembuka <span className="text-rose-500">*</span>
                </label>
                <textarea
                  ref={pembukaRef}
                  name="pesan_pembuka"
                  rows={4}
                  value={formData.pesan_pembuka}
                  onChange={handleInputChange}
                  onFocus={(e) => (activeInputRef.current = e.target)}
                  placeholder="Ketik kalimat pembuka..."
                  className="w-full text-xs font-medium px-4 py-3 rounded-xl border border-slate-300 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 outline-none transition-all leading-relaxed"
                />
              </div>

              {/* FIELD 3: PESAN PENUTUP */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Pesan Penutup / Catatan Bantuan
                </label>
                <textarea
                  name="pesan_penutup"
                  rows={3}
                  value={formData.pesan_penutup}
                  onChange={handleInputChange}
                  onFocus={(e) => (activeInputRef.current = e.target)}
                  placeholder="Ketik kalimat penutup..."
                  className="w-full text-xs font-medium px-4 py-3 rounded-xl border border-slate-300 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 outline-none transition-all leading-relaxed"
                />
              </div>

              {/* FIELD 4: TOMBOL CTA */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Teks Tombol Aksi (Call To Action)
                </label>
                <input
                  type="text"
                  name="cta_label"
                  value={formData.cta_label}
                  onChange={handleInputChange}
                  onFocus={(e) => (activeInputRef.current = e.target)}
                  placeholder="Teks tombol..."
                  className="w-full text-xs font-medium px-4 py-3 rounded-xl border border-slate-300 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 outline-none transition-all"
                />
              </div>

              {/* ACTION BUTTONS FOOTER */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Perubahan akan diterapkan pada semua pengiriman email selanjutnya.
                </span>

                <button
                  onClick={handleSave}
                  disabled={isPending}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0e4891] hover:bg-[#0b3871] text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                >
                  <FloppyDisk weight="bold" size={16} />
                  {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </div>
          )}

          {/* TAB CONTENT: LIVE VISUAL PREVIEW */}
          {activeTab === 'preview' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <div className="bg-slate-100 rounded-xl p-3 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span className="font-bold text-slate-500 uppercase text-[10px]">
                    Subjek Hasil:
                  </span>
                  <span className="font-bold text-slate-900 truncate">
                    {previewSubject || formData.subjek}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 shrink-0">
                  (Simulasi data aktual terisi)
                </div>
              </div>

              {/* SIMULATED VIEWPORT */}
              <div className="flex justify-center bg-slate-200/60 p-4 rounded-xl border border-slate-300/80 min-h-[500px]">
                <div
                  className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 ${
                    previewDevice === 'mobile' ? 'w-[375px]' : 'w-full max-w-[650px]'
                  }`}
                >
                  {previewLoading ? (
                    <div className="py-24 text-center text-xs text-slate-400">
                      Merender pratinjau...
                    </div>
                  ) : (
                    <iframe
                      srcDoc={previewHtml}
                      title="Pratinjau Email"
                      className="w-full h-[640px] border-none"
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CONFIRM RESET MODAL */}
      <ConfirmModal
        isOpen={showResetModal}
        title="Kembalikan Template ke Default?"
        message={`Apakah Anda yakin ingin mengembalikan template "${currentTemplate?.nama_template}" ke format standar bawaan dinas? Seluruh perubahan redaksi yang pernah Anda buat akan diatur ulang.`}
        confirmText="Ya, Kembalikan ke Default"
        cancelText="Batal"
        variant="danger"
        onConfirm={handleConfirmReset}
        onClose={() => setShowResetModal(false)}
      />

      {/* SEND TEST EMAIL MODAL */}
      <Modal
        isOpen={showTestModal}
        onClose={() => setShowTestModal(false)}
        title="Kirim Email Uji Coba (Test Send)"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Kirimkan simulasi email <strong>{currentTemplate?.nama_template}</strong> dengan data contoh untuk memverifikasi tampilannya secara nyata di aplikasi email Anda.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Alamat Email Tujuan <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              value={testTargetEmail}
              onChange={(e) => setTestTargetEmail(e.target.value)}
              placeholder="contoh@gmail.com"
              className="w-full text-xs font-medium px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 outline-none transition-all"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Default otomatis diisi dengan akun dinas: {defaultAdminEmail}
            </span>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              onClick={() => setShowTestModal(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSendTest}
              disabled={sendingTest}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#0e4891] hover:bg-[#0b3871] text-white text-xs font-bold transition-all disabled:opacity-50"
            >
              <PaperPlaneTilt weight="bold" size={15} />
              {sendingTest ? 'Mengirim...' : 'Kirim Sekarang'}
            </button>
          </div>
        </div>
      </Modal>

      {/* TOAST FEEDBACK */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
