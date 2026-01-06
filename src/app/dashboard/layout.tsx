'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { DashboardNavbar } from '@/components/dashboard/DashboardNavbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, role, loading } = useAuth()
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    // Basic Client-side protection
    if (!loading && !user) {
      router.push('/ingresar')
    }
  }, [user, loading, router])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  )

  if (user && role !== 'owner') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center space-y-4">
        <h1 className="text-3xl font-bold text-red-500">Acceso Denegado</h1>
        <p className="text-muted-foreground">No tienes permisos para ver este panel.</p>

        <div className="bg-card border border-border p-4 rounded-xl text-left font-mono text-xs space-y-2 min-w-[300px]">
          <p><strong>Usuario:</strong> {user.email}</p>
          <p><strong>Rol:</strong> {role || 'null'}</p>
          <p><strong>Rol Requerido:</strong> owner</p>
        </div>

        <button
          onClick={() => router.push('/')}
          className="bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-primary/90 transition-colors"
        >
          Ir al Inicio
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <DashboardNavbar onMenuClick={() => setIsSidebarOpen(true)} />
      <main className="flex-1 lg:ml-64 pt-28 px-8 pb-8">
        {children}
      </main>
    </div>
  )
}
