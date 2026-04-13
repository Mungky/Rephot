/**
 * Origin situs untuk redirect Supabase (reset password, OAuth, dll).
 * Set NEXT_PUBLIC_SITE_URL di production (mis. https://rephot.id).
 */
export function getSiteOrigin(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  const fromEnv =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '').trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '').trim();
  if (fromEnv) return fromEnv;
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, '')}`;
  }
  return 'http://localhost:3000';
}

const UPDATE_PW_PATH = '/update-password';
const CONFIRM_PATH = '/auth/confirm';

/**
 * `redirectTo` untuk resetPasswordForEmail → `/auth/confirm?next=/update-password`.
 * Route `app/auth/confirm` memanggil verifyOtp({ token_hash, type }) — tanpa PKCE verifier.
 *
 * Supabase Dashboard → Authentication → Email templates → "Reset password":
 * ganti isi tautan menjadi (satu baris href):
 *
 *   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=%2Fupdate-password
 *
 * Authentication → URL Configuration → Redirect URLs: tambahkan
 *   https://photo.restard.org/auth/confirm
 *   http://localhost:3000/auth/confirm
 */
export function getUpdatePasswordCallbackUrl(): string {
  const nextParam = `next=${encodeURIComponent(UPDATE_PW_PATH)}`;

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isLocal = host === 'localhost' || host === '127.0.0.1';
    const envBase =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '').trim() ||
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '').trim();

    let origin: string;
    if (isLocal) {
      origin = window.location.origin;
    } else if (envBase) {
      origin = envBase;
    } else {
      origin = window.location.origin;
    }
    return `${origin}${CONFIRM_PATH}?${nextParam}`;
  }

  return `${getSiteOrigin()}${CONFIRM_PATH}?${nextParam}`;
}
