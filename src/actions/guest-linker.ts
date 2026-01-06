'use server'

import { createClient } from '@/lib/supabase/server'

export async function linkGuestOrders(email: string, orderIds?: string[]) {
  const supabase = await createClient()
  
  // We need to fetch the user to get the ID securely on server side
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user || !user.email) return
  if (user.email !== email) {
      console.warn('Security Warning: User email does not match provided email for linking.')
      return
  }

  // Use Admin Client to update orders
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const supabaseAdmin = (await import('@supabase/supabase-js')).createClient(supabaseUrl, supabaseKey);

  // 1. Link by Email (Existing)
  const { error: rpcError } = await supabaseAdmin.rpc('link_guest_orders', { 
      p_email: email, 
      p_user_id: user.id 
  })

  if (rpcError) {
      // Fallback manual update by email
      await supabaseAdmin
        .from('orders')
        .update({ user_id: user.id })
        .eq('customer_email', email)
        .is('user_id', null)
  }

  // 2. Link by ID (New - from LocalStorage)
  if (orderIds && orderIds.length > 0) {
      // Security: Only link orders that have NO user_id (truly guest orders)
      const { error: idLinkError } = await supabaseAdmin
          .from('orders')
          .update({ user_id: user.id })
          .in('id', orderIds)
          .is('user_id', null)
      
      if (idLinkError) {
          console.error('Error linking guest orders by ID:', idLinkError)
      } else {
          console.log(`Linked guest orders by ID: ${orderIds.length} orders processed`)
      }
  }
}

