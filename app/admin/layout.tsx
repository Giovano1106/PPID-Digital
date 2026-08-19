import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/server'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Proteksi Role: Hanya user dengan role 'admin' yang dapat mengakses
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, nama')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* SIDEBAR ADMIN */}
      <aside className="w-full md:w-64 bg-slate-900 text-white p-6 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-8 w-8 rounded-lg bg-[#0e4891] flex items-center justify-center font-bold text-amber-400">
              P
            </div>
            <div>
              <span className="font-extrabold text-base block">Admin PPID</span>
              <span className="text-[11px] text-slate-400 block truncate">{profile.nama || user.email}</span>
            </div>
          </div>

          <nav className="space-y-2">
            <Link
              href="/admin"
              className="block rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 transition"
            >
              📋 Kelola Permohonan
            </Link>
            <Link
              href="/admin/konten"
              className="block rounded-lg px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              🖼️ Kelola Landing Page
            </Link>
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800">
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-white transition block mb-2"
          >
            ← Halaman Depan Web
          </Link>
        </div>
      </aside>

      {/* CONTENT AREA */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}