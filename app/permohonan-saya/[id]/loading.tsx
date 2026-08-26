import { ArrowLeft, Clock, FileText, CheckCircle } from '@phosphor-icons/react/dist/ssr'

export default function LoadingDetailPermohonan() {
  return (
    <main className="min-h-screen bg-slate-50 font-plus-jakarta py-12">
      <div className="mx-auto max-w-5xl px-6">
        {/* Top bar skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div className="h-4 w-48 bg-slate-200 rounded animate-pulse"></div>
          <div className="h-8 w-24 bg-slate-200 rounded-full animate-pulse"></div>
        </div>

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200 mb-8">
          {/* Header skeleton */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10 pb-8 border-b border-slate-100">
            <div className="w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-6 w-24 bg-slate-200 rounded-full animate-pulse"></div>
                <div className="h-4 w-32 bg-slate-200 rounded animate-pulse"></div>
              </div>
              <div className="h-10 w-full md:w-3/4 bg-slate-200 rounded-xl animate-pulse"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
            {/* Left column */}
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-full bg-slate-200 animate-pulse"></div>
                  <div className="h-4 w-32 bg-slate-200 rounded animate-pulse"></div>
                </div>
                <div className="h-24 w-full bg-slate-100 rounded-xl border border-slate-200 animate-pulse"></div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-full bg-slate-200 animate-pulse"></div>
                  <div className="h-4 w-32 bg-slate-200 rounded animate-pulse"></div>
                </div>
                <div className="h-24 w-full bg-slate-100 rounded-xl border border-slate-200 animate-pulse"></div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-8">
              <div>
                <div className="h-4 w-48 bg-slate-200 rounded animate-pulse mb-4"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-16 w-full bg-slate-100 rounded-xl border border-slate-200 animate-pulse"></div>
                  <div className="h-16 w-full bg-slate-100 rounded-xl border border-slate-200 animate-pulse"></div>
                  <div className="h-16 w-full bg-slate-100 rounded-xl border border-slate-200 animate-pulse"></div>
                  <div className="h-16 w-full bg-slate-100 rounded-xl border border-slate-200 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
