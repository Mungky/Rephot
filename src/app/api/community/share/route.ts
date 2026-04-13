import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function getAdminSupabase() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

type RpcResult = {
  ok?: boolean
  code?: string
}

function parseRpcResult(data: unknown): RpcResult | null {
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return data as RpcResult
  }
  if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
    const row = data[0] as Record<string, unknown>
    const v = row.claim_community_share_reward ?? row
    if (v && typeof v === 'object') return v as RpcResult
  }
  return null
}

export async function POST(req: Request) {
  try {
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
      return NextResponse.json({ error: 'Body JSON tidak valid' }, { status: 400 })
    }

    const generationId =
      body &&
      typeof body === 'object' &&
      typeof (body as { generation_id?: unknown }).generation_id === 'string'
        ? (body as { generation_id: string }).generation_id.trim()
        : ''

    if (!generationId || !UUID_RE.test(generationId)) {
      return NextResponse.json(
        { error: 'generation_id wajib berupa UUID yang valid' },
        { status: 400 }
      )
    }

    const admin = getAdminSupabase()

    const { data: rpcData, error: rpcError } = await admin.rpc(
      'claim_community_share_reward',
      {
        p_generation_id: generationId,
        p_user_id: user.id,
      }
    )

    if (rpcError) {
      console.error('[community/share] RPC error:', rpcError)
      return NextResponse.json(
        { error: 'Gagal memproses share. Pastikan migrasi database sudah dijalankan.' },
        { status: 500 }
      )
    }

    const result = parseRpcResult(rpcData)
    if (!result || typeof result.ok !== 'boolean') {
      console.error('[community/share] Unexpected RPC payload:', rpcData)
      return NextResponse.json({ error: 'Respons server tidak dikenali' }, { status: 500 })
    }

    if (!result.ok) {
      switch (result.code) {
        case 'NOT_FOUND':
          return NextResponse.json({ error: 'Generasi tidak ditemukan' }, { status: 404 })
        case 'FORBIDDEN':
          return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
        case 'NOT_COMPLETED':
          return NextResponse.json(
            { error: 'Hanya foto yang sudah selesai (completed) yang bisa dibagikan.' },
            { status: 400 }
          )
        case 'ALREADY_SHARED':
          return NextResponse.json(
            { error: 'Foto ini sudah dibagikan sebelumnya' },
            { status: 400 }
          )
        default:
          return NextResponse.json({ error: 'Permintaan ditolak' }, { status: 400 })
      }
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (e) {
    console.error('[community/share]', e)
    return NextResponse.json({ error: 'Kesalahan server' }, { status: 500 })
  }
}
