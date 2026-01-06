'use client'

import { useEffect, useState } from 'react'
import { Star, User } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
// import { useLanguage } from '@/components/LanguageProvider'
import ReviewForm from './ReviewForm'

interface Review {
    id: string
    rating: number
    comment: string
    username: string
    created_at: string
    user_id: string
    reply?: string
    replied_at?: string
}

export default function ReviewsList({ productId }: { productId: string }) {
    // const { t } = useLanguage()
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)
    const [session, setSession] = useState<any>(null)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            if (session?.user) {
                checkPermission(session.user.id)
            } else {
                setPermissionError('not_logged_in')
                setCheckLoading(false)
            }
        })

        fetchReviews()
    }, [productId])

    // ... (keeping state)
    const [canReview, setCanReview] = useState(false)
    const [checkLoading, setCheckLoading] = useState(true)
    const [permissionError, setPermissionError] = useState<'not_logged_in' | 'no_purchase' | 'already_reviewed' | null>(null)

    const checkPermission = async (userId: string = session?.user?.id) => {
        if (!userId) return

        try {
            // 1. Check if already reviewed
            const { data: existingReview } = await supabase
                .from('reviews')
                .select('id')
                .eq('user_id', userId)
                .eq('product_id', productId)
                .eq('product_id', productId)
                .maybeSingle()

            if (existingReview) {
                setCanReview(false)
                setPermissionError('already_reviewed')
                setCheckLoading(false)
                return
            }

            // 2. Check for delivered purchase
            // Refactored to query 'orders' first (proven path) and filter in JS to avoid relationship errors
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select(`
                status,
                order_items:order_items!order_items_order_id_fkey (
                    product_id
                )
            `)
                .eq('user_id', userId)

            if (ordersError) {
                console.error('Error fetching orders for permission check:', ordersError)
            }

            // Case-insensitive check + Product Match
            const hasVerifiedPurchase = ordersData?.some((o: any) => {
                const status = o.status?.toLowerCase() || ''
                const isDelivered = ['delivered', 'entregado', 'completed'].includes(status)
                const hasProduct = o.order_items?.some((i: any) => i.product_id === productId)

                return isDelivered && hasProduct
            })

            if (hasVerifiedPurchase) {
                setCanReview(true)
                setPermissionError(null)
            } else {
                setCanReview(false)
                setPermissionError('no_purchase')
            }

        } catch (error) {
            console.error('Error checking permission:', error)
        } finally {
            setCheckLoading(false)
        }
    }

    const fetchReviews = async () => {
        try {
            const { data, error } = await supabase
                .from('reviews')
                .select('*')
                .eq('product_id', productId)
                .order('created_at', { ascending: false })

            if (error) throw error
            setReviews(data || [])
        } catch (error) {
            console.error('Error fetching reviews:', error)
        } finally {
            setLoading(false)
        }
    }

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : 0

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">

                {/* Reviews Summary & List */}
                <div className="flex-1 w-full space-y-6">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold">Reseñas</h2>
                        {reviews.length > 0 && (
                            <div className="flex items-center gap-2 bg-yellow-400/10 px-3 py-1 rounded-full border border-yellow-400/20">
                                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                <span className="font-bold text-lg">{averageRating}</span>
                                <span className="text-muted-foreground text-sm">({reviews.length})</span>
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2].map(i => (
                                <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
                            ))}
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="text-center py-12 bg-muted/30 rounded-xl border border-border border-dashed">
                            <p className="text-muted-foreground">No hay reseñas aún. ¡Sé el primero en opinar!</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {reviews.map((review) => (
                                <div key={review.id} className="bg-card border border-border p-5 rounded-xl space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                                <User className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">{review.username || 'Anónimo'}</p>
                                                <div className="flex gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-muted-foreground text-sm leading-relaxed">{review.comment}</p>

                                    {/* Admin Reply */}
                                    {review.reply && (
                                        <div className="mt-3 ml-4 p-3 bg-muted/50 rounded-lg border-l-2 border-primary text-sm">
                                            <p className="font-bold text-xs text-primary mb-1">Respuesta de ThunderShop</p>
                                            <p className="text-muted-foreground">{review.reply}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Review Form (Sidebar on desktop) */}
                <div className="w-full md:w-1/3">
                    {checkLoading ? (
                        <div className="h-40 bg-muted/30 rounded-xl animate-pulse" />
                    ) : canReview ? (
                        <ReviewForm productId={productId} onReviewSubmitted={() => { fetchReviews(); checkPermission(); }} />
                    ) : (
                        <div className="bg-muted/50 p-6 rounded-xl border border-border text-center">
                            <p className="mb-2 text-muted-foreground font-medium">
                                {permissionError === 'not_logged_in' && 'Inicia sesión para escribir una reseña'}
                                {permissionError === 'no_purchase' && 'Solo puedes reseñar productos que hayas comprado y recibido'}
                                {permissionError === 'already_reviewed' && 'Ya has escrito una reseña para este producto'}
                            </p>
                            {permissionError === 'not_logged_in' && (
                                <a href="/login" className="text-primary hover:underline text-sm font-bold">Iniciar Sesión</a>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}
