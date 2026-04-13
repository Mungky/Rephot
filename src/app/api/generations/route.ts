import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // 1. Verifikasi User Login
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Silakan login dulu.' }, { status: 401 })
    }

    // 2. Tarik history generations milik user ini, urutkan dari yang paling baru
    const { data: history, error: dbError } = await supabase
      .from('generations')
      .select(
        'id, input_image_url, style, output_images, prompt_used, status, created_at, completed_at, aspect_ratio, resolution, wavespeed_task_id, is_public'
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }) // Yang terbaru ada di atas

    if (dbError) throw dbError

    // 3. Kembalikan data ke frontend
    return NextResponse.json({
      success: true,
      data: history
    }, { status: 200 })

  } catch (error: any) {
    console.error('Generations API Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Gagal mengambil riwayat generasi foto.' 
    }, { status: 500 })
  }
}