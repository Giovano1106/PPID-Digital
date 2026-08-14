import Link from 'next/link'
import { createClient } from '@/app/lib/supabase/server'

type KontenLanding = {
  section_key: string
  judul: string
  isi_teks: string | null
  link_drive: string | null
}

const kategori = [
  'berkala',
  'serta_merta',
  'setiap_saat',
  'dikecualikan',
]

export default async function HomePage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('konten_landing')
    .select('section_key, judul, isi_teks, link_drive')
    .order('section_key')

  const konten: Record<string, KontenLanding> = {}

  data?.forEach((item) => {
    konten[item.section_key] = item
  })

  return (
    <main className="min-h-screen bg-white text-gray-900">

      {/* HEADER */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <div>
            <h1 className="text-xl font-bold">
              PPID DIGITAL
            </h1>

            <p className="text-sm text-gray-500">
              Portal Layanan Informasi Publik
            </p>
          </div>

          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium hover:text-blue-600"
            >
              Login
            </Link>

            <Link
              href="/daftar"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
            >
              Daftar
            </Link>
          </nav>

        </div>
      </header>

      {/* HERO */}
      <section className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-20">

          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Portal Informasi Publik
          </p>

          <h2 className="mt-4 max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
            Akses Informasi Publik
            <br />
            Secara Mudah dan Transparan
          </h2>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Sistem PPID Digital menyediakan akses informasi publik
            serta layanan pengajuan permohonan informasi secara online.
          </p>

          <div className="mt-8 flex gap-4">

            <Link
              href="/daftar"
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white"
            >
              Ajukan Permohonan
            </Link>

            <a
              href="#informasi-publik"
              className="rounded-lg border border-gray-300 px-6 py-3 font-medium"
            >
              Lihat Informasi Publik
            </a>

          </div>

        </div>
      </section>

      {/* INFORMASI PUBLIK */}
      <section
        id="informasi-publik"
        className="mx-auto max-w-7xl px-6 py-16"
      >

        <div className="mb-10">

          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Informasi Publik
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Kategori Informasi
          </h2>

          <p className="mt-3 max-w-2xl text-gray-600">
            Telusuri informasi publik berdasarkan kategori.
          </p>

        </div>

        <div className="grid gap-6 md:grid-cols-2">

          {kategori.map((key) => {

            const item = konten[key]

            return (
              <div
                key={key}
                className="rounded-2xl border border-gray-200 p-6"
              >

                <h3 className="text-xl font-semibold">
                  {item?.judul ?? key}
                </h3>

                <p className="mt-3 leading-7 text-gray-600">
                  {item?.isi_teks ??
                    'Konten informasi belum tersedia.'}
                </p>

                {item?.link_drive && (
                  <a
                    href={item.link_drive}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-block text-sm font-medium text-blue-600"
                  >
                    Lihat dokumen →
                  </a>
                )}

              </div>
            )
          })}

        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600">
        <div className="mx-auto max-w-7xl px-6 py-16 text-white">

          <h2 className="text-3xl font-bold">
            Tidak menemukan informasi yang dicari?
          </h2>

          <p className="mt-4 max-w-2xl text-blue-100">
            Ajukan permohonan informasi melalui layanan PPID Digital.
          </p>

          <Link
            href="/daftar"
            className="mt-6 inline-block rounded-lg bg-white px-6 py-3 font-medium text-blue-700"
          >
            Ajukan Permohonan
          </Link>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t">
        <div className="mx-auto max-w-7xl px-6 py-8 text-sm text-gray-500">

          <p>
            PPID Digital — Portal Layanan Informasi Publik
          </p>

          <p className="mt-2">
            Sistem informasi publik dan layanan permohonan informasi.
          </p>

        </div>
      </footer>

    </main>
  )
}