'use client'

import { motion } from 'framer-motion'
import { ShoppingCart, Eye, Heart, Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useCartStore, Product } from '@/store/useCartStore'
import { useToast } from '@/components/ui/Toast'
import { useFavorites } from '@/hooks/useFavorites'
import { supabase } from '@/lib/supabase/client'

interface ProductCardProps {
  product: Product & { isNew?: boolean }
  index?: number
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCartStore()
  const { addToast } = useToast()
  const { toggleFavorite, isFavorite } = useFavorites()
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] || 'M')
  const [rating, setRating] = useState<number>(0)
  const [reviewCount, setReviewCount] = useState<number>(0)

  useEffect(() => {
    // Auto-select first available size
    if (product) {
      // Check if stock_by_size keys exist, otherwise use defaults
      const availableKeys = product.stock_by_size ? Object.keys(product.stock_by_size) : [];
      const sizes = availableKeys.length > 0 ? availableKeys : ['Personal', 'Mediano', 'Familiar'];

      const firstAvailable = sizes.find(size => {
        if (product.stock_by_size) {
          // Handle both old (number) and new (object) format safely
          const val = product.stock_by_size[size];
          if (typeof val === 'number') return val > 0;
          // @ts-ignore
          if (typeof val === 'object') return (val?.stock === null || val?.stock === undefined) ? true : (val.stock > 0);
          return false;
        }
        return product.stock === null || (product.stock || 0) > 0
      })
      if (firstAvailable) {
        setSelectedSize(firstAvailable)
      } else if (sizes.length > 0) {
        setSelectedSize(sizes[0])
      }
    }
  }, [product])

  // ... (skipping useEffect for rating)

  const checkStock = (size: string) => {
    if (product.stock_by_size && size) {
      const val = product.stock_by_size[size];
      if (typeof val === 'number') return val > 0;
      // @ts-ignore
      if (typeof val === 'object') {
        // @ts-ignore
        const s = val?.stock;
        return s === null || s === undefined || s > 0;
      }
    }
    // For simple products or if no size specific logic matches (robustness)
    return product.stock === null || (product.stock || 0) > 0
  }

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // For sized products, we need a size. For simple products, we don't.
    // However, the card *always* tries to select a size if sizes exist.
    // If displayedSizes is empty, selectedSize might be null/empty.
    const hasSizes = (product.stock_by_size && Object.keys(product.stock_by_size).length > 0) || (product.sizes && product.sizes.length > 0);

    if (hasSizes && !selectedSize) {
      addToast('Por favor selecciona un tamaño', 'error')
      return;
    }

    if (hasSizes && !checkStock(selectedSize)) {
      addToast('No puedes agregar más ítems de los disponibles en stock', 'error')
      return
    }

    // Check main stock if no sizes
    if (!hasSizes && !checkStock('')) {
      addToast('No puedes agregar más ítems de los disponibles en stock', 'error')
      return
    }

    let availableStock = product.stock === null ? 9999 : (product.stock || 0);
    let effectivePrice = product.sale_price || product.price;

    if (hasSizes && product.stock_by_size && product.stock_by_size[selectedSize]) {
      const val = product.stock_by_size[selectedSize] as any;
      if (typeof val === 'number') {
        availableStock = val;
      } else if (typeof val === 'object') {
        // If stock is null/undefined in the object, treat as infinite (9999)
        availableStock = (val?.stock === null || val?.stock === undefined) ? 9999 : val.stock;

        if (val?.sale_price) {
          effectivePrice = val.sale_price;
        } else if (val?.price) {
          effectivePrice = val.price;
        }
      }
    }

    // Show optional loading state or just await
    const success = await addItem({
      id: product.id,
      name: product.name,
      price: effectivePrice,
      image_url: product.images?.[0] || product.image_url || '/placeholder.png',
      description: product.description,
      size: hasSizes ? selectedSize : undefined,
      stock: availableStock
    })

    if (success) {
      addToast(`Agregado al carrito`, 'success')
    } else {
      addToast('Has alcanzado el límite de stock disponible para este producto', 'error')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative bg-card rounded-2xl overflow-hidden border border-border/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500"
    >
      {/* New Badge */}
      {product.is_new && !product.sale_price && (
        <div className="absolute top-3 left-3 z-20 bg-primary/90 text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full backdrop-blur-md shadow-lg">
          NUEVO
        </div>
      )}

      {/* Sale Badge */}
      {(product.sale_price || (selectedSize && product.stock_by_size && product.stock_by_size[selectedSize] && typeof product.stock_by_size[selectedSize] === 'object' && (product.stock_by_size[selectedSize] as any).sale_price)) && (
        <div className="absolute top-3 left-3 z-20 bg-gradient-to-r from-red-500 to-pink-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full backdrop-blur-md shadow-lg animate-pulse">
          PROMO
        </div>
      )}

      {/* Favorite Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleFavorite(product.id, product)
        }}
        className={`absolute top-3 right-3 z-20 p-2 rounded-full backdrop-blur-md shadow-lg transition-all duration-300 group-hover:scale-110 ${isFavorite(product.id) ? 'bg-background border border-border text-red-500' : 'bg-black/30 text-white hover:bg-white/20'}`}
      >
        <Heart className={`w-5 h-5 ${isFavorite(product.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
      </button>

      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={product.images?.[0] || product.image_url || '/placeholder.png'}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={index < 2}
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Overlay Actions */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-0 lg:translate-y-full lg:group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/80 to-transparent flex flex-col gap-2">

          {(() => {
            // Determine which sizes to display
            let displayedSizes: string[] = [];
            if (product.stock_by_size && Object.keys(product.stock_by_size).length > 0) {
              displayedSizes = Object.keys(product.stock_by_size);
            } else if (product.sizes && product.sizes.length > 0) {
              displayedSizes = product.sizes;
            }

            if (displayedSizes.length === 0) return null;

            return (
              <div className="flex justify-center gap-1 bg-black/40 p-1.5 rounded-xl backdrop-blur-md" onClick={(e) => e.preventDefault()}>
                {displayedSizes.map(size => {
                  // Check availability safely
                  let isAvailable = false;

                  if (product.stock_by_size) {
                    const val = product.stock_by_size[size];
                    if (typeof val === 'number') isAvailable = val > 0;
                    else if (typeof val === 'object') {
                      const stockVal = (val as any)?.stock;
                      // If stockVal is null or undefined, it's infinite -> Available
                      isAvailable = (stockVal === null || stockVal === undefined) ? true : stockVal > 0;
                    }
                  } else {
                    // Fallback: check global stock if no specific size stock is tracked
                    isAvailable = product.stock === null || (product.stock || 0) > 0;
                  }

                  return (
                    <button
                      key={size}
                      disabled={!isAvailable}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (isAvailable) setSelectedSize(size)
                      }}
                      className={`min-w-8 h-8 px-2 text-[10px] font-bold rounded-lg transition-all relative ${selectedSize === size
                        ? 'bg-primary text-white shadow-lg shadow-primary/25'
                        : isAvailable ? 'text-white/80 hover:bg-white/10' : 'text-white/30 cursor-not-allowed'
                        }`}
                    >
                      {size}
                      {!isAvailable && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-px bg-red-500/80 rotate-45 transform origin-center"></div>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            )
          })()}
          {selectedSize && product.stock_by_size && (
            <div className="text-[10px] text-white/90 text-center font-medium">
              {(() => {
                const val = product.stock_by_size[selectedSize] as any;
                let stock: number | null = 0;
                let price = 0;
                let sale_price = undefined;
                if (typeof val === 'number') stock = val;
                else if (typeof val === 'object') {
                  // If stock is null/undefined, treat as infinite
                  stock = (val?.stock === null || val?.stock === undefined) ? null : val.stock;
                  price = val?.price;
                  sale_price = val?.sale_price;
                }

                const hasStock = stock === null || stock > 0;

                return (
                  <span>
                    {hasStock ? (
                      <>
                        {sale_price ? (
                          <>
                            <span className="mr-1 text-red-400 line-through opacity-70">${price.toLocaleString()}</span>
                            <span className="mr-1 text-primary font-bold">${sale_price.toLocaleString()}</span>
                          </>
                        ) : (
                          price > 0 && <span className="mr-1 text-primary">${price.toLocaleString()}</span>
                        )}
                        <span className="text-white/80">{stock === null ? '' : `${stock} disp.`}</span>
                      </>
                    ) : 'Agotado'}
                  </span>
                )
              })()}
            </div>
          )}

          <div className="flex gap-2">
            <Link href={`/catalogo/${product.id}`} className="flex-1">
              <button className="w-full h-10 rounded-xl bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 transition-colors gap-2 text-xs font-bold uppercase tracking-wider">
                <Eye className="w-4 h-4" /> Ver
              </button>
            </Link>
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-primary text-white h-10 rounded-xl font-bold text-xs hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 uppercase tracking-wider shadow-lg shadow-primary/25"
            >
              Pedir <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 pr-2">
            <p className="text-xs text-primary font-bold tracking-wider uppercase mb-1">{product.category || 'Menú'}</p>
            <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors text-foreground">{product.name}</h3>

            {/* Rating Stars - Always visible */}
            <div className="flex items-center gap-1 mt-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${i < Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`}
                  />
                ))}
              </div>
              {reviewCount > 0 && <span className="text-[10px] text-muted-foreground">({reviewCount})</span>}
            </div>

          </div>
          <div className="flex flex-col items-end shrink-0">
            {(() => {
              // Dynamic Price Display Logic
              let displayPrice = product.price;
              let displaySalePrice = product.sale_price;

              if (product.stock_by_size && typeof product.stock_by_size === 'object' && selectedSize) {
                const val = product.stock_by_size[selectedSize];
                if (typeof val === 'object') {
                  // @ts-ignore
                  if (val.price) displayPrice = val.price;
                  // @ts-ignore
                  displaySalePrice = val.sale_price;
                }
              }

              return displaySalePrice ? (
                <>
                  <span className="font-bold text-lg whitespace-nowrap text-foreground">
                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(displaySalePrice)}
                  </span>
                  <span className="text-sm text-muted-foreground line-through decoration-muted-foreground/50">
                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(displayPrice)}
                  </span>
                </>
              ) : (
                <span className="font-bold text-lg whitespace-nowrap text-foreground">
                  {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(displayPrice)}
                </span>
              )
            })()}
          </div>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
      </div>
    </motion.div>
  )
}
