'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ClipboardText, FolderOpen, Table, EnvelopeSimple, Star } from '@phosphor-icons/react'

export default function AdminNav() {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/admin',
      label: 'Kelola Permohonan',
      icon: ClipboardText,
      exact: true,
    },
    {
      href: '/admin/survei',
      label: 'Survei Kepuasan (IKM)',
      icon: Star,
      exact: false,
    },
    {
      href: '/admin/konten',
      label: 'Kelola CMS & Dokumen',
      icon: FolderOpen,
      exact: false,
    },
    {
      href: '/admin/daftar-informasi',
      label: 'Daftar Informasi Publik',
      icon: Table,
      exact: false,
    },
    {
      href: '/admin/email-templates',
      label: 'Template Email',
      icon: EnvelopeSimple,
      exact: false,
    },
  ]

  return (
    <nav aria-label="Navigasi Admin Console" className="space-y-1">
      {navItems.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href)
        const IconComponent = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={`flex items-center gap-3 rounded-lg border-l-[3px] px-3.5 py-2.5 min-h-[44px] text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e4891] focus-visible:ring-offset-2 ${
              isActive
                ? 'border-l-[#0e4891] bg-blue-50/80 text-[#0e4891] font-bold'
                : 'border-l-transparent text-slate-700 font-semibold hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <IconComponent
              weight={isActive ? 'fill' : 'regular'}
              size={18}
              className="shrink-0"
              aria-hidden="true"
            />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
