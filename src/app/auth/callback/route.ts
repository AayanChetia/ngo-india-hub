import { NextResponse, type NextRequest } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

/**
 * OAuth / PKCE callback. Exchanges the auth code for a session (which sets the
 * auth cookies via the server client) and ensures a public.users profile row
 * exists for the signed-in user. Then redirects to ?redirect or /profile.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const redirectTo = searchParams.get('redirect') ?? '/profile'

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=oauth`)
  }

  const supabase = createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=oauth`)
  }

  // First-time OAuth users won't have a public.users row yet — create one.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const admin = createAdminClient()
    const { data: existing } = await admin
      .from('users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (!existing) {
      await admin.from('users').insert({
        id: user.id,
        name:
          (user.user_metadata?.name as string | undefined) ??
          (user.user_metadata?.full_name as string | undefined) ??
          null,
        email: user.email ?? null,
        role: 'user',
      })
    }
  }

  return NextResponse.redirect(`${origin}${redirectTo}`)
}
