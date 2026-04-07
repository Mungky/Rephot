import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function getAdminSupabase() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

type SubmitItem = {
  task_id?: string
  model?: string
  status?: string
  created_at?: string
  category?: string
  model_id?: string
  parameters?: Record<string, unknown>
}

type StatusData = {
  id?: string
  model?: string
  outputs?: string[]
  status?: string
  error?: string
  executionTime?: number
  timings?: { inference?: number }
  created_at?: string
}

/**
 * n8n → Supabase updates after Wavespeed Task Submit / Task Status.
 * POST JSON:
 * { "recordId": "<generations.id>", "phase": "submit" | "complete", "payload": { ... } }
 *
 * submit: payload = one item from WaveSpeed submit output (task_id, model, parameters, …)
 * complete: payload = data object from getStatus (outputs, status, error, timings, …)
 */
export async function POST(req: Request) {
  const secret = req.headers.get('x-webhook-secret') || req.headers.get('X-Webhook-Secret')
  if (!process.env.N8N_WEBHOOK_SECRET || secret !== process.env.N8N_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { recordId?: string; phase?: string; payload?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const recordId = typeof body.recordId === 'string' ? body.recordId.trim() : ''
  const phase = typeof body.phase === 'string' ? body.phase.trim().toLowerCase() : ''

  if (!recordId || !phase) {
    return NextResponse.json({ error: 'recordId and phase are required' }, { status: 400 })
  }

  const admin = getAdminSupabase()

  if (phase === 'submit') {
    let item = (body.payload ?? {}) as SubmitItem | SubmitItem[]
    if (Array.isArray(item)) {
      item = (item[0] ?? {}) as SubmitItem
    }
    const taskId = typeof item.task_id === 'string' ? item.task_id : null
    if (!taskId) {
      return NextResponse.json({ error: 'payload.task_id required for submit phase' }, { status: 400 })
    }

    const { error } = await admin
      .from('generations')
      .update({
        wavespeed_task_id: taskId,
        wavespeed_submit: item as unknown as Record<string, unknown>,
      })
      .eq('id', recordId)

    if (error) {
      console.error('generation-wavespeed submit:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, phase: 'submit' })
  }

  if (phase === 'complete') {
    let raw = (body.payload ?? {}) as
      | (StatusData & { data?: StatusData })
      | (StatusData & { data?: StatusData })[]
    if (Array.isArray(raw)) {
      raw = (raw[0] ?? {}) as StatusData & { data?: StatusData }
    }
    const data =
      raw.data && typeof raw.data === 'object' ? raw.data : raw
    const wsStatus = (data.status || '').toLowerCase()

    if (wsStatus === 'completed' && Array.isArray(data.outputs) && data.outputs.length > 0) {
      const { error } = await admin
        .from('generations')
        .update({
          status: 'completed',
          output_images: data.outputs,
          wavespeed_status: data as unknown as Record<string, unknown>,
        })
        .eq('id', recordId)

      if (error) {
        console.error('generation-wavespeed complete:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, phase: 'complete', status: 'completed' })
    }

    if (wsStatus === 'failed' || data.error) {
      const { error } = await admin
        .from('generations')
        .update({
          status: 'failed',
          error_message: typeof data.error === 'string' ? data.error : 'Wavespeed task failed',
          wavespeed_status: data as unknown as Record<string, unknown>,
        })
        .eq('id', recordId)

      if (error) {
        console.error('generation-wavespeed failed:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, phase: 'complete', status: 'failed' })
    }

    // Still processing / created — only store latest status snapshot
    const { error } = await admin
      .from('generations')
      .update({
        wavespeed_status: data as unknown as Record<string, unknown>,
      })
      .eq('id', recordId)

    if (error) {
      console.error('generation-wavespeed status tick:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, phase: 'complete', status: 'snapshot' })
  }

  return NextResponse.json({ error: 'phase must be submit or complete' }, { status: 400 })
}
