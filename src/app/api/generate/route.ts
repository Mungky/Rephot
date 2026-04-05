import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

// Inisialisasi Admin Client (Service Role) buat bypass RLS khusus potong token
const adminAuthClient = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Tangkap Payload dari Frontend
    const body = await req.json()
    const { imageUrl, style, category, prompt } = body

    if (!imageUrl || !style) {
      return NextResponse.json({ error: 'Image URL dan Style wajib diisi' }, { status: 400 })
    }

    // 2. Cek Saldo Token User
    const { data: transactions, error: balanceError } = await supabase
      .from('token_transactions')
      .select('amount')
      .eq('user_id', user.id)

    if (balanceError) throw balanceError

    const currentBalance = transactions.reduce((total, tx) => total + tx.amount, 0)
    if (currentBalance < 4) {
      return NextResponse.json({ error: 'Token tidak cukup. Silakan top up dulu.' }, { status: 402 }) // 402 Payment Required
    }

    // 3. Potong Saldo (-4 Token) pakai Admin Client
    const { error: deductError } = await adminAuthClient
      .from('token_transactions')
      .insert({
        user_id: user.id,
        amount: -4,
        type: 'generate',
        description: `Generate foto dengan style ${style}`
      })

    if (deductError) throw deductError

    // 4. Catat status 'pending' ke history generations
    const { data: genRecord, error: genError } = await supabase
      .from('generations')
      .insert({
        user_id: user.id,
        input_image_url: imageUrl,
        style: style,
        category: category || 'Tidak Terdeteksi',
        prompt_used: prompt || '',
        tokens_spent: 4,
        status: 'pending'
      })
      .select('id')
      .single()

    if (genError) {
      // Waduh gagal nyatet history, balikin tokennya! (Manual Rollback)
      await adminAuthClient.from('token_transactions').insert({
        user_id: user.id, amount: 4, type: 'refund', description: 'Refund: Sistem gagal mencatat history'
      })
      throw genError
    }

    // 5. Trigger n8n Webhook
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL!
    
    try {
      const n8nResponse = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generationId: genRecord.id, // Kasih ID ini ke n8n biar dia bisa update status nanti
          userId: user.id,
          imageUrl,
          style,
          prompt
        })
      })

      if (!n8nResponse.ok) {
        throw new Error('n8n Webhook gagal merespons')
      }
    } catch (n8nFetchError) {
      // 6. Kalau n8n down, refund token dan update status jadi failed
      console.error('n8n Trigger Error:', n8nFetchError)
      
      await adminAuthClient.from('token_transactions').insert({
        user_id: user.id, amount: 4, type: 'refund', description: 'Refund: Mesin AI sedang sibuk/down'
      })
      
      await adminAuthClient.from('generations').update({ status: 'failed' }).eq('id', genRecord.id)

      return NextResponse.json({ error: 'Mesin AI sedang sibuk, token sudah dikembalikan.' }, { status: 503 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Workflow berjalan! AI sedang memproses foto lo.',
      generationId: genRecord.id
    }, { status: 200 })

  } catch (error: any) {
    console.error('Generate API Error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan internal server' }, { status: 500 })
  }
}