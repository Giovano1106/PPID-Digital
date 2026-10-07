'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import ChatHeader from './ChatHeader'
import ChatMessages, { ChatMessage } from './ChatMessages'
import QuickChips from './QuickChips'
import ChatInput from './ChatInput'
import {
  WELCOME_MESSAGE,
  searchKnowledgeBase,
  QuickChip,
} from './knowledgeBase'

gsap.registerPlugin(useGSAP)

interface MascotChatbotProps {
  /** Path ke gambar maskot untuk floating trigger di pojok kanan bawah */
  triggerImageSrc?: string
}

export default function MascotChatbot({
  triggerImageSrc = '/mascot1.webp',
}: MascotChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      ...WELCOME_MESSAGE,
      timestamp: new Date(),
    },
  ])
  const [isTyping, setIsTyping] = useState(false)

  const floatingRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const windowRef = useRef<HTMLDivElement>(null)

  // Floating idle animation untuk maskot trigger
  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Entrance slide-up saat awal load
        gsap.from(floatingRef.current, {
          y: 50,
          autoAlpha: 0,
          duration: 0.8,
          ease: 'back.out(1.4)',
          delay: 1.0,
        })

        // Floating loop idle
        gsap.to(floatingRef.current, {
          y: -6,
          duration: 2.2,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: 1.8,
        })
      })
    },
    { scope: floatingRef }
  )

  // Tampilkan balon sapaan singkat setelah 2.5 detik
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) {
        setShowTooltip(true)
      }
    }, 2500)

    return () => clearTimeout(timer)
  }, [isOpen])

  // GSAP animation saat jendela chat dibuka / ditutup
  useGSAP(
    () => {
      if (isOpen && windowRef.current) {
        gsap.fromTo(
          windowRef.current,
          { scale: 0.9, autoAlpha: 0, y: 16 },
          {
            scale: 1,
            autoAlpha: 1,
            y: 0,
            duration: 0.35,
            ease: 'power2.out',
          }
        )
      }
    },
    { dependencies: [isOpen] }
  )

  // Keyboard shortcut: Escape untuk menutup chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const handleToggle = () => {
    setIsOpen((prev) => !prev)
    setShowTooltip(false)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleReset = () => {
    setMessages([
      {
        ...WELCOME_MESSAGE,
        timestamp: new Date(),
      },
    ])
    setIsTyping(false)
  }

  const handleSendMessage = (userText: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setIsTyping(true)

    // Simulasi respons penelusuran FAQ pengetahuan PPID CIKASDA
    setTimeout(() => {
      const match = searchKnowledgeBase(userText)

      let botText: string
      let actionLink: { label: string; href: string } | undefined

      if (match) {
        botText = match.answer
        actionLink = match.actionLink
      } else {
        botText =
          'Mohon maaf, saya belum menemukan jawaban pasti untuk pertanyaan tersebut dalam panduan baku PPID.\n\nAnda dapat:\n1. Mengajukan permohonan informasi resmi via sistem daring.\n2. Menghubungi tim PPID CIKASDA via WhatsApp di **0812-4217-0628** atau email **cikasda.sulteng@gmail.com** pada jam kerja (Senin s/d Jumat, 08.00 - 16.00 WITA).'
        actionLink = {
          label: 'Ajukan Permohonan Daring',
          href: '/permohonan-saya/ajukan',
        }
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botText,
        timestamp: new Date(),
        actionLink,
      }

      setMessages((prev) => [...prev, botMsg])
      setIsTyping(false)
    }, 450)
  }

  const handleSelectChip = (chip: QuickChip) => {
    handleSendMessage(chip.query)
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* ── Jendela Chat Popover ── */}
      {isOpen && (
        <div
          ref={windowRef}
          role="dialog"
          aria-label="Jendela Chat Asisten PPID CIKASDA"
          className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 w-[calc(100vw-2.5rem)] sm:w-[380px] h-[520px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden z-50"
        >
          {/* Header */}
          <ChatHeader onClose={handleClose} onReset={handleReset} />

          {/* Area Pesan */}
          <ChatMessages
            messages={messages}
            isTyping={isTyping}
            onActionClick={handleClose}
          />

          {/* Tombol Topik Populer */}
          <QuickChips onSelect={handleSelectChip} disabled={isTyping} />

          {/* Input Teks */}
          <ChatInput onSend={handleSendMessage} disabled={isTyping} />
        </div>
      )}

      {/* ── Floating Maskot Trigger (Saat Chat Tertutup) ── */}
      {!isOpen && (
        <div className="flex flex-col items-end gap-2">
          {/* Balon Sapaan Tooltip */}
          {showTooltip && (
            <div
              ref={tooltipRef}
              onClick={handleToggle}
              className="max-w-[210px] rounded-2xl rounded-br-sm bg-white px-3.5 py-2.5 text-xs font-semibold leading-snug text-slate-700 shadow-xl border border-slate-200/90 cursor-pointer select-none transition-transform hover:scale-102"
            >
              Halo! Ada yang bisa Si Cika bantu? Klik di sini untuk bertanya.
            </div>
          )}

          {/* Maskot Trigger Melambai */}
          <div
            ref={floatingRef}
            onClick={handleToggle}
            role="button"
            tabIndex={0}
            aria-label="Buka Asisten Digital PPID Si Cika"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') handleToggle()
            }}
            className="relative w-[76px] h-[76px] sm:w-[88px] sm:h-[88px] cursor-pointer select-none drop-shadow-xl hover:scale-105 active:scale-95 transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e4891] rounded-full"
          >
            <Image
              src={triggerImageSrc}
              alt="Maskot PPID Si Cika"
              fill
              className="object-contain"
              sizes="88px"
              priority={false}
            />

            {/* Pulsing Attention Badge */}
            <span className="absolute top-1 right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#0e4891] border-2 border-white" />
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
