import Link from 'next/link'
import { createClient } from '@/app/lib/supabase/server'

export default async function SertaMertaPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('konten_landing')
    .select('judul, isi_teks, link_drive')
    .eq('section_key', 'serta_merta')
    .single()

  return (
    <main className="min-h-screen bg-gray-50">

      <header className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-6 py-5">
          <Link
            href="/"
            className="text-sm text-blue-600 hover:underline"
          >
            ← Kembali ke Beranda
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-12">

        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
          Informasi Publik
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          {data?.judul ?? 'Informasi Serta-merta'}
        </h1>

        {error ? (
          <p className="mt-6 text-red-600">
            Gagal mengambil data informasi.
          </p>
        ) : (
          <div className="mt-8 rounded-2xl border bg-white p-8 shadow-sm">

            <p className="whitespace-pre-line leading-8 text-gray-700">
              {data?.isi_teks ?? 'Konten belum tersedia.'}
            </p>

            {data?.link_drive && (
              <a
                href={data.link_drive}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white"
              >
                Buka Dokumen
              </a>
            )}

          </div>
        )}

      </section>
    </main>
  )
}