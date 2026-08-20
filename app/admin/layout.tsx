import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/server'
import AdminNav from '@/components/AdminNav'

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
    <div className="min-h-screen bg-slate-50 font-plus-jakarta text-slate-900 flex flex-col md:flex-row antialiased selection:bg-[#0e4891] selection:text-white">
      {/* SIDEBAR ADMIN */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-6 flex flex-col justify-between shrink-0 shadow-sm">
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
                {profile.nama || user.email}
              </span>
            </div>
          </div>

          {/* ACTIVE NAV LINK COMPONENT */}
          <AdminNav />
        </div>

        <div className="pt-6 border-t border-slate-100">
          <Link
            href="/"
            className="text-xs font-bold text-slate-500 hover:text-[#0e4891] transition-colors flex items-center gap-2"
          >
            ← Kembali ke Web Depan
          </Link>
        </div>
      </aside>

      {/* CONTENT AREA */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}