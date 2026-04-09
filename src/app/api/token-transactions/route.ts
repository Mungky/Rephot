import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export type TokenTransactionRow = {
  id: string
  amount: number
  type: string
  description: string | null
  reference_id: string | null
  created_at: string | null
}

const PAGE = 1000

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const all: TokenTransactionRow[] = []
    let from = 0

    for (;;) {
      const { data, error } = await supabase
        .from('token_transactions')
        .select('id, amount, type, description, reference_id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, from + PAGE - 1)

      if (error) {
        console.error('[token-transactions]', error)
        return NextResponse.json({ error: 'Gagal memuat transaksi.' }, { status: 500 })
      }

      const batch = (data ?? []) as TokenTransactionRow[]
      all.push(...batch)
      if (batch.length < PAGE) break
      from += PAGE
    }

    return NextResponse.json({
      success: true,
      transactions: all,
    })
  } catch (e) {
    console.error('[token-transactions]', e)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
