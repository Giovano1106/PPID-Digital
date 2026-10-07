'use client'

import Image from 'next/image'
import { X, ArrowCounterClockwise } from '@phosphor-icons/react'

interface ChatHeaderProps {
  onClose: () => void
  onReset: () => void
}

export default function ChatHeader({ onClose, onReset }: ChatHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-[#0e4891] to-[#1a5cb8] text-white p-4 rounded-t-2xl flex items-center justify-between shadow-sm select-none">
      <div className="flex items-center gap-3">
        {/* Avatar Mascot 3 with Headset */}
        <div className="relative w-11 h-11 rounded-full bg-white/15 p-1 border border-white/20 shadow-inner shrink-0 flex items-center justify-center">
          <Image
            src="/mascot3.webp"
            alt="Si Cika Asisten Digital"
            width={44}
            height={44}
            className="w-full h-full object-contain drop-shadow"
          />
          {/* Status Indicator */}
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#0e4891] rounded-full" />
        </div>

        {/* Brand Information */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-sm tracking-tight leading-tight">
              Si Cika
            </h3>
            <span className="text-[10px] bg-white/20 text-blue-100 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
              Asisten PPID
            </span>
          </div>
          <p className="text-[11px] text-blue-100/90 font-medium leading-tight mt-0.5">
            Dinas CIKASDA Prov. Sulteng
          </p>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onReset}
          title="Mulai percakapan baru"
          className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Reset Percakapan"
        >
          <ArrowCounterClockwise size={18} weight="bold" />
        </button>
        <button
          type="button"
          onClick={onClose}
          title="Tutup chat"
          className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Tutup Obrolan"
        >
          <X size={20} weight="bold" />
        </button>
      </div>
    </div>
  )
}
