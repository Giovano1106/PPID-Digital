'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import WajibIsiDataDiriModal from './WajibIsiDataDiriModal'
import OpsiPasswordModal from './OpsiPasswordModal'
import Toast, { ToastType } from '@/components/Toast'

interface AuthModalsWrapperProps {
  user: {
    id: string
    email?: string
    user_metadata?: {
      full_name?: string
      name?: string
    }
    app_metadata?: {
      provider?: string
      providers?: string[]
    }
  }
  profile: {
    nama?: string
    nik?: string | null
    telepon?: string | null
    email?: string | null
  } | null
}

export default function AuthModalsWrapper({
  user,
  profile,
}: AuthModalsWrapperProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Cek apakah profil pengguna belum lengkap (Nama, NIK, atau Telepon belum diisi atau hanya spasi)
  const isProfileIncomplete =
    !profile?.nama?.trim() || !profile?.nik?.trim() || !profile?.telepon?.trim()
  const isGoogleAuthParam = searchParams.get('oauth') === 'google'

  const [showWajib, setShowWajib] = useState(isProfileIncomplete)
  const [showPassword, setShowPassword] = useState(!isProfileIncomplete && isGoogleAuthParam)
  const [passwordMode, setPasswordMode] = useState<'first_time' | 'google_login'>(
    !isProfileIncomplete && isGoogleAuthParam ? 'google_login' : 'first_time'
  )
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  const handleWajibSuccess = () => {
    setShowWajib(false)
    setToast({
      message: 'Data identitas berhasil disimpan! Silakan atur kata sandi akun.',
      type: 'success',
    })
    // Sinkronisasi data profil terbaru ke Server Components
    router.refresh()
    // Langsung buka modal opsi password dalam mode first_time
    setPasswordMode('first_time')
    setShowPassword(true)
  }

  const handleClosePassword = () => {
    setShowPassword(false)
    // Bersihkan parameter ?oauth=google dari URL tanpa me-reload halaman
    if (typeof window !== 'undefined' && window.location.search.includes('oauth=')) {
      const url = new URL(window.location.href)
      url.searchParams.delete('oauth')
      window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''))
    }
  }

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Modal Wajib Isi Data Diri (Non-Dismissable) */}
      <WajibIsiDataDiriModal
        isOpen={showWajib}
        defaultNama={profile?.nama || user.user_metadata?.full_name || user.user_metadata?.name || ''}
        defaultEmail={user.email || profile?.email || ''}
        onSuccess={handleWajibSuccess}
      />

      {/* Modal Opsi Buat / Ganti Password (Dismissable) */}
      <OpsiPasswordModal
        isOpen={showPassword}
        mode={passwordMode}
        onClose={handleClosePassword}
        onSuccessToast={(msg) => setToast({ message: msg, type: 'success' })}
      />
    </>
  )
}
