import React from 'react'
import { createClient } from '@supabase/supabase-js'
import HomeClient from './HomeClient'
import { Product } from '@/store/useCartStore'

// Force dynamic rendering if we want fresh data on every request, 
// or let it cache if we want speed (revalidate: 60).
// For "New Arrivals", caching for a minute is efficient and fast.
export const revalidate = 60; 

export default async function HomePage() {
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
      .eq('is_new', true)
      .order('created_at', { ascending: false })
      .limit(8)
    
    if (data) {
      products = data as Product[]
    }
  } catch (error) {
    console.error('SSR Error fetching new arrivals:', error)
    // We swallow the error here to allow the page to render with empty products
    // The UI handles empty state gracefully
  }

  return <HomeClient products={products} />
}
