'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BottomTabNav } from '@/components/app/BottomTabNav'
import { firstOutputImageUrl } from '@/lib/generation-preview'
import { getDisplayName } from '@/lib/display-name'
import { useUser } from '@/hooks/useUser'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export type CommunityItem = {
  id: string
  style: string
  output_images: unknown
  created_at: string | null
  userId: string
  authorName: string | null
}

function authorLabel(name: string | null): string {
  if (name && name.trim()) return name.trim()
  return 'Pengguna'
}

type CommunityGalleryProps = {
  initialItems: CommunityItem[]
}

export function CommunityGallery({ initialItems }: CommunityGalleryProps) {
  const { user } = useUser()
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const mobileDropdownRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [tokenBalance, setTokenBalance] = useState<number | null>(null)
  const [selected, setSelected] = useState<CommunityItem | null>(null)

  useEffect(() => {
    setMounted(true)
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node
      if (!dropdownRef.current?.contains(t) && !mobileDropdownRef.current?.contains(t)) {
        setIsProfileDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  useEffect(() => {
    fetch('/api/balance')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setTokenBalance(d.balance)
      })
      .catch(() => {})
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const onKeyModal = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setSelected(null)
  }, [])

  useEffect(() => {
    if (!selected) return
    window.addEventListener('keydown', onKeyModal)
    return () => window.removeEventListener('keydown', onKeyModal)
  }, [selected, onKeyModal])

  const itemsWithThumb = useMemo(
    () =>
      initialItems.filter((row) => {
        const url = firstOutputImageUrl(row.output_images)
        return Boolean(url)
      }),
    [initialItems]
  )

  return (
    <div className="flex flex-col h-screen bg-white text-neutral-900 font-sans overflow-hidden">
      <header className="flex-none flex items-center justify-between px-4 md:px-6 py-3.5 border-b border-neutral-200/80 bg-white/80 backdrop-blur-md z-20">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <img src="/RePhot.svg" alt="Rephot" className="h-6 w-auto invert" />
        </Link>
        <div className="flex items-center gap-4">
          <div className="md:hidden flex items-center gap-1.5 bg-amber-50 px-2.5 py-1.5 rounded-full border border-amber-200 shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-amber-500"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <span suppressHydrationWarning className="text-sm font-bold text-amber-600">
              {mounted ? (tokenBalance ?? '—') : '—'}
            </span>
          </div>
          <div className="md:hidden relative z-30 isolate" ref={mobileDropdownRef}>
            <button
              type="button"
              className="flex items-center cursor-pointer shrink-0 rounded-full"
              onClick={() => setIsProfileDropdownOpen((o) => !o)}
              aria-expanded={isProfileDropdownOpen}
            >
              {user?.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover border border-neutral-200 shadow-sm"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-neutral-200 border border-neutral-300 flex items-center justify-center text-xs font-bold text-neutral-600">
                  {user ? getDisplayName(user).charAt(0).toUpperCase() : '?'}
                </div>
              )}
            </button>
            {isProfileDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-xl py-1 z-[200]">
                <Link
                  href="/profile"
                  className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                  onClick={() => setIsProfileDropdownOpen(false)}
                >
                  Profil
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-neutral-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto bg-neutral-50/50 p-4 md:p-8 min-h-0">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 md:mb-8">
            <h1 className="text-xl md:text-2xl font-bold text-neutral-900">Community</h1>
            <p className="text-sm text-neutral-500 mt-1">
              Foto yang dipilih creator untuk ditampilkan ke publik.
            </p>
          </div>

          {itemsWithThumb.length === 0 ? (
            <p className="text-sm text-neutral-500">Belum ada foto publik. Aktifkan &quot;Make Public&quot; di Library.</p>
          ) : (
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 md:gap-4 [column-fill:_balance]">
              {itemsWithThumb.map((item) => {
                const thumb = firstOutputImageUrl(item.output_images)!
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelected(item)}
                    className="mb-3 md:mb-4 break-inside-avoid w-full text-left rounded-xl overflow-hidden bg-white border border-neutral-200 shadow-sm group focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20 focus-visible:ring-offset-2 transition-[transform,box-shadow] duration-300 ease-out hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="relative w-full overflow-hidden bg-neutral-100">
                      <Image
                        src={thumb}
                        alt={item.style}
                        width={480}
                        height={480}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="w-full h-auto object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="p-3 space-y-0.5">
                      <p className="text-xs font-semibold text-neutral-900 truncate">{item.style}</p>
                      <p className="text-[11px] text-neutral-500 truncate">{authorLabel(item.authorName)}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <div className="flex-none h-auto md:h-[72px] py-4 md:py-0 border-t border-neutral-200/80 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-40 flex flex-col md:flex-row items-center justify-center md:justify-between px-4 md:px-6 relative gap-4 md:gap-0">
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-amber-500"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <span suppressHydrationWarning className="text-sm font-bold text-amber-600">
              {mounted ? (tokenBalance ?? '—') : '—'}
            </span>
          </div>
          <Link
            href="/pricing"
            className="text-sm font-medium bg-[#0A0A0A] text-white px-5 py-1.5 rounded-full hover:bg-neutral-800 transition-colors shadow-sm"
          >
            Top Up
          </Link>
        </div>

        <BottomTabNav mainTab="generate" />

        <div className="hidden md:flex relative z-50 isolate pointer-events-auto" ref={dropdownRef}>
          <button
            type="button"
            className="flex items-center gap-3 cursor-pointer hover:bg-neutral-50 p-1 rounded-full pl-4 transition-colors border border-transparent hover:border-neutral-200"
            onClick={() => setIsProfileDropdownOpen((o) => !o)}
          >
            <span className="text-sm font-semibold text-neutral-800">
              {user ? getDisplayName(user) : 'Pengguna'}
            </span>
            {user?.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt=""
                className="w-9 h-9 rounded-full object-cover border border-neutral-200 shadow-sm"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-neutral-200 border border-neutral-300 flex items-center justify-center text-sm font-bold text-neutral-600">
                {user ? getDisplayName(user).charAt(0).toUpperCase() : 'P'}
              </div>
            )}
          </button>
          {isProfileDropdownOpen && (
            <div className="absolute bottom-full right-0 mb-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-xl py-1 z-[200]">
              <Link
                href="/profile"
                className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                onClick={() => setIsProfileDropdownOpen(false)}
              >
                Profil
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-neutral-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="community-modal-title"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-neutral-200 transition-transform duration-300 ease-out scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-neutral-900/80 text-white text-lg leading-none flex items-center justify-center hover:bg-neutral-900 transition-colors"
              onClick={() => setSelected(null)}
              aria-label="Tutup"
            >
              ×
            </button>
            <div className="p-4 md:p-6">
              <h2 id="community-modal-title" className="sr-only">
                Detail foto
              </h2>
              <div className="relative w-full rounded-xl overflow-hidden bg-neutral-100 border border-neutral-100">
                <Image
                  src={firstOutputImageUrl(selected.output_images)!}
                  alt={selected.style}
                  width={900}
                  height={900}
                  className="w-full h-auto max-h-[70vh] object-contain"
                  priority
                />
              </div>
              <div className="mt-4 space-y-1">
                <p className="text-sm font-semibold text-neutral-900">{selected.style}</p>
                <p className="text-sm text-neutral-600">{authorLabel(selected.authorName)}</p>
                {selected.created_at && (
                  <p className="text-xs text-neutral-400">
                    {new Date(selected.created_at).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
