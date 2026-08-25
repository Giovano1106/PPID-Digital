'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SignOut } from '@phosphor-icons/react'
import { createClient } from '@/app/lib/supabase/client'
import ConfirmModal from '@/components/ConfirmModal'
import Toast, { ToastType } from '@/components/Toast'

export default function AdminLogoutButton() {
  const router = useRouter()
  const supabase = createClient()
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  const handleLogout = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    setShowModal(false)
    setLoading(false)
    setToast({ message: 'Berhasil keluar dari Admin Console.', type: 'info' })
    setTimeout(() => {
      router.push('/login')
      router.refresh()
    }, 1000)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="w-full flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition-all shadow-2xs cursor-pointer"
      >
        <SignOut weight="bold" size={16} /> Keluar Akun
      </button>

      <ConfirmModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleLogout}
        title="Konfirmasi Keluar Admin"
        message="Apakah Anda yakin ingin keluar dari Admin Console?"
        confirmText="Ya, Keluar"
        cancelText="Batal"
        variant="danger"
        loading={loading}
      />

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
