import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sanitizeNextPath } from '@/lib/safe-redirect'

/**
 * Verifikasi link email (recovery, signup, dll.) via token_hash — tanpa PKCE verifier,
 * sehingga link bisa dibuka dari perangkat/browser berbeda dari tempat reset diminta.
 * Template email di Supabase harus memakai URL ke route ini (bukan {{ .ConfirmationURL }} PKCE).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = sanitizeNextPath(searchParams.get('next'), '/update-password')

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/forgot-password?error=link_invalid`)
}
