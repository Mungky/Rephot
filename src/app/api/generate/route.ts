import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import {
  isCloudinaryConfigured,
  uploadInputImage,
} from '@/lib/cloudinary'

const MAX_FILE_BYTES = 10 * 1024 * 1024

function getAdminSupabase() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function parseAspectRatio(v: unknown): string {
  return typeof v === 'string' && v.trim() ? v.trim() : '1:1'
}

function parseResolution(v: unknown): string {
  const s = typeof v === 'string' && v.trim() ? v.trim().toLowerCase() : '1k'
  return s
}

export async function POST(req: Request) {
  try {
    const n8nWebhookSecret = process.env.N8N_WEBHOOK_SECRET
    if (!n8nWebhookSecret) {
      return NextResponse.json(
        { error: 'Webhook secret is missing' },
        { status: 500 }
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString()
    const { count, error: rateLimitError } = await supabase
      .from('generations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', oneMinuteAgo)

    if (rateLimitError) throw rateLimitError
    if ((count ?? 0) >= 3) {
      return NextResponse.json(
        { error: 'Terlalu banyak request. Silakan tunggu 1 menit.' },
        { status: 429 }
      )
    }

    const contentType = req.headers.get('content-type') || ''

    let imageUrl: string | null = null
    let style: string
    let prompt: string
    let aspectRatio: string
    let resolution: string

    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData()
      const file = form.get('file')

      if (!(file instanceof File)) {
        return NextResponse.json({ error: 'Field "file" wajib di-upload' }, { status: 400 })
      }
      if (file.size > MAX_FILE_BYTES) {
        return NextResponse.json({ error: 'File maksimal 10MB' }, { status: 400 })
      }

      if (!isCloudinaryConfigured()) {
        return NextResponse.json(
          {
            error:
              'Upload gambar membutuhkan Cloudinary. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, dan CLOUDINARY_API_SECRET di .env.local.',
          },
          { status: 503 }
        )
      }

      const buf = Buffer.from(await file.arrayBuffer())
      style = String(form.get('style') || '').trim()
      prompt = String(form.get('prompt') || '')
      aspectRatio = parseAspectRatio(form.get('aspectRatio'))
      resolution = parseResolution(form.get('resolution'))

      try {
        imageUrl = await uploadInputImage(buf, { userId: user.id })
      } catch (uploadErr) {
        console.error('Cloudinary upload error:', uploadErr)
        const msg =
          uploadErr instanceof Error ? uploadErr.message : String(uploadErr)
        return NextResponse.json(
          {
            error: 'Gagal mengunggah gambar ke Cloudinary.',
            ...(process.env.NODE_ENV === 'development' && { details: msg }),
          },
          { status: 502 }
        )
      }
    } else {
      const body = (await req.json()) as Record<string, unknown>
      const rawUrl = body.imageUrl
      imageUrl =
        typeof rawUrl === 'string' && rawUrl.trim() ? rawUrl.trim() : null
      style = typeof body.style === 'string' ? body.style.trim() : ''
      prompt = typeof body.prompt === 'string' ? body.prompt : ''
      aspectRatio = parseAspectRatio(body.aspectRatio)
      resolution = parseResolution(body.resolution)
    }

    if (!style) {
      return NextResponse.json({ error: 'Style wajib diisi' }, { status: 400 })
    }

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Gambar wajib: upload file (multipart → Cloudinary) atau kirim imageUrl (JSON)' },
        { status: 400 }
      )
    }

    const { data: transactions, error: balanceError } = await supabase
      .from('token_transactions')
      .select('amount')
      .eq('user_id', user.id)

    if (balanceError) throw balanceError

    const currentBalance = transactions.reduce(
      (total: number, tx: { amount: number }) => total + tx.amount,
      0
    )
    if (currentBalance < 4) {
      return NextResponse.json(
        { error: 'Token tidak cukup. Silakan top up dulu.' },
        { status: 402 }
      )
    }

    const adminSupabase = getAdminSupabase()

    const { data: genRecord, error: genError } = await adminSupabase
      .from('generations')
      .insert({
        user_id: user.id,
        input_image_url: imageUrl,
        style,
        prompt_used: prompt || '',
        tokens_charged: 4,
        status: 'processing',
        aspect_ratio: aspectRatio,
        resolution,
      })
      .select('id')
      .single()

    if (genError) throw genError

    // type harus sesuai token_transactions_type_check di DB (mis. generate, purchase, welcome_bonus)
    const { error: deductError } = await adminSupabase
      .from('token_transactions')
      .insert({
        user_id: user.id,
        amount: -4,
        type: 'generate',
        description: 'Generate foto',
        reference_id: genRecord.id,
      })

    if (deductError) {
      console.error('Token deduction error:', deductError)
      await adminSupabase
        .from('generations')
        .update({
          status: 'failed',
          error_message: deductError.message,
        })
        .eq('id', genRecord.id)
      return NextResponse.json(
        { error: 'Gagal mencatat penggunaan token. Coba lagi.' },
        { status: 500 }
      )
    }

    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL!

    const webhookPayload: Record<string, unknown> = {
      recordId: genRecord.id,
      userId: user.id,
      style,
      prompt: prompt || '',
      aspectRatio,
      resolution,
    }

    webhookPayload.imageUrl = imageUrl

    try {
      const n8nResponse = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-secret': n8nWebhookSecret,
        },
        body: JSON.stringify(webhookPayload),
      })

      if (!n8nResponse.ok) {
        const errorBody = await n8nResponse.text()
        const snippet =
          errorBody.length > 800 ? `${errorBody.slice(0, 800)}…` : errorBody
        console.error(
          '[n8n webhook] HTTP',
          n8nResponse.status,
          n8nResponse.statusText,
          snippet || '(empty body)'
        )
        throw new Error(
          `n8n Webhook HTTP ${n8nResponse.status}: ${snippet || n8nResponse.statusText}`
        )
      }
    } catch (n8nFetchError) {
      console.error('n8n Trigger Error:', n8nFetchError)

      const { error: refundError } = await adminSupabase
        .from('token_transactions')
        .insert({
          user_id: user.id,
          amount: 4,
          type: 'generate',
          description: 'Refund - generate gagal',
          reference_id: genRecord.id,
        })
      if (refundError) {
        console.error('Token refund after n8n failure:', refundError)
      }

      await adminSupabase
        .from('generations')
        .update({ status: 'failed' })
        .eq('id', genRecord.id)

      const n8nDetails =
        n8nFetchError instanceof Error
          ? n8nFetchError.message
          : String(n8nFetchError)

      return NextResponse.json(
        {
          error: 'Mesin AI sedang sibuk. Coba lagi nanti.',
          ...(process.env.NODE_ENV === 'development' && { details: n8nDetails }),
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'AI sedang memproses foto lo.',
        generationId: genRecord.id,
      },
      { status: 200 }
    )
  } catch (error: unknown) {
    console.error('Generate API Error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    )
  }
}
