'use client'

import React, { Suspense } from 'react'
import Carousel from '@/components/Carousel'
import { Sidebar } from '@/components/Sidebar'
import ProductCard from '@/features/store/components/ProductCard'
import { motion } from 'framer-motion'
import { Product } from '@/store/useCartStore'
import Link from 'next/link'

interface HomeClientProps {
  products: Product[]
}

export default function HomeClient({ products }: HomeClientProps) {

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero / Carousel */}
      <Carousel />

      {/* Shop Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row gap-12">

          {/* Sidebar Filters */}
          <div className="sticky top-24 h-fit hidden md:block">
            <Suspense fallback={<div className="w-64 h-96 bg-muted/20 animate-pulse rounded-2xl" />}>
              <Sidebar />
            </Suspense>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold flex flex-wrap items-center gap-4 sm:gap-6">
                Nuevos Lanzamientos
                <span className="text-xs font-normal text-primary px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 whitespace-nowrap">
                  {products.length} Nuevos
                </span>
              </h2>
              <Link href="/shop" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
                Ver Todo &rarr;
              </Link>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-20 bg-muted/5 rounded-3xl border border-white/5 backdrop-blur-sm">
                <p className="text-lg text-muted-foreground mb-4">No hay nuevos lanzamientos por el momento.</p>
                <Link href="/shop" className="text-primary hover:underline">
                  Explorar toda la colección
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
