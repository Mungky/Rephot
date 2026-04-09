import type { SupabaseClient } from '@supabase/supabase-js'

/** Update atau insert baris profil tanpa menimpa kolom lain saat partial update. */
export async function updateProfileDisplayName(
  supabase: SupabaseClient,
  userId: string,
  display_name: string | null
) {
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle()

  const now = new Date().toISOString()

  if (existing) {
    return supabase
      .from('profiles')
      .update({ display_name, updated_at: now })
      .eq('id', userId)
  }

  return supabase.from('profiles').insert({
    id: userId,
    display_name,
    updated_at: now,
  })
}

export async function updateProfileAvatarUrl(
  supabase: SupabaseClient,
  userId: string,
  avatar_url: string | null
) {
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle()

  const now = new Date().toISOString()

  if (existing) {
    return supabase
      .from('profiles')
      .update({ avatar_url, updated_at: now })
      .eq('id', userId)
  }

  return supabase.from('profiles').insert({
    id: userId,
    avatar_url,
    updated_at: now,
  })
}
