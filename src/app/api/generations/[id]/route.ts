import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function getAdminSupabase() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const isPublic =
      body &&
      typeof body === 'object' &&
      'is_public' in body &&
      typeof (body as { is_public: unknown }).is_public === 'boolean'
        ? (body as { is_public: boolean }).is_public
        : undefined

    if (typeof isPublic !== 'boolean') {
      return NextResponse.json(
        { error: 'Body must include is_public (boolean)' },
        { status: 400 }
      )
    }

    const admin = getAdminSupabase()

    const { data: row } = await admin
      .from('generations')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!row) {
      return NextResponse.json({ error: 'Not found or not yours' }, { status: 404 })
    }

    const { error: updateError } = await admin
      .from('generations')
      .update({ is_public: isPublic })
      .eq('id', id)

    if (updateError) throw updateError

    return NextResponse.json({ success: true, is_public: isPublic }, { status: 200 })
  } catch (error: unknown) {
    console.error('Patch generation error:', error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = getAdminSupabase()

    // Verify ownership first
    const { data: row } = await admin
      .from('generations')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!row) {
      return NextResponse.json({ error: 'Not found or not yours' }, { status: 404 })
    }

    const { error } = await admin
      .from('generations')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: unknown) {
    console.error('Delete generation error:', error)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
