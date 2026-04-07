import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Ctx = { params: Promise<{ id: string }> }

/**
 * GET one generation by UUID (must belong to the logged-in user).
 * Output URLs live in `output_images` (e.g. Wavespeed / CloudFront).
 */
export async function GET(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: row, error: dbError } = await supabase
      .from('generations')
      .select(
        'id, user_id, input_image_url, style, output_images, prompt_used, status, created_at, completed_at, aspect_ratio, resolution, wavespeed_task_id, error_message'
      )
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (dbError) throw dbError
    if (!row) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: row }, { status: 200 })
  } catch (error: unknown) {
    console.error('Generation GET Error:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data generasi.' },
      { status: 500 }
    )
  }
}
