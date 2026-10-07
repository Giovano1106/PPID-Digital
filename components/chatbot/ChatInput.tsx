'use client'

import { useState, useRef, useEffect } from 'react'
import { PaperPlaneTilt } from '@phosphor-icons/react'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export default function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Ketik pertanyaan seputar PPID CIKASDA...',
}: ChatInputProps) {
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus()
    }
  }, [disabled])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setText('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3 bg-white border-t border-slate-200 rounded-b-2xl flex items-center gap-2"
    >
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0e4891]/25 focus:border-[#0e4891] transition-colors disabled:opacity-60"
        aria-label="Ketik pertanyaan untuk Si Cika"
      />
      <button
        type="submit"
        disabled={!text.trim() || disabled}
        aria-label="Kirim pertanyaan"
        className="w-11 h-11 shrink-0 flex items-center justify-center bg-[#0e4891] hover:bg-[#0b3870] active:scale-95 text-white rounded-xl shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e4891]"
      >
        <PaperPlaneTilt size={18} weight="fill" />
      </button>
    </form>
  )
}
