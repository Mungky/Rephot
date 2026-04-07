import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import crypto from 'crypto'

function getAdminSupabase() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    const body = JSON.parse(rawBody)
    
    const signature = req.headers.get('x-mayar-signature') || req.headers.get('x-callback-signature') || ''

    const secret = process.env.MAYAR_WEBHOOK_SECRET!
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex')

    if (signature !== expectedSignature) {
      console.error('Webhook signature mismatch')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    if (body.status === 'PAID' || body.status === 'COMPLETED' || body.status === 'settlement') {
      
      const { user_id, tokens_amount, package_id } = body.metadata

      if (!user_id || !tokens_amount) {
        throw new Error('Data user_id atau tokens_amount tidak ditemukan di metadata Mayar')
      }

      const adminSupabase = getAdminSupabase()

      const transactionId = body.id || body.data?.id
      if (transactionId) {
        const { data: existing } = await adminSupabase
          .from('token_transactions')
          .select('id')
          .eq('reference_id', String(transactionId))
          .eq('type', 'purchase')
          .single()

        if (existing) {
          console.log('Duplicate webhook ignored:', transactionId)
          return NextResponse.json({ message: 'Already processed' })
        }
      }

      const { error: insertError } = await adminSupabase
        .from('token_transactions')
        .insert({
          user_id: user_id,
          amount: parseInt(tokens_amount),
          type: 'purchase',
          reference_id: transactionId ? String(transactionId) : undefined,
          description: `Top up berhasil via Mayar (Paket ID: ${package_id})`
        })

      if (insertError) throw insertError

      console.log(`[WEBHOOK SUCCESS] Berhasil nambahin ${tokens_amount} token ke user ${user_id}`)
    }

    return NextResponse.json({ received: true }, { status: 200 })

  } catch (error: unknown) {
    console.error('Mayar Webhook Error:', error)
    return NextResponse.json({ error: 'Internal Webhook Error' }, { status: 500 })
  }
}
