import { cn } from "@/lib/utils"

export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-card border border-border rounded-xl p-6 h-full", className)}>
      <div className="h-6 w-48 bg-muted/50 rounded animate-pulse mb-6" />
      <div className="h-[300px] w-full bg-muted/30 rounded animate-pulse" />
    </div>
  )
}
