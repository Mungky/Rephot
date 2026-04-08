import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function getAdminSupabase() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
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
