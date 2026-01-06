'use client'

import { Loader2 } from 'lucide-react'
export default function Loading() {
  return (
    <div className="min-h-[50vh] w-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          {/* Pulse Effect */}
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
          <Loader2 className="w-10 h-10 text-primary animate-spin relative z-10" />
        </div>
        <p className="text-sm font-bold text-muted-foreground animate-pulse uppercase tracking-widest">
          Cargando...
        </p>
      </div>
    </div>
  )
}
