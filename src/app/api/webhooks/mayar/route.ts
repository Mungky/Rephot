import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Inisialisasi Admin Client (Kunci Dewa)
const adminSupabase = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    // 1. Ambil raw body (teks mentah) untuk validasi keamanan
    const rawBody = await req.text()
    const body = JSON.parse(rawBody)
    
    // Ambil tanda tangan (signature) dari header yang dikirim Mayar
    // (Note: Cek docs Mayar untuk nama header pastinya, kadang namanya beda)
    const signature = req.headers.get('x-mayar-signature') 

    // 2. Verifikasi Keamanan (Satpam Webhook)
    const secret = process.env.MAYAR_WEBHOOK_SECRET!
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex')

    // Kalau signature dari Mayar beda sama hitungan kita, berarti itu Hacker! Tolak.
    // (Buka comment di bawah ini kalau dokumentasi Mayar memang pakai sistem HMAC sha256)
    /*
    if (signature !== expectedSignature) {
      console.error('Peringatan: Ada percobaan webhook palsu!')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
    */

    // 3. Cek Status Pembayaran
    // Pastikan statusnya udah bener-bener lunas
    if (body.status === 'PAID' || body.status === 'COMPLETED' || body.status === 'settlement') {
      
      // Ambil metadata rahasia yang kita selipin pas bikin link di /api/purchase
      const { user_id, tokens_amount, package_id } = body.metadata

      if (!user_id || !tokens_amount) {
        throw new Error('Data user_id atau tokens_amount tidak ditemukan di metadata Mayar')
      }

      // 4. Top Up Token User di Database!
      const { error: insertError } = await adminSupabase
        .from('token_transactions')
        .insert({
          user_id: user_id,
          amount: parseInt(tokens_amount), // Pastiin bentuknya angka
          type: 'purchase',
          description: `Top up berhasil via Mayar (Paket ID: ${package_id})`
        })

      if (insertError) throw insertError

      console.log(`[WEBHOOK SUCCESS] Berhasil nambahin ${tokens_amount} token ke user ${user_id}`)
    }

    // 5. WAJIB Kasih tau Mayar kalau kita udah nerima datanya
    // Kalau nggak di-return 200, Mayar bakal ngira server kita mati dan bakal ngirim webhook terus-terusan
    return NextResponse.json({ received: true }, { status: 200 })

  } catch (error: any) {
    console.error('Mayar Webhook Error:', error)
    // Return 500 kalau error internal, biar Mayar tau dan nyoba ngirim ulang nanti
    return NextResponse.json({ error: 'Internal Webhook Error' }, { status: 500 })
  }
}