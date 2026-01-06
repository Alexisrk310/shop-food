import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/features/store/components/ProductCard'
import { Product } from '@/store/useCartStore'
import { ArrowRight, Star } from 'lucide-react'

export const revalidate = 60;

export default async function Home() {
  const supabase = await createClient()

  // Fetch popular products (for now just 6 items)
  let products: Product[] = []
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('is_featured', true)
    .limit(6)

  if (data) {
    products = data as Product[]
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[80vh] w-full overflow-hidden flex items-center justify-center">
        {/* Background with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=2071&auto=format&fit=crop"
            alt="Delicious Burger"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-fade-in">
            <span className="inline-block px-4 py-2 rounded-full bg-primary text-primary-foreground font-bold text-sm uppercase tracking-wider mb-4 animate-pulse">
              ¡Nuevo Menú!
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight">
              Sabor <span className="text-primary">Explosivo</span> <br />
              En Cada Mordida
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-lg">
              Las mejores hamburguesas artesanales de la ciudad. Ingredientes frescos, pan horneado a diario y la salsa secreta que te hará volver.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/catalogo" className="px-8 py-4 bg-primary text-white rounded-full font-bold text-lg hover:bg-primary/90 transition-transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-primary/30">
                Pedir Ahora <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/descuentos" className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full font-bold text-lg hover:bg-white/20 transition-transform hover:scale-105 flex items-center justify-center">
                Ver Promociones
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Menu */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl font-extrabold tracking-tight">Favoritos de la Casa</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Nuestra selección especial de platos recomendados por el chef. ¡Lo mejor de lo mejor!
          </p>
        </div>



        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-t border-border/50">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl font-extrabold tracking-tight">Nuestro Menú</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            ¿Qué se te antoja hoy? Explora nuestras categorías.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: 'Hamburguesas', icon: '🍔', slug: 'hamburguesas', color: 'from-orange-400 to-red-500' },
            { name: 'Perros Calientes', icon: '🌭', slug: 'perros', color: 'from-amber-400 to-orange-500' },
            { name: 'Salchipapas', icon: '🍟', slug: 'salchipapas', color: 'from-yellow-400 to-amber-500' },
            { name: 'Picadas', icon: '🍖', slug: 'picadas', color: 'from-red-500 to-rose-600' },
            { name: 'Desgranados', icon: '🌽', slug: 'desgranados', color: 'from-yellow-300 to-yellow-500' },
            { name: 'Mazorcas', icon: '🥬', slug: 'mazorcas', color: 'from-green-400 to-emerald-600' },
            { name: 'Bebidas', icon: '🥤', slug: 'bebidas', color: 'from-blue-400 to-cyan-500' },
            { name: 'Combos', icon: '🍱', slug: 'combos', color: 'from-purple-500 to-indigo-600' },
          ].map((cat) => (
            <Link
              key={cat.slug}
              href={`/catalogo?category=${cat.name}`}
              className="group relative h-48 rounded-3xl overflow-hidden shadow-lg transition-all hover:scale-105 hover:shadow-2xl"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-90 transition-opacity group-hover:opacity-100`} />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white p-4">
                <span className="text-6xl drop-shadow-md transform group-hover:scale-110 transition-transform duration-300">
                  {cat.icon}
                </span>
                <span className="font-bold text-xl tracking-wider uppercase text-center drop-shadow-sm">
                  {cat.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features / Trust */}
      <section className="py-20 bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-8 rounded-2xl bg-background border border-border/50 shadow-sm">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
              🚀
            </div>
            <h3 className="font-bold text-xl mb-2">Envío Rápido</h3>
            <p className="text-muted-foreground">Tu comida llega caliente y a tiempo, garantizado.</p>
          </div>
          <div className="p-8 rounded-2xl bg-background border border-border/50 shadow-sm">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
              🥩
            </div>
            <h3 className="font-bold text-xl mb-2">100% Artesanal</h3>
            <p className="text-muted-foreground">Carne seleccionada y vegetales frescos del día.</p>
          </div>
          <div className="p-8 rounded-2xl bg-background border border-border/50 shadow-sm">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
              ⭐
            </div>
            <h3 className="font-bold text-xl mb-2">Calidad Premium</h3>
            <p className="text-muted-foreground">Miles de clientes felices no pueden estar equivocados.</p>
          </div>
        </div>
      </section>
    </main>
  )
}
