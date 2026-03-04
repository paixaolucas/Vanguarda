export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`bg-[#111] animate-pulse ${className ?? ''}`} />
}

export function PageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <SkeletonBlock className="h-6 w-48" />
        <SkeletonBlock className="h-4 w-72" />
      </div>

      {/* Cards row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <SkeletonBlock key={i} className="h-24" />
        ))}
      </div>

      {/* Table */}
      <div className="space-y-px">
        <SkeletonBlock className="h-10" />
        {[...Array(6)].map((_, i) => (
          <SkeletonBlock key={i} className="h-14" />
        ))}
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <SkeletonBlock className="h-6 w-40" />
        <SkeletonBlock className="h-4 w-60" />
      </div>
      <SkeletonBlock className="h-10 w-full" />
      <div className="space-y-px">
        <SkeletonBlock className="h-10" />
        {[...Array(rows)].map((_, i) => (
          <SkeletonBlock key={i} className="h-14" />
        ))}
      </div>
    </div>
  )
}

export function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <SkeletonBlock className="h-6 w-52" />
        <SkeletonBlock className="h-4 w-80" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <SkeletonBlock className="h-48" />
          <SkeletonBlock className="h-64" />
        </div>
        <div className="space-y-4">
          <SkeletonBlock className="h-32" />
          <SkeletonBlock className="h-48" />
        </div>
      </div>
    </div>
  )
}
