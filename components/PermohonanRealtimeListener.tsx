'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/client'
import Toast, { ToastType } from '@/components/Toast'

interface PermohonanRealtimeListenerProps {
  userId: string
  permohonanId?: number
}

export default function PermohonanRealtimeListener({
  userId,
  permohonanId,
}: PermohonanRealtimeListenerProps) {
  const router = useRouter()
  const supabase = createClient()
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  useEffect(() => {
    // 1. Setup Supabase Realtime WebSocket subscription
    const channelName = permohonanId
      ? `realtime-detail-${permohonanId}`
      : `realtime-user-${userId}`

    const filterCondition = permohonanId
      ? `id=eq.${permohonanId}`
      : `user_id=eq.${userId}`

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'permohonan',
          filter: filterCondition,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const updated = payload.new as { status?: string; diperpanjang?: boolean }
            const statusText = updated.status ? updated.status.toUpperCase() : 'DIPERBARUI'
            if (updated.diperpanjang) {
              setToast({
                message: `Status SLA diperpanjang +7 Hari Kerja. Status: ${statusText}`,
                type: 'info',
              })
            } else {
              setToast({
                message: `Status permohonan telah diperbarui: ${statusText}`,
                type: 'info',
              })
            }
          } else if (payload.eventType === 'INSERT') {
            setToast({
              message: 'Permohonan informasi publik berhasil ditambahkan.',
              type: 'success',
            })
          }
          router.refresh()
        }
      )
      .subscribe()

    // 2. Auto-refresh saat jendela browser difokuskan kembali (tab switching)
    const handleFocus = () => {
      router.refresh()
    }
    window.addEventListener('focus', handleFocus)

    // 3. Fallback interval berkala yang senyap (setiap 30 detik)
    const interval = setInterval(() => {
      router.refresh()
    }, 30000)

    return () => {
      supabase.removeChannel(channel)
      window.removeEventListener('focus', handleFocus)
      clearInterval(interval)
    }
  }, [userId, permohonanId, router, supabase])

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  )
}
