'use client'

import { useEffect, useState, useRef } from 'react' // ref imported
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<string | null>(null)
  const lastUserId = useRef<string | undefined>(undefined)
  const router = useRouter()

  useEffect(() => {
    // 1. Check active session immediately
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        const { data, error } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()

        if (error) {
          if (error.code !== 'PGRST116') {
            console.error('Error fetching role:', error.message)
          }
        } else {
          // console.log('Role fetched:', data?.role)
        }

        const normalizedRole = data?.role?.toLowerCase() || 'user'
        setRole(normalizedRole)
      }
      setLoading(false)
    }
    initSession()

    // 2. Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUserId = session?.user?.id
        const previousUserId = lastUserId.current

        setSession(session)
        setUser(session?.user ?? null)

        // Update role if user exists
        if (session?.user) {
          /* ... existing role logic ... */
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single()

          if (error && error.code !== 'PGRST116') {
            console.error('Error updating role:', error.message)
          }

          const normalizedRole = data?.role?.toLowerCase() || 'user'
          setRole(normalizedRole)
        } else {
          setRole(null)
        }

        setLoading(false)

        // Only refresh if the user changed (Login/Logout) to avoid disrupting re-auth flows
        if (_event === 'SIGNED_IN') {
          if (currentUserId !== previousUserId) {
            router.refresh()
          }
        }

        lastUserId.current = currentUserId
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/ingresar')
  }

  return {
    user,
    role,
    session,
    loading,
    signOut,
  }
}
