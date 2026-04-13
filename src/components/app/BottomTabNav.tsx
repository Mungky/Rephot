'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export type AppMainTab = 'generate' | 'library'

type BottomTabNavProps = {
  /** Active tab when pathname is /app (ignored on /app/community). */
  mainTab: AppMainTab
}

export function BottomTabNav({ mainTab }: BottomTabNavProps) {
  const pathname = usePathname()
  const onCommunity = pathname === '/app/community'

  const pill = (active: boolean) =>
    `px-4 sm:px-6 py-1.5 rounded-full font-semibold text-sm transition-all whitespace-nowrap ${
      active
        ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-neutral-200/50 text-neutral-900'
        : 'text-neutral-500 hover:text-neutral-900 hover:bg-black/5 font-medium border border-transparent'
    }`

  return (
    <div className="w-full md:w-auto md:absolute md:left-1/2 md:-translate-x-1/2 flex items-center justify-center shrink-0 pointer-events-none">
      <div className="flex items-center justify-center gap-1 bg-neutral-100 p-1.5 rounded-full border border-neutral-200/60 shadow-inner overflow-x-auto pointer-events-auto max-w-full">
        <Link href="/app" className={pill(!onCommunity && mainTab === 'generate')}>
          Generate
        </Link>
        <Link href="/app?tab=library" className={pill(!onCommunity && mainTab === 'library')}>
          Library
        </Link>
        <Link href="/app/community" className={pill(onCommunity)}>
          Community
        </Link>
      </div>
    </div>
  )
}
