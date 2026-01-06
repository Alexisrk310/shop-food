'use client'

import React from 'react'
import { Sidebar } from '@/components/Sidebar' // Assuming I'll create this or use from page.tsx refactor
import ProductCard from '@/features/store/components/ProductCard'
import { motion } from 'framer-motion'
import { useParams } from 'next/navigation'
import Link from 'next/link'

import { supabase } from '@/lib/supabase/client'


export default function CategoryPage() {
  const params = useParams()
  const category = (params.slug as string) || 'All'

  const [products, setProducts] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('products')
          .select('*')
          // Basic category filter - adjust if category names in DB differ (e.g. lowercase)
          .ilike('category', category === 'All' ? '%' : category)

        if (error) throw error
        if (data) setProducts(data)
      } catch (error) {
        console.error('Error fetching category products:', error)
      } finally {
        setLoading(false)
      }
    }

    if (category) {
      fetchProducts()
    }
  }, [category])

  return (
    <div className="min-h-screen bg-background pb-20 pt-24">
      <div className="max-w-7xl mx-auto px-6">

        {/* Breadcrumbs */}
        <div className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">Inicio</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-primary">Tienda</Link>
          <span>/</span>
          <span className="text-foreground capitalize">{category}</span>
        </div>

        <div className="flex flex-col md:flex-row gap-12">
          <Sidebar />

          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-8 capitalize">{category}</h1>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-muted/20 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            )}

            {!loading && products.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">
                No se encontraron productos en esta categoría
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
