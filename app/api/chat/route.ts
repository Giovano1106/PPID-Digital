import { NextRequest, NextResponse } from 'next/server'
import { CIKASDA_CHATBOT_SYSTEM_PROMPT } from './systemPrompt'
import { searchKnowledgeBase } from '@/components/chatbot/knowledgeBase'

export const runtime = 'nodejs'

// In-memory rate limiting: maksimal 8 request per menit per IP
interface RateLimitRecord {
  count: number
  resetAt: number
}

const rateLimitMap = new Map<string, RateLimitRecord>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 menit
  const maxRequests = 8

  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (record.count >= maxRequests) {
    return false
  }

  record.count += 1
  return true
}

// Membersihkan rate limit map lama secara berkala
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, record] of rateLimitMap.entries()) {
      if (now > record.resetAt) {
        rateLimitMap.delete(key)
      }
    }
  }, 5 * 60 * 1000)
}

export async function POST(req: NextRequest) {
  try {
    // 1. Ambil client IP untuk rate limiting
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'anonymous-client'

    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        {
          error:
            'Terlalu banyak permintaan dalam waktu singkat. Mohon tunggu 1 menit sebelum mengirim pertanyaan lagi.',
        },
        { status: 429 }
      )
    }

    // 2. Baca body request
    const body = await req.json().catch(() => ({}))
    const rawMessage = typeof body.message === 'string' ? body.message.trim() : ''
    const rawHistory = Array.isArray(body.history) ? body.history : []

    if (!rawMessage) {
      return NextResponse.json(
        { error: 'Pesan pertanyaan tidak boleh kosong.' },
        { status: 400 }
      )
    }

    // Pembatasan konteks ketat (Context Window Control)
    // - Potong pesan input maksimal 400 karakter
    const userMessage = rawMessage.slice(0, 400)

    // - Ambil maksimal 3 riwayat percakapan terakhir
    const sanitizedHistory = rawHistory.slice(-3).map((item: any) => ({
      role: item.role === 'user' ? 'user' : 'model',
      parts: [
        {
          text: String(item.text || '').slice(0, 300),
        },
      ],
    }))

    const apiKey = process.env.GEMINI_API_KEY?.trim()

    // 3. Jika API Key belum diset, gunakan Smart FAQ / Fallback lokal
    if (!apiKey) {
      const match = searchKnowledgeBase(userMessage)

      let fallbackAnswer: string
      if (match) {
        fallbackAnswer = match.answer
      } else {
        fallbackAnswer =
          'Mohon maaf, saya belum menemukan jawaban spesifik untuk pertanyaan tersebut dalam ringkasan panduan.\n\nSilakan ajukan permohonan informasi resmi via sistem daring, atau hubungi tim PPID CIKASDA via WhatsApp di 0812-4217-0628 atau email cikasda.sulteng@gmail.com pada jam kerja (Senin s/d Jumat, 08.00 - 16.00 WITA).'
      }

      // Kirim jawaban secara bertahap via streaming simulasi agar konsisten
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        async start(controller) {
          const words = fallbackAnswer.split(' ')
          for (const word of words) {
            controller.enqueue(encoder.encode(word + ' '))
            await new Promise((r) => setTimeout(r, 20))
          }
          controller.close()
        },
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
        },
      })
    }

    // 4. Panggilan ke Google Gemini API dengan Streaming (gemini-1.5-flash)
    const geminiPayload = {
      system_instruction: {
        parts: [{ text: CIKASDA_CHATBOT_SYSTEM_PROMPT }],
      },
      contents: [
        ...sanitizedHistory,
        {
          role: 'user',
          parts: [{ text: userMessage }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 600,
        topP: 0.8,
      },
    }

    const selectedModel = process.env.GEMINI_MODEL?.trim() || 'gemini-3.5-flash-lite'
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:streamGenerateContent?alt=sse&key=${apiKey}`

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(geminiPayload),
    })

    if (!geminiRes.ok || !geminiRes.body) {
      // Fallback aman jika API error (misal quota limit 429 atau invalid key)
      const errorText = await geminiRes.text().catch(() => '')
      console.error(`[Chatbot Gemini Error (${geminiRes.status})]:`, errorText)

      // Fallback ke basis pengetahuan lokal tanpa menampilkan stack trace error ke user
      const match = searchKnowledgeBase(userMessage)
      let fallbackText = ''

      if (geminiRes.status === 429) {
        fallbackText = match
          ? `Layanan AI sedang menerima antrean pertanyaan yang padat. Berikut informasi ringkas dari panduan PPID CIKASDA:\n\n${match.answer}\n\nUntuk konfirmasi langsung, hubungi tim PPID via WhatsApp di 0812-4217-0628.`
          : 'Layanan AI sedang menerima antrean pertanyaan yang padat. Silakan tunggu sekitar 1 menit atau ajukan permohonan langsung melalui formulir permohonan informasi daring.'
      } else {
        fallbackText =
          match?.answer ||
          'Mohon maaf, layanan asisten sedang sibuk. Silakan ajukan permohonan informasi via menu formulir daring atau hubungi petugas PPID CIKASDA via WhatsApp di 0812-4217-0628.'
      }

      return new Response(fallbackText, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      })
    }

    // 5. Transform SSE stream dari Gemini menjadi Text Stream bersih untuk client
    const encoder = new TextEncoder()
    const reader = geminiRes.body.getReader()
    const decoder = new TextDecoder()

    const stream = new ReadableStream({
      async start(controller) {
        let buffer = ''

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              const trimmed = line.trim()
              if (!trimmed.startsWith('data:')) continue

              const jsonStr = trimmed.replace(/^data:\s*/, '').trim()
              if (!jsonStr || jsonStr === '[DONE]') continue

              try {
                const parsed = JSON.parse(jsonStr)
                const candidate = parsed.candidates?.[0]
                const parts = candidate?.content?.parts

                if (Array.isArray(parts)) {
                  for (const part of parts) {
                    // Hindari thought/reasoning internal dan ambil teks publik
                    if (part.text && !part.thought) {
                      // Filter em-dash dan emoji sebelum di-stream ke client
                      const sanitizedChunk = part.text
                        .replace(/—/g, ', ')
                        .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')

                      controller.enqueue(encoder.encode(sanitizedChunk))
                    }
                  }
                }
              } catch {
                // Ignore parse errors on fragmented SSE lines
              }
            }
          }
        } catch (streamError) {
          console.error('[Gemini Stream Error]:', streamError)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (err: any) {
    console.error('[POST /api/chat Error]:', err)
    return NextResponse.json(
      {
        error:
          'Terjadi kendala pada server asisten. Silakan coba kembali sesaat lagi.',
      },
      { status: 500 }
    )
  }
}
