'use client'

import React from 'react'
import { Product } from '@/store/useCartStore'
import ProductCard from '@/features/store/components/ProductCard'
import { motion, AnimatePresence } from 'framer-motion'
import { Tag, Timer, Zap } from 'lucide-react'

interface DiscountsClientProps {
    products: Product[]
}

export default function DiscountsClient({ products }: DiscountsClientProps) {

    // Calculate stats
    const maxDiscount = products.reduce((max, product) => {
        if (!product.sale_price) return max;
        const discount = Math.round(((product.price - product.sale_price) / product.price) * 100);
        return discount > max ? discount : max;
    }, 0);

    return (
        <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-200/40 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />

            {/* Banner Section */}
            <div className="relative pt-36 pb-20 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center"
                    >
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider mb-6 border border-primary/20 shadow-sm">
                            <Zap className="w-4 h-4 fill-current" />
                            Ofertas Exclusivas
                        </div>

                        <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter">
                            Combos <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">
                                Deliciosos
                            </span>
                        </h1>

                        {maxDiscount > 0 && (
                            <p className="text-xl md:text-2xl font-bold text-muted-foreground max-w-2xl mx-auto leading-relaxed flex items-center justify-center gap-3">
                                <span className="bg-primary text-white px-3 py-1 rounded-lg shadow-lg rotate-3 inline-block">Ahorra hasta {maxDiscount}%</span>
                                en platos seleccionados
                            </p>
                        )}
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 pb-32 relative z-10">
                {products.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-24 text-center bg-card/50 backdrop-blur-sm border border-primary/20 rounded-3xl shadow-xl shadow-primary/10 p-12 max-w-2xl mx-auto"
                    >
                        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <Tag className="w-12 h-12 text-primary" />
                        </div>
                        <h2 className="text-3xl font-bold mb-4">No hay combos activos</h2>
                        <p className="text-muted-foreground mb-10 max-w-md font-medium">
                            Estamos cocinando nuevas promociones para ti.
                        </p>
                        <a href="/catalogo" className="px-10 py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1">
                            Ver el Menú
                        </a>
                    </motion.div>
                ) : (
                    <>
                        <div className="flex items-center gap-6 mb-12">
                            <div className="h-px flex-1 bg-border" />
                            <span className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2 bg-card px-4 py-2 rounded-full border border-primary/20 shadow-sm">
                                <Timer className="w-4 h-4" /> Oferta por tiempo limitado
                            </span>
                            <div className="h-px flex-1 bg-border" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            <AnimatePresence>
                                {products.map((product, index) => (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <ProductCard product={product} index={index} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
