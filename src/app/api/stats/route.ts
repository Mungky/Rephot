import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createAdminClient(url, key)
}

/**
 * Total foto digenerate (global): hitung baris token_transactions
 * yang mencatat pemotongan generate (amount -4), bukan per user login.
 */
export async function GET() {
  try {
    const admin = getAdminSupabase()
    if (!admin) {
      console.error('Stats API: missing SUPABASE_SERVICE_ROLE_KEY')
      return NextResponse.json({ total_generations: 0 })
    }

    const { count, error } = await admin
      .from('token_transactions')
      .select('*', { count: 'exact', head: true })
      .eq('amount', -4)
      .eq('type', 'generate')

    if (error) {
      console.error('Stats API:', error)
      return NextResponse.json({ total_generations: 0 })
    }

    return NextResponse.json({ total_generations: count ?? 0 })
  } catch (e) {
    console.error('Stats API:', e)
    return NextResponse.json({ total_generations: 0 })
  }
}
