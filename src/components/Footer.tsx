'use client'

import Link from 'next/link'
import { Facebook, Twitter, Instagram, Mail, MapPin, Phone } from 'lucide-react'

import { useToast } from '@/components/ui/Toast'

export default function Footer() {
  const { addToast } = useToast()

  return (
    <footer className="bg-black border-t border-white/5 pt-16 pb-8 text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/40 transition-colors">
                <span className="font-bold text-primary">F</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Foodies
              </span>
            </Link>
            <p className="text-sm text-zinc-400 leading-relaxed">
              El auténtico sabor costeño. Hamburguesas, perros y picadas con la sazón única de Cartagena.
            </p>
            <div className="flex gap-4 pt-2">
              <Link href="#" className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-primary transition-colors"><Facebook className="w-4 h-4" /></Link>
              <Link href="#" className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-primary transition-colors"><Twitter className="w-4 h-4" /></Link>
              <Link href="#" className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-primary transition-colors"><Instagram className="w-4 h-4" /></Link>
            </div>
          </div>

          {/* Links Column */}
          <div>
            <h4 className="font-bold mb-6 text-white">Menú</h4>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li><Link href="/catalogo?category=Hamburguesas" className="hover:text-primary transition-colors">Hamburguesas</Link></li>
              <li><Link href="/catalogo?category=Pizzas" className="hover:text-primary transition-colors">Pizzas</Link></li>
              <li><Link href="/catalogo?category=Perros Calientes" className="hover:text-primary transition-colors">Perros Calientes</Link></li>
              <li><Link href="/catalogo?category=Picadas" className="hover:text-primary transition-colors">Picadas</Link></li>
              <li><Link href="/descuentos" className="hover:text-primary transition-colors">Promociones</Link></li>
            </ul>
          </div>

          {/* Help Column */}
          <div>
            <h4 className="font-bold mb-6 text-white">Ayuda</h4>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li><Link href="/domicilios" className="hover:text-primary transition-colors">Domicilios</Link></li>
              <li><Link href="/zonas-cobertura" className="hover:text-primary transition-colors">Zonas de Cobertura</Link></li>
              <li><Link href="/contactanos" className="hover:text-primary transition-colors">Contáctanos</Link></li>
            </ul>
          </div>

          {/* Newsletter Column */}
          {/* Contact Column */}
          <div>
            <h4 className="font-bold mb-6 text-white">Contacto</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span>Cartagena de Indias, Colombia</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span>+57 300 987 6543</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span>hola@foodies.com.co</span>
              </div>
            </div>
          </div>

        </div>

        <div className="border-t border-white/5 pt-8 text-center">
          <p className="text-xs text-zinc-500">
            &copy; {new Date().getFullYear()} Foodies. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
