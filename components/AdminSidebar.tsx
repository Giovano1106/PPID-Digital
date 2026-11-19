'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { List, X, ArrowLeft } from '@phosphor-icons/react'
import AdminNav from '@/components/AdminNav'
import AdminLogoutButton from '@/components/AdminLogoutButton'

interface AdminSidebarProps {
  adminName: string
}

export default function AdminSidebar({ adminName }: AdminSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  return (
    <>
      {/* MOBILE TOP BAR WITH LABELED HAMBURGER */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 sticky top-0 z-40">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <Image src="/logo-sulteng.png" alt="Logo Sulteng" width={26} height={35} className="h-8 w-auto object-contain" />
            <Image src="/logo-cikasda.png" alt="Logo CIKASDA" width={74} height={28} className="h-7 w-auto object-contain" />
          </div>
          <div className="min-w-0">
            <span className="font-extrabold text-sm tracking-tight text-slate-900 block leading-tight">
              Admin Console
            </span>
            <span className="text-xs text-slate-500 font-medium block truncate max-w-[160px]">
              {adminName}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls="admin-sidebar-drawer"
          aria-label={isOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
          className="inline-flex items-center gap-2 px-3 py-2 min-h-[44px] rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e4891] focus-visible:ring-offset-2"
        >
          {isOpen ? (
            <>
              <X weight="bold" size={18} aria-hidden="true" />
              <span>Tutup</span>
            </>
          ) : (
            <>
              <List weight="bold" size={18} aria-hidden="true" />
              <span>Menu</span>
            </>
          )}
        </button>
      </div>

      {/* MOBILE BACKDROP OVERLAY */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-slate-900/45 backdrop-blur-xs animate-fade-in"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* SIDEBAR ASIDE */}
      <aside
        id="admin-sidebar-drawer"
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 p-6 flex flex-col justify-between shrink-0 transition-transform duration-200 ease-in-out md:translate-x-0 md:shadow-none ${
          isOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="flex items-center gap-2.5 mb-7 pb-5 border-b border-slate-200">
            <div className="flex items-center gap-1.5 shrink-0">
              <Image src="/logo-sulteng.png" alt="Logo Sulteng" width={24} height={32} className="h-8 w-auto object-contain" />
              <Image src="/logo-cikasda.png" alt="Logo CIKASDA" width={58} height={22} className="h-[22px] w-auto object-contain" />
            </div>
            <div className="overflow-hidden min-w-0">
              <span className="font-extrabold text-sm tracking-tight text-slate-900 block leading-tight truncate">
                Admin Console
              </span>
              <span className="text-xs text-slate-500 font-medium block truncate max-w-[140px] mt-0.5">
                {adminName}
              </span>
            </div>
          </div>

          {/* ACTIVE NAV LINK COMPONENT */}
          <div onClick={() => setIsOpen(false)}>
            <AdminNav />
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 space-y-2.5">
          <AdminLogoutButton />

          <Link
            href="/"
            className="text-xs font-bold text-slate-600 hover:text-[#0e4891] transition-colors flex items-center justify-center gap-2 min-h-[40px] rounded-lg hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e4891] focus-visible:ring-offset-2"
          >
            <ArrowLeft weight="bold" size={14} aria-hidden="true" /> Kembali ke Web Depan
          </Link>
        </div>
      </aside>
    </>
  )
}
