'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ProductCard from '@/features/store/components/ProductCard'
import { ProductSkeleton } from '@/features/store/components/ProductSkeleton'
// import { Filter, X } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { Product } from '@/store/useCartStore'

interface ShopClientProps {
  initialProducts: Product[]
}

const CATEGORIES = [
  'Hamburguesas',
  'Pizzas',
  'Perros Calientes',
  'Acompañamientos',
  'Bebidas'
]

function ShopContent({ initialProducts }: ShopClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [loading, setLoading] = useState(false) // Initially false because we have SSR datta
  const [error, setError] = useState<string | null>(null)
  // const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)

  // Get active filters
  const categoryFilter = searchParams.get('category')

  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const sizeFilter = searchParams.get('size')

  // Check if any filter is active
  const hasActiveFilters = Boolean(categoryFilter || minPrice || maxPrice || sizeFilter)

  useEffect(() => {
    // Only fetch from client if there are active filters
    // If no filters (initial load), we already have data from SSR props
    if (hasActiveFilters) {
      fetchProducts()
    } else {
      // Reset to initial if filters are cleared
      // optimization: could just setProducts(initialProducts) if we are sure initialProducts is "all products"
      // But for safety let's fetch or use initial if it represents "all"
      setProducts(initialProducts)
    }
    // setIsMobileFiltersOpen(false)
  }, [categoryFilter, minPrice, maxPrice, sizeFilter, initialProducts])

  const handleCategoryChange = (category: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (category) {
      params.set('category', category)
    } else {
      params.delete('category')
    }
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)

      const anonSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false } }
      )

      let query = anonSupabase.from('products').select('*')

      if (categoryFilter) {
        query = query.ilike('category', categoryFilter)
      }



      if (minPrice) {
        query = query.gte('price', minPrice)
      }

      if (maxPrice) {
        query = query.lte('price', maxPrice)
      }

      if (sizeFilter) {
        query = query.filter('sizes', 'cs', `["${sizeFilter}"]`)
      }

      const { data, error } = await query

      if (error) throw error

      if (data) {
        setProducts(data as Product[])
      }
    } catch (error: any) {
      console.error('Error fetching products:', error.message || error)
      setError(error.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20 pt-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col gap-6 lg:gap-8">

          {/* Product Grid */}
          <div className="flex-1">
            <div className="flex flex-col gap-6 mb-8">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Menú</h1>
                <span className="text-sm text-muted-foreground hidden md:block">{products.length} Platos</span>
              </div>

              {/* Categories Pills */}
              <div className="overflow-x-auto pb-2 -mx-6 px-6 md:mx-0 md:px-0">
                <div className="flex gap-2 min-w-max">
                  <button
                    onClick={() => handleCategoryChange(null)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${!categoryFilter
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                  >
                    Todos
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryChange(cat)}
                      className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${categoryFilter === cat
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-20 bg-red-500/10 rounded-3xl border border-red-500/20 px-4">
                <p className="text-lg text-red-400 font-bold mb-2">Error cargando productos</p>
                <p className="text-sm text-red-300/80 mb-6 max-w-md mx-auto">
                  {error}
                </p>
                <button
                  onClick={async () => {
                    window.location.reload()
                  }}
                  className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full font-bold transition-colors"
                >
                  Reintentar
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-muted/10 rounded-3xl border border-white/5">
                <p className="text-lg text-muted-foreground">No se encontraron productos con estos filtros.</p>
                <button onClick={() => window.location.href = '/catalogo'} className="mt-4 text-primary hover:underline">Limpiar filtros</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ShopClient(props: ShopClientProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background pt-32 text-center">Cargando productos...</div>}>
      <ShopContent {...props} />
    </Suspense>
  )
}
