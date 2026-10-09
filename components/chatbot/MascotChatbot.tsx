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

const SESSION_STORAGE_KEY = 'ppid_cikasda_chat_session_v1'

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

  // 1. Muat riwayat percakapan dari sessionStorage saat pertama kali load di klien
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(
            parsed.map((m: any) => ({
              ...m,
              timestamp: new Date(m.timestamp),
              isStreaming: false,
            }))
          )
        }
      }
    } catch {
      // Abaikan jika storage disabled/private mode
    }
  }, [])

  // 2. Simpan riwayat ke sessionStorage saat pesan bertambah
  useEffect(() => {
    try {
      // Hanya simpan jika bukan sedang streaming
      const hasStreaming = messages.some((m) => m.isStreaming)
      if (!hasStreaming && messages.length > 0) {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(messages))
      }
    } catch {
      // Storage error ignored
    }
  }, [messages])

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
    const initial = [
      {
        ...WELCOME_MESSAGE,
        timestamp: new Date(),
      },
    ]
    setMessages(initial)
    setIsTyping(false)
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY)
    } catch {
      // Ignore
    }
  }

  // Pengiriman pesan dengan arsitektur Hybrid (Tier 1 Quick FAQ + Tier 2 AI Streaming)
  const handleSendMessage = async (userText: string, isFromQuickChip = false) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date(),
    }

    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setIsTyping(true)

    // TIER 1: Jika berasal dari tombol Quick Chip, jawab instan tanpa memanggil API
    if (isFromQuickChip) {
      setTimeout(() => {
        const match = searchKnowledgeBase(userText)
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text:
            match?.answer ||
            'Silakan ajukan permohonan informasi via menu daring atau hubungi kami di WhatsApp 0812-4217-0628.',
          timestamp: new Date(),
          actionLink: match?.actionLink,
        }
        setMessages((prev) => [...prev, botMsg])
        setIsTyping(false)
      }, 350)
      return
    }

    // TIER 2: Pertanyaan bebas pengguna dikirim ke Route Handler /api/chat
    try {
      // Format riwayat percakapan untuk konteks LLM
      const history = nextMessages
        .filter((m) => m.id !== 'welcome')
        .slice(-4)
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          text: m.text,
        }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userText,
          history,
        }),
      })

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(
            'Terlalu banyak pertanyaan dalam waktu singkat. Mohon tunggu 1 menit sebelum bertanya lagi.'
          )
        }
        throw new Error('Gagal menghubungi asisten.')
      }

      if (!response.body) {
        throw new Error('Respons tidak memiliki body stream.')
      }

      // Siapkan bot message untuk streaming
      setIsTyping(false)
      const botMsgId = `bot-${Date.now()}`

      // Deteksi aksi pintasan jika pertanyaan menyebut permohonan
      let detectedActionLink: { label: string; href: string } | undefined
      const lowerQuery = userText.toLowerCase()
      if (
        lowerQuery.includes('ajukan') ||
        lowerQuery.includes('permohonan') ||
        lowerQuery.includes('formulir')
      ) {
        detectedActionLink = {
          label: 'Ajukan Permohonan Daring',
          href: '/permohonan-saya/ajukan',
        }
      } else if (
        lowerQuery.includes('kategori') ||
        lowerQuery.includes('dokumen') ||
        lowerQuery.includes('daftar informasi')
      ) {
        detectedActionLink = {
          label: 'Telusuri Kategori Informasi',
          href: '#kategori',
        }
      }

      // Inisialisasi bubble bot kosong dengan flag isStreaming
      setMessages((prev) => [
        ...prev,
        {
          id: botMsgId,
          sender: 'bot',
          text: '',
          timestamp: new Date(),
          isStreaming: true,
          actionLink: detectedActionLink,
        },
      ])

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulatedText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        accumulatedText += chunk

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMsgId
              ? {
                  ...msg,
                  text: accumulatedText,
                }
              : msg
          )
        )
      }

      // Selesai streaming
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMsgId
            ? {
                ...msg,
                isStreaming: false,
              }
            : msg
        )
      )
    } catch (err: any) {
      setIsTyping(false)
      const fallbackText =
        err?.message && err.message.includes('Terlalu banyak')
          ? err.message
          : 'Mohon maaf, saat ini koneksi ke asisten sedang mengalami kendala jaringan.\n\nAnda dapat menanyakan langsung kepada petugas PPID CIKASDA via WhatsApp di 0812-4217-0628 atau email cikasda.sulteng@gmail.com pada jam kerja (Senin s/d Jumat, 08.00 - 16.00 WITA).'

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-fallback-${Date.now()}`,
          sender: 'bot',
          text: fallbackText,
          timestamp: new Date(),
          actionLink: {
            label: 'Ajukan Permohonan Daring',
            href: '/permohonan-saya/ajukan',
          },
        },
      ])
    }
  }

  const handleSelectChip = (chip: QuickChip) => {
    handleSendMessage(chip.query, true)
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
          <ChatInput onSend={(t) => handleSendMessage(t, false)} disabled={isTyping} />
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
