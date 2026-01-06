'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 text-center space-y-8 max-w-lg mx-auto">
        <div className="space-y-4">
          <h1 className="text-9xl font-black text-primary opacity-20 select-none">404</h1>
          <h2 className="text-4xl font-bold tracking-tight text-foreground">
            Página no encontrada
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Lo sentimos, la página que buscas no existe.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link href="/">
            <Button size="lg" className="w-full sm:w-auto font-bold bg-primary hover:bg-primary/90">
              Ir al Inicio
            </Button>
          </Link>
          <Link href="/shop">
            <Button size="lg" variant="outline" className="w-full sm:w-auto font-bold border-border/50 hover:bg-accent/10">
              Explorar Tienda
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
