'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import ProductCard from '@/features/store/components/ProductCard'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function FavoritesPage() {
    const { user, loading: authLoading } = useAuth()
    const [favorites, setFavorites] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return

        const fetchFavorites = async () => {
            const { data, error } = await supabase
                .from('favorites')
                .select('*')
                .eq('user_id', user.id)

            if (data) {
                // If product_data is stored, use it. Otherwise we'd need to fetch from products table.
                // Assuming we stored simple JSON snapshots or we can map IDs to mock data if static.
                // For now, let's assume we rely on the product_data snapshot we started saving.
                // Or fell back to fetching fresh product data.

                // Let's rely on product_data being present for simplicity in this demo, 
                // or mapped from our static list if we were fully static.
                // Since this is a hybrid, let's assume product_data holds the display info.
                const formattedItems = data.map(item => ({
                    ...item.product_data,
                    id: item.product_id // Ensure ID matches
                })).filter(item => item && item.name) // Filter invalid

                setFavorites(formattedItems)
            }
            setLoading(false)
        }

        fetchFavorites()
    }, [user])

    if (authLoading || loading) {
        return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin w-10 h-10 text-primary" /></div>
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-3xl font-bold mb-4">Favoritos</h1>
                <p className="text-muted-foreground mb-8 text-lg">Inicia sesión para ver tus favoritos</p>
                <Link href="/ingresar" className="bg-primary text-white px-8 py-3 rounded-xl font-medium">
                    Iniciar Sesión
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background pt-24 pb-12 px-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold mb-12 flex items-center gap-3">
                    <span className="text-red-500">❤️</span> Mis Favoritos
                </h1>

                {favorites.length === 0 ? (
                    <div className="text-center py-20 bg-card/30 rounded-3xl border border-white/5">
                        <p className="text-xl text-muted-foreground mb-6">No tienes favoritos aún</p>
                        <Link href="/shop" className="text-primary hover:underline">
                            Explorar la tienda
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {favorites.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
