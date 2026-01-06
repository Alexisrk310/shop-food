'use client'

import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { linkGuestOrders } from '@/actions/guest-linker'

export function GuestLinker() {
  const { user } = useAuth()

  useEffect(() => {
    if (user && user.email) {
      const guestOrderIds = JSON.parse(localStorage.getItem('guest_orders') || '[]')
      
      // Trigger linking process
      linkGuestOrders(user.email, guestOrderIds)
        .then(() => {
            // Optional: Clear guest orders after linking attempt
            if (guestOrderIds.length > 0) {
                // We keep them for a moment or clear them. 
                // Clearing is safer to avoid re-linking overhead on every reload.
                localStorage.removeItem('guest_orders')
            }
        })
        .catch(console.error)
    }
  }, [user])


  return null
}
