'use client'

import { useState } from 'react'
import Link from 'next/link'
import { List, X, ArrowLeft } from '@phosphor-icons/react'
import AdminNav from '@/components/AdminNav'
import AdminLogoutButton from '@/components/AdminLogoutButton'

interface AdminSidebarProps {
  adminName: string
}

export default function AdminSidebar({ adminName }: AdminSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* MOBILE TOP BAR WITH HAMBURGER */}
      <div className="md:hidden bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-[#0e4891] flex items-center justify-center font-bold text-white text-base shadow-sm">
            P
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-slate-900 block leading-tight">
              Admin Console
            </span>
            <span className="text-[11px] text-slate-500 font-medium block truncate max-w-[150px]">
              {adminName}
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 focus:outline-none transition-colors"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X weight="bold" size={20} /> : <List weight="bold" size={20} />}
        </button>
      </div>

      {/* MOBILE BACKDROP OVERLAY */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR ASIDE */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 p-6 flex flex-col justify-between shrink-0 shadow-sm transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
            <div className="h-10 w-10 rounded-xl bg-[#0e4891] flex items-center justify-center font-bold text-white text-lg shadow-sm">
              P
            </div>
            <div className="overflow-hidden">
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

        <div className="pt-6 border-t border-slate-100 space-y-3">
          <AdminLogoutButton />

          <Link
            href="/"
            className="text-xs font-bold text-slate-500 hover:text-[#0e4891] transition-colors flex items-center justify-center gap-2 pt-2"
          >
            <ArrowLeft weight="bold" size={14} /> Kembali ke Web Depan
          </Link>
        </div>
      </aside>
    </>
  )
}
