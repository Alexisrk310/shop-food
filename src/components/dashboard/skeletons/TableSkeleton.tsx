import { cn } from "@/lib/utils"

interface TableSkeletonProps {
  className?: string
  rows?: number
  columns?: number
  header?: boolean
}

export function TableSkeleton({ className, rows = 5, columns = 4, header = true }: TableSkeletonProps) {
  return (
    <div className={cn("bg-card border border-border rounded-xl overflow-hidden", className)}>
      {header && (
        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-card">
          <div className="h-6 w-32 bg-muted/50 rounded animate-pulse" />
          <div className="h-8 w-24 bg-muted/50 rounded animate-pulse" />
        </div>
      )}
      
      <div className="overflow-x-auto">
        <div className="w-full">
          {/* Table Header */}
          <div className="flex bg-muted/30 border-b border-border/50">
            {Array.from({ length: columns }).map((_, i) => (
              <div key={`th-${i}`} className="px-6 py-3 flex-1">
                <div className="h-4 w-20 bg-muted/50 rounded animate-pulse" />
              </div>
            ))}
          </div>
          
          {/* Table Body */}
          <div className="divide-y divide-border/50">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <div key={`row-${rowIndex}`} className="flex items-center">
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <div key={`cell-${rowIndex}-${colIndex}`} className="px-6 py-4 flex-1">
                    <div className="h-4 w-full bg-muted/30 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
