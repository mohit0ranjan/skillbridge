export default function DashboardLoading() {
  return (
    <div className="w-full animate-pulse space-y-6 pt-6">
      {/* Header Skeleton */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-64 rounded-md bg-slate-200"></div>
          <div className="h-4 w-48 rounded-md bg-slate-200"></div>
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-slate-200"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 w-20 rounded bg-slate-200"></div>
                <div className="h-6 w-16 rounded bg-slate-200"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 h-6 w-48 rounded bg-slate-200"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 w-full rounded-lg bg-slate-100"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
