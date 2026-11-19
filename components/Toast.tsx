'use client'

import { useEffect } from 'react'
import { XCircle, Info, CheckCircle, X } from '@phosphor-icons/react'

export type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  message: string
  type?: ToastType
  onClose: () => void
  duration?: number
}

export default function Toast({ message, type = 'success', onClose, duration = 3500 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const getStyle = () => {
    switch (type) {
      case 'error':
        return 'bg-slate-900 text-rose-400 border-slate-800'
      case 'info':
        return 'bg-slate-900 text-blue-400 border-slate-800'
      default:
        return 'bg-slate-900 text-emerald-400 border-slate-800'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <XCircle weight="fill" size={18} />
      case 'info':
        return <Info weight="fill" size={18} />
      default:
        return <CheckCircle weight="fill" size={18} />
    }
  }

  return (
    <div
      className="fixed bottom-6 right-6 z-50 animate-fade-in"
      role="status"
      aria-live="polite"
    >
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg text-xs font-bold leading-snug max-w-md ${getStyle()}`}
      >
        <span className="flex items-center justify-center shrink-0" aria-hidden="true">
          {getIcon()}
        </span>
        <span className="flex-1 text-white">{message}</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup notifikasi"
          className="ml-1 p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <X weight="bold" size={14} />
        </button>
      </div>
    </div>
  )
}
