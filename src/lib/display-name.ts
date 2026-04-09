import type { User } from '@supabase/supabase-js';

const FALLBACK = 'Pengguna';

/** Tampilan nama di navbar, footer app, dan profil — tidak boleh kosong/undefined. */
export function getDisplayName(user: User | null | undefined): string {
  if (!user) return FALLBACK;
  const full = user.user_metadata?.full_name;
  if (typeof full === 'string' && full.trim()) return full.trim();
  const local = user.email?.split('@')[0]?.trim();
  if (local) return local;
  return FALLBACK;
}

/** Sembunyikan form ubah password: login Google-only atau tidak ada identity email. */
export function isPasswordManagedByGoogle(user: User | null | undefined): boolean {
  if (!user) return true;
  if (user.app_metadata?.provider === 'google') return true;
  const hasEmailIdentity = user.identities?.some((i) => i.provider === 'email') ?? false;
  return !hasEmailIdentity;
}

export function hasGoogleIdentity(user: User | null | undefined): boolean {
  return user?.identities?.some((i) => i.provider === 'google') ?? false;
}
