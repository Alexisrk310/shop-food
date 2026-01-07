'use client'

import React, { useState, useEffect } from 'react'
import { TbMeat, TbSausage, TbMilkshake, TbPizza } from 'react-icons/tb'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Filter, Ruler, Tag, DollarSign } from 'lucide-react'

export function Sidebar({ className = "" }: { className?: string }) {
    const router = useRouter()
    const searchParams = useSearchParams()


    const currentCategory = searchParams.get('category')
    const currentSize = searchParams.get('size')
    const currentMin = searchParams.get('minPrice')
    const currentMax = searchParams.get('maxPrice')

    const [minPrice, setMinPrice] = useState(currentMin || '')
    const [maxPrice, setMaxPrice] = useState(currentMax || '')

    // Update local state when URL changes (e.g. clear filters)
    useEffect(() => {
        setMinPrice(currentMin || '')
        setMaxPrice(currentMax || '')
    }, [currentMin, currentMax])

    const isActive = (type: 'category' | 'size', value: string) => {

        if (type === 'category') return currentCategory === value.toLowerCase()
        if (type === 'size') return currentSize === value
        return false
    }

    const updateFilter = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value) params.set(key, value)
        else params.delete(key)
        router.push(`/shop?${params.toString()}`)
    }

    const applyPrice = () => {
        const params = new URLSearchParams(searchParams.toString())
        if (minPrice) params.set('minPrice', minPrice)
        else params.delete('minPrice')

        if (maxPrice) params.set('maxPrice', maxPrice)
        else params.delete('maxPrice')

        router.push(`/shop?${params.toString()}`)
    }

    return (
        <aside className={`w-full space-y-4 h-fit ${className}`}>
            {/* Filters */}
            <div className="p-4 rounded-xl bg-card border border-border/50 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-2 mb-4 text-primary border-b border-border/50 pb-3">
                    <Filter className="w-4 h-4" />
                    <h3 className="font-bold text-sm uppercase tracking-wide">Filtros</h3>
                </div>

                <div className="space-y-6">
                    {/* Gender - Replaced with Category Type for Food maybe? Or just keep "Categorías" separate. 
                 User wants "Menús de comida". Gender might be irrelevant.
                 I'll keep specific "Categories" below and maybe remove Gender or repurpose it?
                 For now, let's keep it as is translated to avoid breaking logic, but hide it if needed?
                 However, clothing store had "Men/Women". Food store has "Burgers/Drinks".
                 I'll repurpose Gender to "Tipo" (Type) conceptually, but keep the key 'gender' for now to match backend URL params. 
                 Or better, just translate "Hombres" -> "Combo", "Mujeres" -> "Individual"? 
                 Let's stick to literal translation for now: Men -> Hombres (Wait, food doesn't have gender).
                 I will COMMENT OUT Gender section for now or remove it?
                 I'll remove it. Food doesn't use gender.
             */}
                    {/* Removed Gender Section */}

                    {/* Price Range */}
                    <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                            <DollarSign className="w-3 h-3" /> Precio
                        </h4>
                        <div className="flex flex-col gap-2 mb-2">
                            <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-[10px]">$</span>
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    className="w-full pl-4 pr-2 py-1.5 text-xs bg-muted/30 border border-border rounded-md focus:ring-1 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                />
                            </div>
                            <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-[10px]">$</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    className="w-full pl-4 pr-2 py-1.5 text-xs bg-muted/30 border border-border rounded-md focus:ring-1 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                />
                            </div>
                        </div>
                        <button
                            onClick={applyPrice}
                            className="w-full py-1.5 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider rounded-md hover:bg-primary/90 transition-colors"
                        >
                            Aplicar
                        </button>
                    </div>

                    {/* Sizes - Maybe "Combo Size"? Normal/Big? Or "Portion"?
                 I'll keep it as "Tamaño" (Size).
             */}
                    <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                            <Ruler className="w-3 h-3" /> Tamaño
                        </h4>
                        <div className="grid grid-cols-3 gap-1.5">
                            {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                                <button
                                    key={size}
                                    onClick={() => updateFilter('size', currentSize === size ? null : size)}
                                    className={`py-1 text-[10px] font-bold rounded-md border transition-all ${currentSize === size
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                                        }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Categories */}
                    <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                            <Tag className="w-3 h-3" /> Categorías
                        </h4>
                        <div className="flex flex-col gap-0.5">
                            {['Hamburguesas', 'Pizzas', 'Perros', 'Salchipapas', 'Bebidas', 'Adiciones'].map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => updateFilter('category', isActive('category', cat.toLowerCase()) ? null : cat.toLowerCase())}
                                    className={`block w-full text-left text-xs py-1.5 px-2 rounded-md transition-all ${isActive('category', cat.toLowerCase())
                                        ? 'bg-primary/10 text-primary font-bold translate-x-1'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Promo Banner Compact */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20 relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                <h4 className="font-bold text-sm mb-1 relative z-10">Combo Familiar</h4>
                <p className="text-xs text-muted-foreground mb-3 relative z-10 leading-tight">Lleva 4 hamburguesas y paga 3.</p>
                <Link href="/descuentos" className="text-[10px] font-bold uppercase tracking-wider text-primary hover:underline relative z-10">
                    Ver Combos &rarr;
                </Link>
            </div>
        </aside>
    )
}

function UserIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
    )
}
