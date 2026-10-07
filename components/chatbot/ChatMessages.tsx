'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowSquareOut } from '@phosphor-icons/react'

export interface ChatMessage {
  id: string
  sender: 'bot' | 'user'
  text: string
  timestamp: Date
  actionLink?: {
    label: string
    href: string
  }
}

interface ChatMessagesProps {
  messages: ChatMessage[]
  isTyping?: boolean
  onActionClick?: () => void
}

/**
 * Format markdown sederhana (**bold**, newline, bullet) tanpa library berat luar.
 */
function renderFormattedText(text: string) {
  const lines = text.split('\n')

  return lines.map((line, lineIndex) => {
    // Parsing **bold**
    const parts = line.split(/(\*\*.*?\*\*)/g)

    const renderedLine = parts.map((part, partIndex) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={partIndex} className="font-bold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        )
      }
      return part
    })

    return (
      <span key={lineIndex} className="block leading-relaxed min-h-[1.2em]">
        {renderedLine}
      </span>
    )
  })
}

export default function ChatMessages({
  messages,
  isTyping = false,
  onActionClick,
}: ChatMessagesProps) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
      {messages.map((msg) => {
        const isBot = msg.sender === 'bot'

        return (
          <div
            key={msg.id}
            className={`flex items-end gap-2 ${
              isBot ? 'justify-start' : 'justify-end'
            }`}
          >
            {/* Bot Avatar Icon */}
            {isBot && (
              <div className="w-7 h-7 rounded-full bg-blue-100 border border-blue-200/80 p-0.5 shrink-0 mb-1 flex items-center justify-center">
                <Image
                  src="/mascot3.webp"
                  alt="Si Cika"
                  width={28}
                  height={28}
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            {/* Message Bubble Container */}
            <div
              className={`max-w-[82%] sm:max-w-[78%] flex flex-col ${
                isBot ? 'items-start' : 'items-end'
              }`}
            >
              <div
                className={`p-3.5 text-xs sm:text-[13px] leading-relaxed shadow-sm ${
                  isBot
                    ? 'bg-white text-slate-700 border border-slate-200/90 rounded-2xl rounded-bl-sm'
                    : 'bg-[#0e4891] text-white rounded-2xl rounded-br-sm'
                }`}
              >
                {renderFormattedText(msg.text)}

                {/* Optional Action Button Link */}
                {msg.actionLink && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100">
                    <Link
                      href={msg.actionLink.href}
                      onClick={onActionClick}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0e4891] bg-blue-50 hover:bg-blue-100/80 px-3 py-1.5 rounded-lg border border-blue-200/80 transition-colors"
                    >
                      <span>{msg.actionLink.label}</span>
                      <ArrowSquareOut size={13} weight="bold" />
                    </Link>
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <span className="text-[10px] text-slate-400 mt-1 px-1">
                {new Intl.DateTimeFormat('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                }).format(msg.timestamp)}
              </span>
            </div>
          </div>
        )
      })}

      {/* Typing Indicator */}
      {isTyping && (
        <div className="flex items-end gap-2 justify-start">
          <div className="w-7 h-7 rounded-full bg-blue-100 border border-blue-200/80 p-0.5 shrink-0 mb-1 flex items-center justify-center">
            <Image
              src="/mascot3.webp"
              alt="Si Cika sedang berpikir"
              width={28}
              height={28}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
          </div>
        </div>
      )}

      <div ref={endRef} />
    </div>
  )
}
