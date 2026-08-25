'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ClipboardText, FolderOpen } from '@phosphor-icons/react'

export default function AdminNav() {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/admin',
      label: 'Kelola Permohonan',
      exact: true,
    },
    {
      href: '/admin/konten',
      label: 'Kelola CMS & Dokumen',
      exact: false,
    },
  ]

  return (
    <nav className="space-y-1.5">
      {navItems.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold transition-all ${
              isActive
                ? 'bg-[#0e4891] text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100 hover:text-[#0e4891]'
            }`}
          >
            {item.href === '/admin' ? <ClipboardText weight="fill" size={18} /> : <FolderOpen weight="fill" size={18} />}
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
