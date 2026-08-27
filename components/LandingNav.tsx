'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/app/lib/supabase/client'
import ConfirmModal from '@/components/ConfirmModal'
import Toast, { ToastType } from '@/components/Toast'
import { List, X } from '@phosphor-icons/react'

export default function LandingNav() {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)

      if (currentUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', currentUser.id)
          .single()

        if (profile?.role === 'admin') {
          setIsAdmin(true)
        }
      }
    }
    fetchUser()
  }, [])

  const handleLogoutClick = () => {
    setShowLogoutModal(true)
  }

  const confirmLogout = async () => {
    setLoggingOut(true)
    await supabase.auth.signOut()
    setUser(null)
    setIsAdmin(false)
    setShowLogoutModal(false)
    setLoggingOut(false)
    setToast({ message: 'Anda berhasil keluar dari akun.', type: 'info' })
    setTimeout(() => {
      window.location.reload()
    }, 1200)
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
      
      <ConfirmModal
        isOpen={showLogoutModal}
        title="Keluar dari Akun?"
        message="Sesi Anda akan diakhiri dan Anda harus masuk kembali untuk mengakses layanan."
        confirmText="Ya, Keluar"
        cancelText="Batal"
        onConfirm={confirmLogout}
        onClose={() => setShowLogoutModal(false)}
        loading={loggingOut}
        variant="danger"
      />

      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3.5">
            <div className="flex items-center gap-1.5">
              <Image src="/logo-sulteng.webp" alt="Logo Sulteng" width={40} height={40} className="w-9 h-9 object-contain" />
              <Image src="/logo-cikasda.webp" alt="Logo CIKASDA" width={40} height={40} className="w-9 h-9 object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-slate-900 leading-none">
                PPID DIGITAL
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                Dinas CIKASDA Prov. Sulteng
              </span>
            </div>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-5 text-sm font-semibold">
            {user ? (
              <>
                {isAdmin ? (
                  <>
                    <Link
                      href="/admin"
                      className="bg-[#0e4891] hover:bg-[#0a366f] text-white font-bold px-5 py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md"
                    >
                      Admin Console
                    </Link>
                    <button
                      onClick={handleLogoutClick}
                      className="text-rose-600 hover:text-rose-700 px-2 py-2 rounded-lg text-sm font-bold transition-all"
                    >
                      Keluar
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/permohonan-saya"
                      className="text-slate-600 hover:text-[#0e4891] transition-colors font-bold"
                    >
                      Riwayat Permohonan
                    </Link>
                    <Link
                      href="/permohonan-saya/ajukan"
                      className="bg-[#0e4891] hover:bg-[#0a366f] text-white font-bold px-5 py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md"
                    >
                      Ajukan Permohonan
                    </Link>
                    <div className="w-px h-6 bg-slate-200 mx-1"></div>
                    <button
                      onClick={handleLogoutClick}
                      className="text-rose-600 hover:text-rose-700 px-2 py-1.5 rounded-lg text-sm font-bold transition-all"
                    >
                      Keluar
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-slate-600 hover:text-[#0e4891] transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/daftar"
                  className="bg-[#0e4891] hover:bg-[#0a366f] text-white font-bold px-5 py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md"
                >
                  Ajukan Permohonan
                </Link>
              </>
            )}
          </nav>

          {/* MOBILE MENU BUTTON */}
          <button
            className="md:hidden flex items-center justify-center p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X weight="bold" size={24} /> : <List weight="bold" size={24} />}
          </button>
        </div>

        {/* MOBILE MENU DROPDOWN */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-200 shadow-xl py-4 px-6 flex flex-col gap-4 animate-fade-in">
            {user ? (
              <>
                {isAdmin ? (
                  <>
                    <Link
                      href="/admin"
                      className="text-slate-700 hover:text-[#0e4891] transition-colors font-bold py-2 border-b border-slate-100"
                    >
                      Admin Console
                    </Link>
                    <button
                      onClick={handleLogoutClick}
                      className="w-full text-center bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-4 py-3 rounded-xl text-sm font-bold transition-all shadow-sm"
                    >
                      Keluar
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/permohonan-saya/ajukan"
                      className="w-full text-center bg-[#0e4891] hover:bg-[#0a366f] text-white font-bold px-4 py-3 rounded-xl transition-all shadow-sm"
                    >
                      Ajukan Permohonan
                    </Link>
                    <Link
                      href="/permohonan-saya"
                      className="text-slate-600 hover:text-[#0e4891] transition-colors font-bold py-2 border-b border-slate-100 text-center"
                    >
                      Riwayat Permohonan
                    </Link>
                    <button
                      onClick={handleLogoutClick}
                      className="w-full text-center text-rose-600 hover:bg-rose-50 px-4 py-3 rounded-xl text-sm font-bold transition-all mt-1"
                    >
                      Keluar
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-slate-600 hover:text-[#0e4891] transition-colors font-bold py-2 border-b border-slate-100 text-center"
                >
                  Masuk Akun
                </Link>
                <Link
                  href="/daftar"
                  className="w-full text-center bg-[#0e4891] hover:bg-[#0a366f] text-white font-bold px-4 py-3 rounded-xl transition-all shadow-sm"
                >
                  Ajukan Permohonan Baru
                </Link>
              </>
            )}
          </div>
        )}
      </header>
    </>
  )
}
