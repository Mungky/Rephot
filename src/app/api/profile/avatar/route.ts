import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isCloudinaryConfigured, uploadAvatarImage } from '@/lib/cloudinary'
import { updateProfileAvatarUrl } from '@/lib/profile-db'

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

export async function POST(req: Request) {
  try {
    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        { error: 'Upload gambar belum dikonfigurasi di server.' },
        { status: 503 }
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Kirim field file (gambar).' }, { status: 400 })
    }

    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        { error: 'Format file tidak didukung. Gunakan JPEG, PNG, WebP, atau GIF.' },
        { status: 400 }
      )
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Ukuran file maksimal 5 MB.' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const avatar_url = await uploadAvatarImage(buffer, { userId: user.id })

    const { error: dbError } = await updateProfileAvatarUrl(supabase, user.id, avatar_url)

    if (dbError) {
      console.error('[profile/avatar]', dbError)
      return NextResponse.json(
        { error: 'Gagal menyimpan URL foto. Periksa tabel profiles dan RLS.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, avatar_url })
  } catch (e) {
    console.error('[profile/avatar]', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Gagal mengunggah foto.' },
      { status: 500 }
    )
  }
}
