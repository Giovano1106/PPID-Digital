'use client'

import { useEffect, useId, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { Warning, Question, X } from '@phosphor-icons/react'

const subscribeNoop = () => () => {}

function useIsClient() {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  )
}

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'primary'
  loading?: boolean
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  variant = 'primary',
  loading = false,
}: ConfirmModalProps) {
  const mounted = useIsClient()
  const titleId = useId()
  const descId = useId()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onClose()
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose, loading])

  if (!isOpen || !mounted) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in"
      onClick={() => {
        if (!loading) onClose()
      }}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      <div
        className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-3">
          <h3 id={titleId} className="font-bold text-sm tracking-tight text-slate-900 flex items-center gap-2">
            <span aria-hidden="true">
              {variant === 'danger' ? (
                <Warning weight="fill" size={18} className="text-rose-600" />
              ) : (
                <Question weight="fill" size={18} className="text-[#0e4891]" />
              )}
            </span>
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Tutup konfirmasi"
            className="w-9 h-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e4891] focus-visible:ring-offset-2"
          >
            <X weight="bold" size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p id={descId} className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
            {message}
          </p>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 min-h-[40px] rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e4891] focus-visible:ring-offset-2"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`px-5 py-2 min-h-[40px] rounded-lg text-xs font-bold text-white transition-colors cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                variant === 'danger'
                  ? 'bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-600'
                  : 'bg-[#0e4891] hover:bg-[#0a366f] focus-visible:ring-[#0e4891]'
              }`}
            >
              {loading ? 'Memproses...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
