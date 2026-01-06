'use server'

import { createClient } from '@/lib/supabase/server'

export async function subscribeToNewsletter(formData: FormData) {
  const email = formData.get('email') as string

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'newsletter.error.invalid_email' }
  }

  const supabase = await createClient()

  // Try to insert
  const { error } = await supabase
    .from('newsletter_subscribers')
    .insert({ email })

  if (error) {
    if (error.code === '23505') { // Unique violation
      return { error: 'newsletter.error.already_subscribed' }
    }
    return { error: 'newsletter.error.failed' }
  }

  return { success: true }
}
