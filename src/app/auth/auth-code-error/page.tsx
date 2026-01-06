'use client'

import Link from 'next/link'
// import { useLanguage } from '@/components/LanguageProvider'

export default function AuthCodeError() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Enlace de acceso inválido o expirado</h1>
      <p className="mb-6 text-muted-foreground">
        El enlace que utilizaste ya no es válido. Por favor, solicita uno nuevo.
      </p>
      <Link
        href="/ingresar"
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
      >
        Volver al inicio de sesión
      </Link>
    </div>
  )
}
