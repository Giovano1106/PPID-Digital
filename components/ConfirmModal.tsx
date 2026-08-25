'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Warning, Question, X } from '@phosphor-icons/react'

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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in"
      onClick={() => {
        if (!loading) onClose()
      }}
    >
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden transform transition-all animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
            <span>{variant === 'danger' ? <Warning weight="fill" size={18} className="text-rose-400" /> : <Question weight="fill" size={18} className="text-blue-400" />}</span>
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X weight="bold" size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
            {message}
          </p>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all cursor-pointer disabled:opacity-50 ${
                variant === 'danger'
                  ? 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500/20'
                  : 'bg-[#0e4891] hover:bg-[#0a366f] focus:ring-[#0e4891]/20'
              } focus:outline-none focus:ring-4`}
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
