import { cn } from "@/lib/utils"

export function OrderCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-card border border-border rounded-xl p-6", className)}>
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
        {/* Order Info */}
        <div className="flex-1 w-full opacity-60">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-6 w-24 bg-muted rounded animate-pulse" />
            <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
          </div>
          
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                <div className="h-4 w-32 bg-muted/50 rounded animate-pulse" />
              </div>
            ))}
            <div className="col-span-1 md:col-span-2 flex items-center gap-2 mt-1">
              <div className="h-4 w-16 bg-muted rounded animate-pulse" />
              <div className="h-4 w-64 bg-muted/50 rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-end gap-3 min-w-[200px] w-full lg:w-auto mt-4 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-border">
          <div className="h-8 w-32 bg-muted rounded animate-pulse" />
          <div className="h-10 w-full lg:w-40 bg-muted rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  )
}
