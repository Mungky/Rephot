// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

// Fungsi ini bikin Supabase client yang jalan di browser (frontend)
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}