import { redirect } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/server'
import AdminSidebar from '@/components/AdminSidebar'
import AdminBreadcrumb from '@/components/AdminBreadcrumb'

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
      <a
        href="#admin-main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:rounded-lg focus:bg-[#0e4891] focus:px-4 focus:py-2.5 focus:text-xs focus:font-bold focus:text-white focus:shadow-lg"
      >
        Lewati ke konten utama
      </a>

      {/* RESPONSIVE SIDEBAR COMPONENT */}
      <AdminSidebar adminName={profile.nama || user.email || 'Admin'} />

      {/* CONTENT AREA */}
      <main
        id="admin-main-content"
        tabIndex={-1}
        className="flex-1 min-w-0 p-4 sm:p-6 lg:p-10 overflow-y-auto focus:outline-none"
      >
        <div className="max-w-6xl mx-auto">
          <AdminBreadcrumb />
          {children}
        </div>
      </main>
    </div>
  )
}
