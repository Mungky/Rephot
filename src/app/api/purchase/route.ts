import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    // 1. Verifikasi User (Yang beli harus udah login)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Login dulu bos.' }, { status: 401 })
    }

    // 2. Ambil data paket yang mau dibeli dari Frontend
    const body = await req.json()
    const { packageId } = body

    if (!packageId) {
      return NextResponse.json({ error: 'Package ID wajib dikirim' }, { status: 400 })
    }

    // 3. Cek harga asli paket dari Database kita (JANGAN PERCAYA HARGA DARI FRONTEND)
    const { data: tokenPackage, error: packageError } = await supabase
      .from('token_packages')
      .select('*')
      .eq('id', packageId)
      .single()

    if (packageError || !tokenPackage) {
      return NextResponse.json({ error: 'Paket tidak ditemukan' }, { status: 404 })
    }

    // 4. Hitung harga setelah diskon (kalau ada)
    const finalPrice = tokenPackage.price_idr - (tokenPackage.price_idr * (tokenPackage.discount_percent / 100))

    // 5. Tembak API Mayar buat bikin Payment Link (Contoh payload standar Mayar)
    const mayarApiKey = process.env.MAYAR_API_KEY!
    
    // Asumsi endpoint Mayar untuk create payment link (sesuaikan dengan dokumentasi asli Mayar nanti)
    const mayarResponse = await fetch('https://api.mayar.id/v1/payment/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mayarApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: user.user_metadata?.full_name || 'Customer Rephot',
        email: user.email,
        amount: finalPrice,
        description: `Pembelian Paket: ${tokenPackage.name} (${tokenPackage.tokens} Token)`,
        // Metadata ini PENTING buat webhook nanti, biar kita tahu siapa yang beli dan paket apa
        metadata: {
          user_id: user.id,
          package_id: tokenPackage.id,
          tokens_amount: tokenPackage.tokens
        }
      })
    })

    if (!mayarResponse.ok) {
      const errorData = await mayarResponse.json()
      console.error('Mayar Error:', errorData)
      throw new Error('Gagal membuat link pembayaran dari payment gateway')
    }

    const paymentData = await mayarResponse.json()

    // 6. Kembalikan link pembayaran ke Frontend biar user bisa langsung bayar
    return NextResponse.json({
      success: true,
      paymentUrl: paymentData.link // Asumsi Mayar nge-return field 'link'
    }, { status: 200 })

  } catch (error: any) {
    console.error('Purchase API Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Terjadi kesalahan saat memproses pembayaran.' 
    }, { status: 500 })
  }
}