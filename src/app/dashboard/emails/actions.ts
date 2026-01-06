'use server'

import { createClient } from '@/lib/supabase/server';
import { sendReengagementEmail, sendNudgeEmail } from '@/lib/email';

export async function sendReengagementEmails() {
  const supabase = await createClient();
  
  // 1. Fetch users. 
  // For now: Fetch all users from profiles.
  const { data: profiles, error } = await supabase.from('profiles').select('id, full_name, email');
  
  if (error || !profiles) {
    console.error('Error fetching profiles', error);
    return { success: false, error: 'Could not fetch users' };
  }

  let sentCount = 0;
  const errors = [];

  for (const user of profiles) {
      if (!user.email) continue;
      
      const name = user.full_name || 'Cliente';
      const lang = 'es'; // Default to 'es' until we have a language column

      const result = await sendReengagementEmail(user.email, name, lang);
      
      if (!result.success) {
          errors.push({ email: user.email, error: result.error });
      } else {
          sentCount++;
      }
  }

  return { success: true, sent: sentCount, total: profiles.length, errors };
}

export async function sendNudgeEmails() {
    const supabase = await createClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();
  
    // 1. Fetch profiles
    const { data: profiles, error } = await supabase.from('profiles').select('id, full_name, email');
    
    if (error || !profiles) {
      return { success: false, error: 'Could not fetch users' };
    }

    // 2. Fetch users who have ordered (to exclude them)
    const { data: orders } = await supabase.from('orders').select('user_id');
    const orderedUserIds = new Set(orders?.map(o => o.user_id) || []);
  
    let sentCount = 0;
    const errors = [];
  
    for (const userProfile of profiles) {
        if (!userProfile.email) continue;
        
        // Filter: Send ONLY to users who haven't ordered, BUT always include the current admin for testing.
        const hasOrdered = orderedUserIds.has(userProfile.id);
        const isAdmin = currentUser?.email === userProfile.email;

        // If they ordered and are NOT the admin, skip.
        if (hasOrdered && !isAdmin) {
            continue;
        }
        
        // Smart Name: Use full_name, or split email (e.g. "alexis" from "alexis@...")
        let name = userProfile.full_name;
        if (!name) {
            const emailName = userProfile.email.split('@')[0];
            // Capitalize first letter
            name = emailName.charAt(0).toUpperCase() + emailName.slice(1);
        }

        const lang = 'es';

        const result = await sendNudgeEmail(userProfile.email, name, lang);
        
        if (!result.success) {
            errors.push({ email: userProfile.email, error: result.error });
        } else {
            sentCount++;
        }
    }
  
    return { success: true, sent: sentCount, total: profiles.length, errors };
}
