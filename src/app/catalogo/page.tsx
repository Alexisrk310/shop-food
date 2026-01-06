import React from 'react'
import { createClient } from '@supabase/supabase-js'
import ShopClient from './ShopClient'
import { Product } from '@/store/useCartStore'

// Moderate caching of products list
export const revalidate = 60;

export default async function ShopPage() {
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
      // By default fetch all products without filters for SSR 
      // Client will handle specific filtering if params exist
    
    if (data) {
      products = data as Product[]
    }
  } catch (error) {
    console.error('SSR Error fetching shop products:', error)
  }

  return <ShopClient initialProducts={products} />
}
