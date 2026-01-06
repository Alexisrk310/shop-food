'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

import { logActivity } from '@/lib/dashboard-logger'

export async function updateUserPassword(userId: string, newPassword: string) {
  try {
    // 1. Verify Requester Permissions (Must be Owner)
    const supabase = await createClient()
    const { data: { user: requester }, error: authError } = await supabase.auth.getUser()

    if (authError || !requester) {
      return { success: false, error: 'Unauthorized' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', requester.id)
      .single()

    if (profile?.role !== 'owner' && requester.user_metadata?.role !== 'owner') {
      return { success: false, error: 'Forbidden: Only owners can change passwords' }
    }

    // 2. Perform Admin Update
    const adminClient = createAdminClient()

    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    )

    if (updateError) {
      console.error('Error updating password:', updateError)
      return { success: false, error: updateError.message }
    }

    // 3. Log Activity
    await logActivity('USER_UPDATE', `Contraseña actualizada para usuario ${userId.slice(0, 8)}`, { target_user_id: userId })

    revalidatePath('/dashboard/users')
    return { success: true }

  } catch (error: any) {
    console.error('Exception in updateUserPassword:', error)
    return { success: false, error: error.message || 'Internal Server Error' }
  }
}

export async function updateUserRole(userId: string, newRole: 'user' | 'owner') {
  try {
    const supabase = await createClient()
    const { data: { user: requester } } = await supabase.auth.getUser()

    if (!requester) return { success: false, error: 'Unauthorized' }

    // Verify requester is owner
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', requester.id).single()
    if (profile?.role !== 'owner') return { success: false, error: 'Forbidden' }

    // Update Role
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)

    if (error) throw error

    // Log
    // Log
    const roleEs = newRole === 'owner' ? 'Propietario' : 'Usuario'
    await logActivity('USER_UPDATE', `Rol de usuario ${userId.slice(0, 8)} cambiado a ${roleEs}`, { target_user_id: userId, new_role: newRole })

    revalidatePath('/dashboard/users')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteUser(userId: string, email?: string) {
  try {
    const supabase = await createClient()
    const { data: { user: requester } } = await supabase.auth.getUser()

    if (!requester) return { success: false, error: 'Unauthorized' }

    // Verify requester is owner
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', requester.id).single()
    if (profile?.role !== 'owner') return { success: false, error: 'Forbidden' }

    // Determine email if not provided for logging (optional, could skip)
    const targetEmail = email || userId

    // Delete (using RPC or admin if available, assuming RPC based on previous code)
    const { error } = await supabase.rpc('delete_user_by_id', { user_id: userId })
    if (error) throw error

    // Log
    await logActivity('USER_UPDATE', `Usuario eliminado: ${targetEmail}`, { target_user_id: userId })

    revalidatePath('/dashboard/users')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
