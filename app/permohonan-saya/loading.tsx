import { ArrowLeft, FileText } from '@phosphor-icons/react/dist/ssr'

export default function LoadingPermohonanSaya() {
  return (
    <main className="min-h-screen bg-slate-50 font-plus-jakarta py-12">
      <div className="mx-auto max-w-5xl px-6">
        {/* Top bar skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div className="h-4 w-48 bg-slate-200 rounded animate-pulse"></div>
          <div className="h-4 w-32 bg-slate-200 rounded animate-pulse"></div>
        </div>

        {/* Header skeleton */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="w-full md:w-1/2">
            <div className="h-8 md:h-10 w-3/4 bg-slate-200 rounded-lg animate-pulse mb-2"></div>
            <div className="h-4 w-5/6 bg-slate-200 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-48 bg-slate-200 rounded-xl animate-pulse"></div>
        </div>

        {/* List skeleton */}
        <div className="mt-8 space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center animate-pulse">
                    <FileText weight="fill" size={24} className="text-slate-300" />
                  </div>
                  <div>
                    <div className="h-3 w-32 bg-slate-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-48 bg-slate-200 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="h-8 w-24 bg-slate-200 rounded-full animate-pulse"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
                <div>
                  <div className="h-3 w-20 bg-slate-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-full bg-slate-200 rounded animate-pulse"></div>
                </div>
                <div>
                  <div className="h-3 w-20 bg-slate-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-full bg-slate-200 rounded animate-pulse"></div>
                </div>
                <div>
                  <div className="h-3 w-20 bg-slate-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-full bg-slate-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
