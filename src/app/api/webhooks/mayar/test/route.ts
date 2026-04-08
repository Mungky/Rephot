import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function getAdminSupabase() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * GET /api/webhooks/mayar/test?email=user@example.com&tokens=20
 *
 * Manually credit tokens for debugging. Only works if the caller
 * provides the correct admin secret via ?secret= parameter.
 * DELETE THIS ROUTE BEFORE GOING TO PRODUCTION.
 */
export async function GET(req: Request) {
  const url = new URL(req.url)
  const secret = url.searchParams.get('secret')

  if (secret !== process.env.N8N_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const email = url.searchParams.get('email')
  const tokens = parseInt(url.searchParams.get('tokens') || '0')

  if (!email || !tokens) {
    return NextResponse.json({ error: 'Provide ?email=...&tokens=...' }, { status: 400 })
  }

  const admin = getAdminSupabase()

  const { data } = await admin.auth.admin.listUsers()
  const match = data?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase())

  if (!match) {
    return NextResponse.json({ error: `No user found with email: ${email}`, users: data?.users?.map(u => u.email) }, { status: 404 })
  }

  const { error } = await admin
    .from('token_transactions')
    .insert({
      user_id: match.id,
      amount: tokens,
      type: 'purchase',
      description: `[TEST] Manual top up ${tokens} tokens`,
    })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    userId: match.id,
    email: match.email,
    tokensAdded: tokens,
  })
}
