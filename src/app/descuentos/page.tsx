import React from 'react'
import { createClient } from '@supabase/supabase-js'
import DiscountsClient from './DiscountsClient'
import { Product } from '@/store/useCartStore'

// Cache discounts for short duration to ensure high performance
export const revalidate = 60;

export default async function DiscountsPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )

  let products: Product[] = []
  
  try {
    const { data } = await supabase
      .from('products')
      .select('*')
      .not('sale_price', 'is', null)
      .gt('sale_price', 0)
    
    if (data) {
        // Filter strictly valid discounts in JS as well to be safe
       products = (data as Product[]).filter(p => (p.sale_price || 0) < p.price)
    }
  } catch (error) {
    console.error('SSR Error fetching discounts:', error)
  }

  return <DiscountsClient products={products} />
}
