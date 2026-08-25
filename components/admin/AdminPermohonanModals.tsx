import Modal from '@/components/Modal'
import ConfirmModal from '@/components/ConfirmModal'
import LaporanModal from '@/components/LaporanModal'
import { FormEvent } from 'react'

// You might want to define this type in a shared types file later, but we'll include it here for now
type Permohonan = any

interface AdminPermohonanModalsProps {
  // Modal states
  activeModal: 'jawab' | 'tolak' | 'perpanjang' | null
  setActiveModal: (modal: 'jawab' | 'tolak' | 'perpanjang' | null) => void
  inputText: string
  setInputText: (text: string) => void
  
  // Submit handlers
  submitJawab: (e: FormEvent) => Promise<void>
  submitTolak: (e: FormEvent) => Promise<void>
  submitPerpanjang: (e: FormEvent) => Promise<void>
  
  // State for loading
  updatingId: number | null
  
  // Confirm process modal
  confirmProcessItem: Permohonan | null
  setConfirmProcessItem: (item: Permohonan | null) => void
  executeSetDiproses: () => Promise<void>
  
  // Laporan modal
  showLaporanModal: boolean
  setShowLaporanModal: (v: boolean) => void
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
  setShowLaporanModal
}: AdminPermohonanModalsProps) {
  return (
    <>
      {/* MODAL JAWAB */}
      <Modal
        isOpen={activeModal === 'jawab'}
        onClose={() => setActiveModal(null)}
        title="💬 Jawab Permohonan Informasi"
      >
        <form onSubmit={submitJawab} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-2">
              Teks Jawaban / Link Dokumen Google Drive
            </label>
            <textarea
              required
              rows={5}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Tuliskan jawaban resmi atau cantumkan tautan Google Drive dokumen yang diminta..."
              className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-xs font-medium text-slate-900 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-all"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={updatingId !== null}
              className="px-5 py-2 rounded-xl bg-[#0e4891] hover:bg-[#0a366f] text-white text-xs font-bold shadow-sm disabled:opacity-50 transition-all cursor-pointer"
            >
              {updatingId !== null ? 'Memproses...' : 'Kirim Jawaban'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL TOLAK */}
      <Modal
        isOpen={activeModal === 'tolak'}
        onClose={() => setActiveModal(null)}
        title="❌ Tolak Permohonan Informasi"
      >
        <form onSubmit={submitTolak} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-2">
              Alasan Penolakan Permohonan
            </label>
            <textarea
              required
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Jelaskan alasan mengapa permohonan informasi ini ditolak..."
              className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-xs font-medium text-slate-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-none transition-all"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={updatingId !== null}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm disabled:opacity-50 transition-all cursor-pointer"
            >
              {updatingId !== null ? 'Memproses...' : 'Tolak Permohonan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL PERPANJANG SLA */}
      <Modal
        isOpen={activeModal === 'perpanjang'}
        onClose={() => setActiveModal(null)}
        title="⏱️ Perpanjang SLA (+7 Hari Kerja)"
      >
        <form onSubmit={submitPerpanjang} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-2">
              Alasan Perpanjangan Waktu SLA
            </label>
            <textarea
              required
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Jelaskan alasan teknis perpanjangan batas waktu respon..."
              className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-xs font-medium text-slate-900 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-all"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={updatingId !== null}
              className="px-5 py-2 rounded-xl bg-[#0e4891] hover:bg-[#0a366f] text-white text-xs font-bold shadow-sm disabled:opacity-50 transition-all cursor-pointer"
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
        message={`Apakah Anda yakin ingin memproses permohonan informasi dari ${confirmProcessItem?.profiles?.nama || 'Pemohon'}? Status permohonan akan diperbarui menjadi "Diproses".`}
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
