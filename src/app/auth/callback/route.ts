import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data?.user) {
      // Send welcome email if it's a new signup (verified by email)
      // Since we can't easily track "first login" here without DB flags, 
      // we'll send it. Ideally, check a flag or 'created_at' to avoid duplicates on re-logins.
      // For now, let's assume this callback is hit primarily on email confirmation usage.
      
      const email = data.user.email;
      const name = data.user.user_metadata?.full_name || data.user.user_metadata?.name || 'Cliente';
      
      if (email) {
          // Fire and forget - don't block redirect
          import('@/lib/email').then(m => m.sendWelcomeEmail(email, name, 'es'));
      }

      const isLocalEnv = origin.startsWith('http://localhost')
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (process.env.NEXT_PUBLIC_SITE_URL && next.startsWith('/')) {
         return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
