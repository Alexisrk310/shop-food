import { cn } from "@/lib/utils"

export function StatsCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl p-5 border border-border/50 bg-card", className)}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-muted/50 animate-pulse" />
      </div>
      <div className="h-4 w-24 bg-muted/50 rounded animate-pulse mb-2" />
      <div className="h-8 w-32 bg-muted/50 rounded animate-pulse" />
    </div>
  )
}
