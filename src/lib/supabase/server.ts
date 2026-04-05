// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Fungsi ini bikin Supabase client yang jalan di server (API/Backend)
// Dia butuh akses ke cookies Next.js buat ngecek user lagi login atau nggak
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Error ini wajar kalau dipanggil dari Server Component yang sifatnya read-only
            // Kita abaikan saja karena handle session utamanya di Middleware nanti
          }
        },
      },
    }
  )
}