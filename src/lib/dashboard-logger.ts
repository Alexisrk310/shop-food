import { createClient } from './supabase/server'

export type ActivityType = 
  | 'ORDER_UPDATE' 
  | 'USER_UPDATE' 
  | 'PRODUCT_UPDATE' 
  | 'NEW_ORDER'
  | 'NEW_REVIEW'
  | 'SYSTEM'

export async function logActivity(
  actionType: ActivityType, 
  description: string, 
  metadata: any = {}
) {
  try {
    const supabase = await createClient()
    
    // Get current user (actor)
    const { data: { user } } = await supabase.auth.getUser()
    
    // Get detailed profile for name
    let actorName = 'System'
    let actorEmail = 'system@nomadastore.com'

    if (user) {
        actorEmail = user.email || 'unknown'
        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
        actorName = profile?.full_name || user.email?.split('@')[0] || 'Unknown'
    }

    // Insert Activity
    const { error } = await supabase.from('dashboard_activities').insert({
        action_type: actionType,
        description,
        metadata,
        actor_name: actorName,
        actor_email: actorEmail,
        read: false
    })

    if (error) {
        console.error('Failed to log activity:', error)
    }

  } catch (err) {
    console.error('Exception logging activity:', err)
  }
}
