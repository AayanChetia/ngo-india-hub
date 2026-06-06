import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

/**
 * Server-side registration. Creates the auth user with the service-role key
 * (auto-confirmed so the user can sign in immediately) and inserts the matching
 * public.users profile row with role 'user'. Runs server-side so the role can
 * never be tampered with from the browser and so it bypasses the users-table
 * RLS (which has no public INSERT policy).
 */
export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 }
    )
  }

  const { name, email, password } = parsed.data
  const admin = createAdminClient()

  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    })

  if (createError || !created.user) {
    const message = /already.+registered|already exists/i.test(
      createError?.message ?? ''
    )
      ? 'An account with this email already exists.'
      : (createError?.message ?? 'Could not create account')
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const { error: profileError } = await admin.from('users').insert({
    id: created.user.id,
    name,
    email,
    role: 'user',
  })

  if (profileError) {
    // Roll back the orphaned auth user so the email can be retried cleanly.
    await admin.auth.admin.deleteUser(created.user.id)
    return NextResponse.json(
      { error: 'Could not create profile. Please try again.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true })
}
