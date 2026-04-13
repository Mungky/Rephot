import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { CommunityGallery, type CommunityItem } from './community-gallery'

function getAdminSupabase() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export default async function CommunityPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/?auth=1&next=/app/community')
  }

  const admin = getAdminSupabase()

  const { data: gens, error: genError } = await admin
    .from('generations')
    .select('id, style, output_images, created_at, user_id')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(120)

  if (genError) {
    console.error('Community fetch generations:', genError)
  }

  const rows = gens ?? []
  const userIds = [...new Set(rows.map((g) => g.user_id).filter(Boolean))] as string[]

  const nameByUser = new Map<string, string | null>()
  if (userIds.length > 0) {
    const { data: profs, error: profError } = await admin
      .from('profiles')
      .select('id, display_name')
      .in('id', userIds)

    if (profError) {
      console.error('Community fetch profiles:', profError)
    }
    for (const p of profs ?? []) {
      nameByUser.set(p.id, p.display_name ?? null)
    }
  }

  const initialItems: CommunityItem[] = rows.map((g) => ({
    id: g.id,
    style: g.style,
    output_images: g.output_images,
    created_at: g.created_at,
    userId: g.user_id,
    authorName: g.user_id ? nameByUser.get(g.user_id) ?? null : null,
  }))

  return <CommunityGallery initialItems={initialItems} />
}
