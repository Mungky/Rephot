import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function getAdminSupabase() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Extract token count from Mayar productName.
 * Mayar sends names like "Rephot - 20 Token", "Rephot - 50 Token", etc.
 */
function resolveTokensFromProductName(name: string): number | null {
  const match = name.match(/(\d+)\s*token/i)
  if (match) return parseInt(match[1])
  return null
}

function resolveTokensFromPayload(body: Record<string, unknown>): number | null {
  const data = (body.data && typeof body.data === 'object') ? body.data as Record<string, unknown> : null

  // 1. Try metadata (API-created payments)
  if (body.metadata && typeof body.metadata === 'object') {
    const meta = body.metadata as Record<string, unknown>
    if (meta.tokens_amount) return parseInt(String(meta.tokens_amount))
  }
  if (typeof body.metadata === 'string') {
    try {
      const meta = JSON.parse(body.metadata) as Record<string, unknown>
      if (meta.tokens_amount) return parseInt(String(meta.tokens_amount))
    } catch { /* ignore */ }
  }

  // 2. Try productName — this is what Mayar payment links send
  const productName = String(data?.productName ?? body.productName ?? '')
  if (productName) {
    const fromName = resolveTokensFromProductName(productName)
    if (fromName) return fromName
  }

  // 3. Try link URL slug matching as last resort
  const SLUG_TO_TOKENS: Record<string, number> = {
    'starter-39405': 20,
    'rephot-50-token': 50,
    'rephot-100-token': 100,
    'rephot-250-token': 250,
  }
  const link = String(data?.link ?? body.link ?? '')
  for (const [slug, tokens] of Object.entries(SLUG_TO_TOKENS)) {
    if (link.includes(slug)) return tokens
  }

  return null
}

function resolveEmail(body: Record<string, unknown>): string | null {
  const data = (body.data && typeof body.data === 'object') ? body.data as Record<string, unknown> : null
  const candidates = [
    data?.customerEmail,
    data?.customer_email,
    data?.email,
    body.customerEmail,
    body.customer_email,
    body.customer && typeof body.customer === 'object'
      ? (body.customer as Record<string, unknown>).email
      : null,
  ]
  for (const c of candidates) {
    if (typeof c === 'string' && c.includes('@')) return c.toLowerCase().trim()
  }
  return null
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    const body = JSON.parse(rawBody)

    console.log('📩 [MAYAR] event:', body.event, '| data.status:', body.data?.status, '| productName:', body.data?.productName)

    // --- Signature verification ---
    // Mayar sends a plain token in x-callback-token, NOT an HMAC signature.
    const callbackToken = req.headers.get('x-callback-token') || ''
    const secret = process.env.MAYAR_WEBHOOK_SECRET

    if (!secret) {
      console.warn('⚠️ MAYAR_WEBHOOK_SECRET not set — skipping verification')
    } else if (callbackToken !== secret) {
      console.error('❌ Token mismatch. Got:', callbackToken.slice(0, 16) + '...')
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // --- Check if payment is successful ---
    const event = String(body.event ?? '')
    const dataStatus = String(body.data?.status ?? body.status ?? '')
    const isPaid =
      event === 'payment.received' ||
      event === 'payment.completed' ||
      ['SUCCESS', 'PAID', 'COMPLETED', 'settlement'].includes(dataStatus)

    if (!isPaid) {
      console.log('📩 [MAYAR] Skipped — event:', event, 'status:', dataStatus)
      return NextResponse.json({ received: true, skipped: true }, { status: 200 })
    }

    const adminSupabase = getAdminSupabase()

    // --- Idempotency check ---
    const transactionId = String(body.data?.id ?? body.data?.transactionId ?? body.id ?? '')
    if (transactionId) {
      const { data: existing } = await adminSupabase
        .from('token_transactions')
        .select('id')
        .eq('reference_id', transactionId)
        .eq('type', 'purchase')
        .maybeSingle()

      if (existing) {
        console.log('📩 [MAYAR] Duplicate ignored:', transactionId)
        return NextResponse.json({ message: 'Already processed' })
      }
    }

    // --- Resolve user ---
    let userId: string | null = null

    // Try metadata first (for API-created payments that include user_id)
    if (body.metadata && typeof body.metadata === 'object') {
      const meta = body.metadata as Record<string, unknown>
      if (typeof meta.user_id === 'string') userId = meta.user_id
    }
    if (!userId && typeof body.metadata === 'string') {
      try {
        const meta = JSON.parse(body.metadata) as Record<string, unknown>
        if (typeof meta.user_id === 'string') userId = meta.user_id
      } catch { /* ignore */ }
    }

    // Fallback: look up user by email from Mayar payload
    if (!userId) {
      const email = resolveEmail(body)
      console.log('📩 [MAYAR] Looking up user by email:', email)
      if (email) {
        const { data } = await adminSupabase.auth.admin.listUsers()
        const match = data?.users?.find(u => u.email?.toLowerCase() === email)
        if (match) userId = match.id
      }
    }

    if (!userId) {
      console.error('❌ [MAYAR] Cannot resolve user. email:', resolveEmail(body))
      return NextResponse.json({ error: 'Cannot identify user' }, { status: 400 })
    }

    // --- Resolve tokens ---
    const tokensAmount = resolveTokensFromPayload(body)
    if (!tokensAmount || tokensAmount <= 0) {
      console.error('❌ [MAYAR] Cannot resolve tokens. productName:', body.data?.productName)
      return NextResponse.json({ error: 'Cannot determine token amount' }, { status: 400 })
    }

    // --- Credit tokens ---
    const { error: insertError } = await adminSupabase
      .from('token_transactions')
      .insert({
        user_id: userId,
        amount: tokensAmount,
        type: 'purchase',
        reference_id: transactionId || undefined,
        description: `Top up ${tokensAmount} token via Mayar`,
      })

    if (insertError) throw insertError

    console.log(`✅ [MAYAR] +${tokensAmount} tokens → user ${userId} (tx: ${transactionId})`)
    return NextResponse.json({ received: true }, { status: 200 })

  } catch (error: unknown) {
    console.error('❌ [MAYAR] Webhook Error:', error)
    return NextResponse.json({ error: 'Internal Webhook Error' }, { status: 500 })
  }
}
