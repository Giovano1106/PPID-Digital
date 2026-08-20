'use client'

import { useEffect } from 'react'

export type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  message: string
  type?: ToastType
  onClose: () => void
  duration?: number
}

export default function Toast({ message, type = 'success', onClose, duration = 3000 }: ToastProps) {
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
        return '❌'
      case 'info':
        return 'ℹ️'
      default:
        return '✅'
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-in">
      <div
        className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-xl text-xs font-bold leading-snug max-w-md ${getStyle()}`}
      >
        <span className="text-sm">{getIcon()}</span>
        <span className="flex-1 text-white">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 opacity-70 hover:opacity-100 text-slate-400 hover:text-white transition-opacity"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
