import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    // 1. Inisialisasi Supabase Server Client
    const supabase = await createClient()

    // 2. Cek siapa user yang lagi akses API ini dari session/cookies
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // Kalau gak ada user yang login, tolak aksesnya! (Penting buat security)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Harus login dulu.' }, { status: 401 })
    }

    // 3. Tarik semua transaksi milik user ini dari database
    const { data: transactions, error: dbError } = await supabase
      .from('token_transactions')
      .select('amount')
      .eq('user_id', user.id)

    if (dbError) throw dbError

    // 4. Kalkulasi Saldo (Tambahin semua angka di kolom amount)
    // Kalau ada top up (+20) dan pemakaian (-4), logic ini yang ngitung sisa saldonya
    const currentBalance = transactions.reduce((total, tx) => total + tx.amount, 0)

    // 5. Kembalikan hasilnya ke frontend
    return NextResponse.json({ 
      success: true,
      userId: user.id,
      balance: currentBalance 
    }, { status: 200 })

  } catch (error: any) {
    console.error('Balance API Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Waduh, gagal ngitung saldo nih.' 
    }, { status: 500 })
  }
}