'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, User, Menu, X, LogIn, Package } from 'lucide-react'
import Image from 'next/image'
import { useCartStore } from '@/store/useCartStore'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'
import { LogoutModal } from '@/components/LogoutModal'
import { useClickOutside } from '@/hooks/useClickOutside'

export default function Navbar() {
  const { items, toggleCart } = useCartStore()
  const { user, role, loading } = useAuth()
  console.log('Navbar Auth State - User:', user?.email, 'Role:', role)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const pathname = usePathname()
  const isAuthPage = ['/login', '/register'].includes(pathname)

  const profileMenuRef = React.useRef<HTMLDivElement>(null)

  useClickOutside(profileMenuRef, () => setIsProfileMenuOpen(false))

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsMobileMenuOpen(false)
      }
      window.addEventListener('keydown', handleEscape)
      return () => {
        document.body.style.overflow = 'unset'
        window.removeEventListener('keydown', handleEscape)
      }
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  // Handle Logout
  const handleLogout = async () => {
    setIsLogoutModalOpen(false)
    try {
      // Race condition: If signOut takes longer than 2s, force logout anyway
      // This prevents the UI from hanging if the network or token is unstable
      const signOutPromise = supabase.auth.signOut()
      const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 2000))

      await Promise.race([signOutPromise, timeoutPromise])
    } catch (error) {
      console.error('Logout error (forcing cleanup):', error)
    } finally {
      // Force cleanup local storage and refresh to ensure UI sync
      localStorage.clear()
      window.location.href = '/' // Hard reload to clear all states
    }
  }

  // Hide navbar on auth pages AND dashboard
  const isDashboard = pathname.startsWith('/dashboard')
  if (isAuthPage || isDashboard) return null

  // User Name (Metadata)
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario'
  const textColor = isScrolled ? 'text-primary' : 'text-white'
  const buttonHover = isScrolled ? 'hover:bg-primary/10' : 'hover:bg-white/10'

  return (
    <nav className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'h-16 bg-background/80 backdrop-blur-md border-b border-border shadow-sm' : 'h-20 bg-gradient-to-b from-black/60 to-transparent toggle-gradient'}`}>
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          {/* Replaced Icon with AI Logo Image */}
          <div className="relative w-12 h-12 overflow-hidden rounded-lg group-hover:scale-105 transition-transform">
            <Image src="/foodies_logo.png" alt="Foodies" fill className="object-cover" priority sizes="48px" />
          </div>
          <span className="hidden md:inline text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Foodies
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className={`text-sm font-medium transition-colors ${textColor} hover:opacity-80`}>Inicio</Link>
          <Link href="/catalogo" className={`text-sm font-medium transition-colors ${textColor} hover:opacity-80`}>Menú</Link>
          <Link href="/descuentos" className={`text-sm font-medium transition-colors ${textColor} hover:opacity-80`}>Ofertas</Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">

          {/* Cart Icon */}
          <button
            onClick={() => toggleCart()}
            className={`relative p-2 rounded-full transition-colors ${textColor} ${buttonHover}`}
          >
            <Link href="/carrito">
              <ShoppingCart className="w-5 h-5" />
              {items.length > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-primary text-white text-[10px] flex items-center justify-center rounded-full animate-bounce">
                  {items.length}
                </span>
              )}
            </Link>
          </button>


          {/* Auth Section with Dropdown */}
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-white/20 animate-pulse" />
          ) : user ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border border-transparent ${buttonHover} ${isScrolled ? 'hover:border-primary/10' : 'hover:border-white/10'}`}
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-[10px] font-bold text-white">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className={`text-sm font-medium max-w-[100px] truncate hidden sm:block ${textColor}`}>{userName}</span>
              </button>

              {/* Dropdown */}
              <div className={`absolute top-full right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-2xl overflow-hidden transition-all duration-200 transform origin-top-right ${isProfileMenuOpen ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95 pointer-events-none'}`}>
                <div className="p-3 border-b border-border/50">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Cuenta</p>
                  <p className="text-sm font-medium truncate text-foreground">{user.email}</p>
                </div>
                <div className="p-2">
                  <Link
                    href="/profile"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-primary/10 hover:text-primary text-foreground transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Mi Perfil
                  </Link>
                  <Link
                    href="/my-orders"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-primary/10 hover:text-primary text-foreground transition-colors"
                  >
                    <Package className="w-4 h-4" />
                    Mis Pedidos
                  </Link>
                  <Link
                    href="/favorites"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-primary/10 hover:text-primary text-foreground transition-colors"
                  >
                    <span className="text-red-500">❤️</span>
                    Favoritos
                  </Link>
                  {role === 'owner' && (
                    <Link
                      href="/dashboard"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-primary/10 hover:text-primary text-foreground transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => setIsLogoutModalOpen(true)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-red-500/10 hover:text-red-500 text-foreground transition-colors text-left"
                  >
                    <LogIn className="w-4 h-4 rotate-180" />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              {/* Generic Orders Button for Guests */}
              <Link
                href="/my-orders"
                className="hidden sm:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                title="Inicia sesión para ver pedidos"
              >
                <Package className="w-4 h-4" />
                <span>Mis Pedidos</span>
              </Link>

              <Link href="/login" className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${isScrolled ? 'bg-primary/10 hover:bg-primary/20 text-primary' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
                Iniciar Sesión
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button className={`md:hidden ${textColor}`} onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-xl z-[60] flex flex-col p-6 text-foreground shadow-2xl"
          >
            <div className="flex justify-between items-center mb-8">
              <span className="font-bold text-xl">Menú</span>
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted transition-colors text-lg font-medium">
                <span className="text-xl">🏠</span> Inicio
              </Link>
              <Link href="/catalogo" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted transition-colors text-lg font-medium">
                <span className="text-xl">🍔</span> Menú
              </Link>
              <Link href="/descuentos" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted transition-colors text-lg font-medium">
                <span className="text-xl">🔥</span> Ofertas
              </Link>

              <div className="h-px bg-border/50 my-2" />

              {user ? (
                <>
                  <Link href="/my-orders" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted transition-colors text-lg font-medium">
                    <Package className="w-5 h-5 text-primary" /> Mis Pedidos
                  </Link>
                  <button onClick={() => { setIsLogoutModalOpen(true); setIsMobileMenuOpen(false) }} className="flex items-center gap-4 p-4 rounded-xl hover:bg-red-500/10 text-red-500 transition-colors text-lg font-medium text-left w-full">
                    <LogIn className="w-5 h-5 opacity-70" /> Cerrar Sesión
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center p-4 rounded-xl bg-muted font-bold text-center">
                    Iniciar Sesión
                  </Link>
                  <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center p-4 rounded-xl bg-primary text-primary-foreground font-bold text-center shadow-lg shadow-primary/20">
                    Registrarse
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </nav>
  )
}
