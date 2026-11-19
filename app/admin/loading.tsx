export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Memuat halaman admin">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-2 max-w-full">
          <div className="h-7 w-56 max-w-full bg-slate-200 rounded-lg" />
          <div className="h-4 w-80 max-w-full bg-slate-200 rounded-md" />
        </div>
        <div className="h-11 w-40 bg-slate-200 rounded-lg shrink-0" />
      </div>

      {/* Operational Ledger Strip Skeleton */}
      <div className="bg-white rounded-xl border border-slate-200 grid grid-cols-2 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        <div className="col-span-2 lg:col-span-5 p-5 space-y-2.5">
          <div className="h-3.5 w-32 bg-slate-200 rounded" />
          <div className="h-8 w-16 bg-slate-200 rounded" />
          <div className="h-3 w-44 max-w-full bg-slate-100 rounded" />
        </div>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="col-span-1 lg:col-span-2 p-5 space-y-2.5 last:lg:col-span-3"
          >
            <div className="h-3.5 w-24 bg-slate-200 rounded" />
            <div className="h-7 w-12 bg-slate-200 rounded" />
          </div>
        ))}
      </div>

      {/* Filter and Search Bar Skeleton */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="h-10 w-full md:w-80 bg-slate-100 rounded-lg" />
        <div className="flex gap-2 w-full md:w-auto">
          <div className="h-10 w-24 bg-slate-100 rounded-lg" />
          <div className="h-10 w-24 bg-slate-100 rounded-lg" />
          <div className="h-10 w-24 bg-slate-100 rounded-lg" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <div className="h-4 w-40 bg-slate-200 rounded" />
          <div className="h-4 w-24 bg-slate-200 rounded" />
        </div>
        <div className="divide-y divide-slate-200">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="space-y-2 flex-1 w-full">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-12 bg-slate-200 rounded" />
                  <div className="h-4 w-44 max-w-full bg-slate-200 rounded" />
                </div>
                <div className="h-3 w-3/4 bg-slate-100 rounded" />
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                <div className="h-6 w-24 bg-slate-100 rounded-md" />
                <div className="h-9 w-28 bg-slate-200 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
