import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import crypto from 'crypto'

function getAdminSupabase() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const SLUG_TO_TOKENS: Record<string, number> = {
  'starter-39405': 20,
  'rephot-50-token': 50,
  'rephot-100-token': 100,
  'rephot-250-token': 250,
}

function resolveTokensFromPayload(body: Record<string, unknown>): number | null {
  if (body.metadata && typeof body.metadata === 'object') {
    const meta = body.metadata as Record<string, unknown>;
    if (meta.tokens_amount) return parseInt(String(meta.tokens_amount));
  }
  if (typeof body.metadata === 'string') {
    try {
      const meta = JSON.parse(body.metadata) as Record<string, unknown>
      if (meta.tokens_amount) return parseInt(String(meta.tokens_amount))
    } catch { /* ignore */ }
  }

  const link = String(
    (body as Record<string, unknown>).link ??
    (body.data && typeof body.data === 'object' ? (body.data as Record<string, unknown>).link : '') ??
    ''
  );
  for (const [slug, tokens] of Object.entries(SLUG_TO_TOKENS)) {
    if (link.includes(slug)) return tokens;
  }

  const name = String(
    (body as Record<string, unknown>).productName ??
    (body.data && typeof body.data === 'object' ? (body.data as Record<string, unknown>).productName : '') ??
    ''
  ).toLowerCase();
  for (const [slug, tokens] of Object.entries(SLUG_TO_TOKENS)) {
    if (name.includes(slug)) return tokens;
  }

  return null;
}

function resolveEmail(body: Record<string, unknown>): string | null {
  const candidates = [
    (body as Record<string, unknown>).customerEmail,
    (body as Record<string, unknown>).customer_email,
    body.data && typeof body.data === 'object'
      ? (body.data as Record<string, unknown>).customerEmail ??
        (body.data as Record<string, unknown>).customer_email ??
        (body.data as Record<string, unknown>).email
      : null,
    body.customer && typeof body.customer === 'object'
      ? (body.customer as Record<string, unknown>).email
      : null,
    body.metadata && typeof body.metadata === 'object'
      ? (body.metadata as Record<string, unknown>).email
      : null,
  ];
  for (const c of candidates) {
    if (typeof c === 'string' && c.includes('@')) return c.toLowerCase().trim();
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    console.log('📩 [MAYAR WEBHOOK] Raw body length:', rawBody.length)
    console.log('📩 [MAYAR WEBHOOK] Body preview:', rawBody.slice(0, 800))
    console.log('📩 [MAYAR WEBHOOK] Headers:', JSON.stringify(Object.fromEntries(req.headers.entries())))

    const body = JSON.parse(rawBody)
    console.log('📩 [MAYAR WEBHOOK] Top-level keys:', Object.keys(body))
    if (body.event) console.log('📩 [MAYAR WEBHOOK] event:', body.event)
    if (body.data) console.log('📩 [MAYAR WEBHOOK] data keys:', Object.keys(body.data))

    const signature =
      req.headers.get('x-mayar-signature') ||
      req.headers.get('x-callback-signature') ||
      req.headers.get('x-signature') ||
      ''
    console.log('📩 [MAYAR WEBHOOK] Signature from header:', signature ? `${signature.slice(0, 20)}...` : '(empty)')

    const secret = process.env.MAYAR_WEBHOOK_SECRET
    if (!secret) {
      console.warn('⚠️ MAYAR_WEBHOOK_SECRET not set — skipping signature verification')
    } else {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex')

      if (signature !== expectedSignature) {
        console.error('❌ Webhook signature mismatch. Expected:', expectedSignature.slice(0, 20) + '...', 'Got:', signature.slice(0, 20) + '...')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
      console.log('✅ Signature verified')
    }

    const status = body.status || body.data?.status || body.event || ''
    console.log('📩 [MAYAR WEBHOOK] Resolved status:', status)
    const isPaid = ['PAID', 'COMPLETED', 'settlement', 'payment.received', 'payment.completed'].includes(status)

    if (!isPaid) {
      console.log('📩 [MAYAR WEBHOOK] Skipped — status not paid:', status)
      return NextResponse.json({ received: true, skipped: true }, { status: 200 })
    }
    console.log('📩 [MAYAR WEBHOOK] Status is PAID, processing...')

    const adminSupabase = getAdminSupabase()

    // Idempotency check
    const transactionId = body.id || body.data?.id
    if (transactionId) {
      const { data: existing } = await adminSupabase
        .from('token_transactions')
        .select('id')
        .eq('reference_id', String(transactionId))
        .eq('type', 'purchase')
        .maybeSingle()

      if (existing) {
        console.log('Duplicate webhook ignored:', transactionId)
        return NextResponse.json({ message: 'Already processed' })
      }
    }

    // Resolve user — try metadata.user_id first, then email lookup
    let userId: string | null = null

    if (body.metadata && typeof body.metadata === 'object') {
      const meta = body.metadata as Record<string, unknown>;
      if (typeof meta.user_id === 'string') userId = meta.user_id;
    }
    if (!userId && typeof body.metadata === 'string') {
      try {
        const meta = JSON.parse(body.metadata) as Record<string, unknown>
        if (typeof meta.user_id === 'string') userId = meta.user_id
      } catch { /* ignore */ }
    }

    if (!userId) {
      const email = resolveEmail(body)
      if (email) {
        const { data } = await adminSupabase.auth.admin.listUsers()
        const match = data?.users?.find(
          (u) => u.email?.toLowerCase() === email
        )
        if (match) userId = match.id
      }
    }

    console.log('📩 [MAYAR WEBHOOK] Resolved userId:', userId)
    if (!userId) {
      console.error('❌ Webhook: could not resolve user_id. Payload keys:', Object.keys(body), 'metadata:', JSON.stringify(body.metadata)?.slice(0, 200), 'email candidates:', resolveEmail(body))
      return NextResponse.json({ error: 'Cannot identify user' }, { status: 400 })
    }

    const tokensAmount = resolveTokensFromPayload(body)
    console.log('📩 [MAYAR WEBHOOK] Resolved tokensAmount:', tokensAmount)
    if (!tokensAmount || tokensAmount <= 0) {
      console.error('❌ Webhook: could not resolve token amount. Payload:', JSON.stringify(body).slice(0, 500))
      return NextResponse.json({ error: 'Cannot determine token amount' }, { status: 400 })
    }

    // Credit tokens
    const { error: insertError } = await adminSupabase
      .from('token_transactions')
      .insert({
        user_id: userId,
        amount: tokensAmount,
        type: 'purchase',
        reference_id: transactionId ? String(transactionId) : undefined,
        description: `Top up ${tokensAmount} token via Mayar`,
      })

    if (insertError) throw insertError

    console.log(`✅ [WEBHOOK SUCCESS] +${tokensAmount} tokens → user ${userId} (tx: ${transactionId})`)

    return NextResponse.json({ received: true }, { status: 200 })

  } catch (error: unknown) {
    console.error('Mayar Webhook Error:', error)
    return NextResponse.json({ error: 'Internal Webhook Error' }, { status: 500 })
  }
}
