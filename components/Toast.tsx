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
        return <XCircle weight="fill" size={18} />
      case 'info':
        return <Info weight="fill" size={18} />
      default:
        return <CheckCircle weight="fill" size={18} />
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-in">
      <div
        className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-xl text-xs font-bold leading-snug max-w-md ${getStyle()}`}
      >
        <span className="flex items-center justify-center">{getIcon()}</span>
        <span className="flex-1 text-white">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 opacity-70 hover:opacity-100 text-slate-400 hover:text-white transition-opacity flex items-center justify-center cursor-pointer"
        >
          <X weight="bold" size={14} />
        </button>
      </div>
    </div>
  )
}
