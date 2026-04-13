'use client'

import { useEffect, useCallback, useState } from 'react'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { Download, Trash2, X } from 'lucide-react'

export type LibraryDetailItem = {
  id: string
  style: string
  prompt_used: string | null
  status: string
  created_at: string | null
  completed_at: string | null
  is_public?: boolean | null
}

type LibraryDetailModalProps = {
  item: LibraryDetailItem
  imageUrl: string | null
  onClose: () => void
  onDownload: () => void | Promise<void>
  onDelete: () => Promise<void>
  /** Dipanggil setelah share sukses (update list + saldo di parent). */
  onShareSuccess?: () => void
}

function formatWhen(iso: string | null): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('id-ID', {
      dateStyle: 'long',
      timeStyle: 'short',
    })
  } catch {
    return '—'
  }
}

type ToastState = { message: string; variant: 'success' | 'error' } | null

export function LibraryDetailModal({
  item,
  imageUrl,
  onClose,
  onDownload,
  onDelete,
  onShareSuccess,
}: LibraryDetailModalProps) {
  const isPublic = Boolean(item.is_public)
  const [shareConfirmOpen, setShareConfirmOpen] = useState(false)
  const [shareSubmitting, setShareSubmitting] = useState(false)
  const [toast, setToast] = useState<ToastState>(null)

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !shareConfirmOpen) onClose()
    },
    [onClose, shareConfirmOpen]
  )

  useEffect(() => {
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onKey])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 4200)
    return () => window.clearTimeout(t)
  }, [toast])

  const handleDelete = async () => {
    if (!confirm('Yakin ingin menghapus gambar ini? Tindakan ini tidak bisa dibatalkan.')) return
    await onDelete()
  }

  const canShareReward =
    item.status === 'completed' && Boolean(imageUrl) && !isPublic

  const runShare = async () => {
    setShareSubmitting(true)
    try {
      const res = await fetch('/api/community/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generation_id: item.id }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setToast({
          variant: 'error',
          message: data.error || 'Gagal membagikan. Coba lagi.',
        })
        return
      }
      setShareConfirmOpen(false)
      setToast({
        variant: 'success',
        message: '+1 token — foto sekarang di Community!',
      })
      onShareSuccess?.()
    } catch {
      setToast({ variant: 'error', message: 'Jaringan error. Coba lagi.' })
    } finally {
      setShareSubmitting(false)
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[300] flex items-end justify-center sm:items-center sm:p-4 bg-black/55 backdrop-blur-[2px]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="library-detail-title"
        onClick={onClose}
      >
        <div
          className="w-full max-h-[min(92dvh,900px)] sm:max-h-[90dvh] sm:max-w-3xl flex flex-col bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden transition-transform duration-200 ease-out"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex-none flex items-center justify-between gap-3 px-4 py-3 border-b border-neutral-100 bg-white">
            <h2 id="library-detail-title" className="text-base font-semibold text-neutral-900 truncate pr-2">
              Detail foto
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
              aria-label="Tutup"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
            <div className="flex flex-col md:flex-row md:items-stretch">
              <div className="w-full md:w-[min(48%,420px)] shrink-0 bg-neutral-100 flex items-center justify-center p-3 sm:p-4 md:min-h-[280px]">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={item.style}
                    className="max-h-[38vh] md:max-h-[min(52vh,480px)] w-full object-contain rounded-lg"
                    decoding="async"
                  />
                ) : (
                  <div className="flex min-h-[160px] w-full items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-4 text-center text-sm text-neutral-500">
                    {item.status === 'completed' ? 'Belum ada gambar output.' : `Status: ${item.status}`}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 flex flex-col gap-4 p-4 sm:p-5 border-t md:border-t-0 md:border-l border-neutral-100">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">Style</p>
                  <p className="mt-0.5 text-sm font-semibold text-neutral-900">{item.style}</p>
                </div>

                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">Dibuat</p>
                  <p className="mt-0.5 text-sm text-neutral-800">{formatWhen(item.created_at)}</p>
                  {item.completed_at && (
                    <p className="mt-1 text-xs text-neutral-500">
                      Selesai: {formatWhen(item.completed_at)}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">Prompt</p>
                  <p className="mt-1 max-h-36 overflow-y-auto rounded-lg border border-neutral-100 bg-neutral-50 px-3 py-2 text-sm text-neutral-700 whitespace-pre-wrap break-words">
                    {item.prompt_used?.trim() ? item.prompt_used.trim() : 'Tidak ada prompt tambahan.'}
                  </p>
                </div>

                <div className="mt-auto flex flex-col gap-3 pt-2">
                  <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={!imageUrl}
                      onClick={() => {
                        if (imageUrl) void onDownload()
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-medium text-neutral-900 shadow-sm hover:bg-neutral-50 disabled:pointer-events-none disabled:opacity-40 transition-colors"
                    >
                      <Download className="h-4 w-4 shrink-0" />
                      Unduh
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 shrink-0" />
                      Hapus
                    </button>
                  </div>

                  {isPublic ? (
                    <div
                      role="status"
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/90 px-3 py-2.5 text-sm font-medium text-emerald-800 opacity-90"
                    >
                      <span aria-hidden>✓</span>
                      Ada di Community
                    </div>
                  ) : canShareReward ? (
                    <button
                      type="button"
                      disabled={shareSubmitting}
                      onClick={() => setShareConfirmOpen(true)}
                      className="w-full rounded-xl border border-amber-200 bg-gradient-to-b from-amber-50 to-amber-100/80 px-3 py-2.5 text-sm font-semibold text-amber-950 shadow-sm hover:from-amber-100 hover:to-amber-100 disabled:opacity-60 transition-colors"
                    >
                      Bagikan &amp; Dapatkan +1 Token
                    </button>
                  ) : item.status === 'completed' && !imageUrl ? (
                    <p className="text-center text-xs text-neutral-500 sm:text-left">
                      Bagikan ke Community tersedia setelah ada gambar hasil.
                    </p>
                  ) : null}

                  <p className="text-center text-[11px] text-neutral-500 sm:text-left">
                    {isPublic
                      ? 'Foto ini tampil di halaman Community. Reward share sudah pernah dipakai untuk foto ini.'
                      : canShareReward
                        ? 'Satu kali reward +1 token per foto setelah dibagikan ke Community.'
                        : null}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog.Root open={shareConfirmOpen} onOpenChange={setShareConfirmOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-[400] bg-black/50 transition-opacity duration-200" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-[401] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xl duration-200">
            <AlertDialog.Title className="sr-only">Konfirmasi bagikan ke Community</AlertDialog.Title>
            <AlertDialog.Description asChild>
              <p className="text-sm font-medium leading-relaxed text-neutral-800">
                Bagikan ke Community? Foto ini akan bisa dilihat oleh publik dan kamu akan mendapatkan 1 Token
                gratis. Tindakan ini tidak dapat dibatalkan (You can&apos;t undo this action).
              </p>
            </AlertDialog.Description>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <AlertDialog.Cancel asChild>
                <button
                  type="button"
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-800 hover:bg-neutral-50 transition-colors"
                >
                  Batal
                </button>
              </AlertDialog.Cancel>
              <button
                type="button"
                disabled={shareSubmitting}
                onClick={() => void runShare()}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-neutral-900 px-4 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60 transition-colors"
              >
                {shareSubmitting ? 'Memproses…' : 'Lanjut'}
              </button>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>

      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 z-[450] max-w-[min(92vw,24rem)] -translate-x-1/2 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${
            toast.variant === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
          role="status"
        >
          {toast.message}
        </div>
      )}
    </>
  )
}
