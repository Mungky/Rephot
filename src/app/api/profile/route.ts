import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateProfileDisplayName } from '@/lib/profile-db'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('display_name, avatar_url')
      .eq('id', user.id)
      .maybeSingle()

    if (error) {
      console.error('[profile GET]', error)
      return NextResponse.json({ error: 'Gagal memuat profil.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      profile: profile ?? null,
    })
  } catch (e) {
    console.error('[profile GET]', e)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const body = (await req.json()) as { display_name?: unknown }
    if (!('display_name' in body)) {
      return NextResponse.json({ error: 'Field display_name wajib ada.' }, { status: 400 })
    }
    const raw = body.display_name
    const display_name =
      raw === null
        ? null
        : typeof raw === 'string'
          ? raw.trim() === ''
            ? null
            : raw.trim()
          : null

    const { error: dbError } = await updateProfileDisplayName(
      supabase,
      user.id,
      display_name
    )

    if (dbError) {
      console.error('[profile PATCH]', dbError)
      return NextResponse.json(
        { error: 'Gagal menyimpan nama. Pastikan tabel profiles dan RLS sudah benar.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('[profile PATCH]', e)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
