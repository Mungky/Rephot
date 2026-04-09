'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { NavbarPublic } from '@/components/NavbarPublic';
import { useUser } from '@/hooks/useUser';
import { createClient } from '@/lib/supabase/client';
import { getDisplayName, isPasswordManagedByGoogle } from '@/lib/display-name';

type SaveStatus = 'idle' | 'loading' | 'success';

function useSectionSave() {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  const beginSave = useCallback(() => setStatus('loading'), []);
  const finishSuccess = useCallback(() => {
    setStatus('success');
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setStatus('idle'), 2000);
  }, []);
  const finishError = useCallback(() => setStatus('idle'), []);

  return { status, beginSave, finishSuccess, finishError };
}

function SaveButton({ status, hasChanges }: { status: SaveStatus; hasChanges: boolean }) {
  const label =
    status === 'loading' ? 'Menyimpan...' : status === 'success' ? 'Tersimpan ✓' : 'Simpan';
  const loading = status === 'loading';
  const success = status === 'success';
  const disabled = !hasChanges || loading || success;

  const base =
    'px-6 py-2.5 rounded-full text-sm font-medium transition-colors w-full sm:w-auto';
  const active = 'bg-[#0A0A0A] text-white enabled:hover:bg-neutral-800';
  const inactive = 'bg-neutral-200 text-neutral-400 cursor-not-allowed opacity-70';

  const className =
    !hasChanges && !loading && !success
      ? `${base} ${inactive}`
      : loading
        ? `${base} ${active} opacity-80 cursor-wait`
        : success
          ? `${base} ${active} cursor-default`
          : `${base} ${active}`;

  return (
    <button type="submit" disabled={disabled} className={className}>
      {label}
    </button>
  );
}

type TokenTx = {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  reference_id: string | null;
  created_at: string | null;
};

const DELETE_CONFIRM_PHRASE = 'HAPUS';

export default function ProfilePage() {
  const { user, loading } = useUser();
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  /** Nilai terakhir yang tersimpan — untuk deteksi perubahan */
  const [savedFullName, setSavedFullName] = useState('');
  const [savedAvatarUrl, setSavedAvatarUrl] = useState('');

  const profileSave = useSectionSave();

  const [pwdOpen, setPwdOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordHint, setPasswordHint] = useState<string | null>(null);
  const passwordSave = useSectionSave();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePhrase, setDeletePhrase] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [transactions, setTransactions] = useState<TokenTx[] | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPickError, setAvatarPickError] = useState<string | null>(null);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
    };
  }, [pendingPreviewUrl]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const meta = user.user_metadata ?? {};
    const metaName = typeof meta.full_name === 'string' ? meta.full_name : '';
    const metaAvatar = typeof meta.avatar_url === 'string' ? meta.avatar_url : '';

    (async () => {
      const res = await fetch('/api/profile');
      const data = await res.json();
      if (cancelled) return;
      setPendingAvatarFile(null);
      setPendingPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setAvatarPickError(null);

      let name = metaName;
      let av = metaAvatar;
      if (res.ok && data.profile) {
        const p = data.profile as { display_name?: string | null; avatar_url?: string | null };
        const dn = typeof p.display_name === 'string' && p.display_name.trim() ? p.display_name.trim() : '';
        const au = typeof p.avatar_url === 'string' && p.avatar_url.trim() ? p.avatar_url.trim() : '';
        name = dn || metaName;
        av = au || metaAvatar;
      }
      setFullName(name);
      setAvatarUrl(av);
      setSavedFullName(name.trim());
      setSavedAvatarUrl(av.trim());
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch('/api/token-transactions');
      const data = await res.json();
      if (cancelled) return;
      if (!res.ok) {
        setTxError(data.error || 'Gagal memuat transaksi.');
        setTransactions([]);
        return;
      }
      setTransactions(data.transactions ?? []);
      setTxError(null);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!pwdOpen && !deleteOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [pwdOpen, deleteOpen]);

  const onSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const nameDirty = fullName.trim() !== savedFullName;
    const photoDirty = pendingAvatarFile !== null;
    if (!nameDirty && !photoDirty) return;

    profileSave.beginSave();

    let finalAvatarUrl = avatarUrl.trim();

    if (pendingAvatarFile) {
      try {
        const fd = new FormData();
        fd.append('file', pendingAvatarFile);
        const upRes = await fetch('/api/profile/avatar', { method: 'POST', body: fd });
        const upData = await upRes.json();
        if (!upRes.ok) {
          setAvatarPickError(upData.error || 'Gagal mengunggah foto.');
          profileSave.finishError();
          return;
        }
        finalAvatarUrl = upData.avatar_url as string;
      } catch {
        setAvatarPickError('Jaringan bermasalah saat mengunggah.');
        profileSave.finishError();
        return;
      }
    }

    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ display_name: fullName.trim() || null }),
    });
    if (!res.ok) {
      profileSave.finishError();
      return;
    }

    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: fullName.trim() || undefined,
        avatar_url: finalAvatarUrl || undefined,
      },
    });
    if (error) {
      profileSave.finishError();
      return;
    }

    setPendingPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setPendingAvatarFile(null);
    setAvatarPickError(null);
    setAvatarUrl(finalAvatarUrl);
    setSavedFullName(fullName.trim());
    setSavedAvatarUrl(finalAvatarUrl.trim());
    profileSave.finishSuccess();
  };

  const onAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    setAvatarPickError(null);
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAvatarPickError('Pilih file gambar (JPEG, PNG, WebP, atau GIF).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarPickError('Ukuran maksimal 5 MB.');
      return;
    }
    setPendingPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setPendingAvatarFile(file);
  };

  const onSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordHint(null);
    if (newPassword !== confirmPassword) {
      setPasswordHint('Password dan konfirmasi tidak sama.');
      passwordSave.finishError();
      return;
    }
    if (newPassword.length < 6) {
      setPasswordHint('Password minimal 6 karakter.');
      passwordSave.finishError();
      return;
    }
    passwordSave.beginSave();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPasswordHint(error.message);
      passwordSave.finishError();
      return;
    }
    setNewPassword('');
    setConfirmPassword('');
    setPasswordHint(null);
    passwordSave.finishSuccess();
    setTimeout(() => setPwdOpen(false), 800);
  };

  const onDeleteAccount = async () => {
    if (deletePhrase.trim() !== DELETE_CONFIRM_PHRASE) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const res = await fetch('/api/account/delete', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setDeleteError(data.error || 'Gagal menghapus akun.');
        setDeleteLoading(false);
        return;
      }
      await supabase.auth.signOut();
      router.push('/');
    } catch {
      setDeleteError('Terjadi kesalahan jaringan.');
      setDeleteLoading(false);
    }
  };

  const labelClass = 'block text-xs font-semibold uppercase tracking-wider text-[#888888] mb-1.5 text-left';
  const inputClass =
    'w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-neutral-900/10 text-left';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] text-[#0A0A0A] font-['Outfit'] pb-20">
        <NavbarPublic />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-28">
          <div className="h-8 w-48 bg-neutral-200 rounded-lg animate-pulse mb-8" />
          <div className="h-48 bg-neutral-100 rounded-2xl animate-pulse" />
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] text-[#0A0A0A] font-['Outfit'] pb-20">
        <NavbarPublic />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 text-center">
          <p className="text-[#888888] mb-4">Silakan login untuk melihat profil.</p>
          <Link href="/?auth=1" className="text-[#0A0A0A] font-medium underline">
            Kembali ke beranda
          </Link>
        </main>
      </div>
    );
  }

  const showPassword = !isPasswordManagedByGoogle(user);
  const profileFormDirty =
    fullName.trim() !== savedFullName || pendingAvatarFile !== null;
  const avatarPreview =
    pendingPreviewUrl ||
    avatarUrl.trim() ||
    (typeof user.user_metadata?.avatar_url === 'string' ? user.user_metadata.avatar_url : '');
  const initialLetter = (fullName.trim() || getDisplayName(user)).charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-[#0A0A0A] font-['Outfit'] selection:bg-neutral-900 selection:text-white pb-20">
      <NavbarPublic />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        <div className="mb-8 text-left">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#888888] mb-2">Akun</p>
          <h1 className="font-['Bricolage_Grotesque'] text-3xl md:text-4xl font-extrabold tracking-tight">
            Profil
          </h1>
        </div>

        <div className="space-y-6">
          <form
            onSubmit={onSaveProfile}
            className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-8 shadow-sm"
          >
            <h2 className="text-lg font-bold font-['Bricolage_Grotesque'] text-left mb-6">
              Informasi akun
            </h2>

            <div className="flex flex-col lg:flex-row lg:gap-10 lg:items-start">
              <div className="flex-1 space-y-5 order-2 lg:order-1 min-w-0">
                <div>
                  <label className={labelClass} htmlFor="fullName">
                    Username
                  </label>
                  <input
                    id="fullName"
                    className={inputClass}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={getDisplayName(user)}
                    autoComplete="name"
                  />
                </div>
                <div>
                  <p className={labelClass}>Email</p>
                  <div
                    className="w-full rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-2.5 text-sm text-[#0A0A0A] text-left break-all"
                    title={user.email ?? ''}
                  >
                    {user.email ?? '—'}
                  </div>
                  <p className="text-xs text-[#888888] mt-1.5 text-left">Email tidak dapat diubah dari sini.</p>
                </div>

                <div className="pt-1 flex justify-start">
                  <SaveButton status={profileSave.status} hasChanges={profileFormDirty} />
                </div>
              </div>

              <div className="w-full max-w-[200px] sm:max-w-[220px] mx-auto lg:mx-0 shrink-0 order-1 lg:order-2 space-y-3">
                <p className={labelClass + ' lg:text-center'}>Foto profil</p>
                <div className="aspect-square w-full rounded-2xl border border-neutral-200 bg-neutral-100 overflow-hidden flex items-center justify-center">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-neutral-400">{initialLetter}</span>
                  )}
                </div>
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    onChange={onAvatarFile}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs sm:text-sm font-medium text-[#0A0A0A] hover:bg-neutral-50 transition-colors"
                  >
                    {pendingAvatarFile ? 'Ganti foto' : 'Pilih foto'}
                  </button>
                  <p className="text-[10px] sm:text-xs text-[#888888] text-center leading-snug">
                    JPEG, PNG, WebP, atau GIF · maks. 5 MB · Cloudinary. Foto baru diterapkan saat kamu
                    menekan Simpan.
                  </p>
                  {avatarPickError && (
                    <p className="text-xs text-red-600 text-center">{avatarPickError}</p>
                  )}
                </div>
              </div>
            </div>
          </form>

          {showPassword ? (
            <div className="flex flex-col items-end sm:flex-row sm:justify-end gap-3 w-full">
              <button
                type="button"
                onClick={() => {
                  setPasswordHint(null);
                  setPwdOpen(true);
                }}
                className="px-5 py-2.5 rounded-full text-sm font-medium border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors shadow-sm"
              >
                Ubah password
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeletePhrase('');
                  setDeleteError(null);
                  setDeleteOpen(true);
                }}
                className="px-5 py-2.5 rounded-full text-sm font-medium border-2 border-red-200 text-red-700 bg-white hover:bg-red-50 transition-colors shadow-sm"
              >
                Hapus akun
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-end gap-3 w-full">
              <p className="text-sm text-[#888888] leading-relaxed text-right max-w-md">
                Kamu login via Google. Password dikelola oleh Google.
              </p>
              <button
                type="button"
                onClick={() => {
                  setDeletePhrase('');
                  setDeleteError(null);
                  setDeleteOpen(true);
                }}
                className="px-5 py-2.5 rounded-full text-sm font-medium border-2 border-red-200 text-red-700 bg-white hover:bg-red-50 transition-colors shadow-sm"
              >
                Hapus akun
              </button>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 shadow-sm">
            <h2 className="text-lg font-bold font-['Bricolage_Grotesque'] text-left mb-4">
              Riwayat transaksi token
            </h2>
            {txError && <p className="text-sm text-red-600 text-left mb-3">{txError}</p>}
            {transactions === null ? (
              <p className="text-sm text-[#888888] text-left">Memuat…</p>
            ) : transactions.length === 0 ? (
              <p className="text-sm text-[#888888] leading-relaxed text-left">
                Belum ada transaksi. Token gratis kamu sudah aktif!
              </p>
            ) : (
              <div className="rounded-xl border border-neutral-200 overflow-hidden">
                <div className="max-h-[min(280px,45vh)] sm:max-h-[min(320px,50vh)] overflow-y-auto overflow-x-auto">
                  <table className="w-full text-sm text-left min-w-[520px]">
                    <thead className="sticky top-0 z-10 bg-neutral-50 text-xs uppercase text-[#888888] shadow-[0_1px_0_0_rgba(0,0,0,0.06)]">
                      <tr>
                        <th className="px-3 py-2.5 font-semibold whitespace-nowrap">Tanggal</th>
                        <th className="px-3 py-2.5 font-semibold whitespace-nowrap">Tipe</th>
                        <th className="px-3 py-2.5 font-semibold">Keterangan</th>
                        <th className="px-3 py-2.5 font-semibold text-right whitespace-nowrap">Token</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="bg-white">
                          <td className="px-3 py-2 text-neutral-600 whitespace-nowrap">
                            {tx.created_at
                              ? new Date(tx.created_at).toLocaleString('id-ID', {
                                  dateStyle: 'short',
                                  timeStyle: 'short',
                                })
                              : '—'}
                          </td>
                          <td className="px-3 py-2">{tx.type}</td>
                          <td
                            className="px-3 py-2 text-neutral-600 max-w-[200px] truncate"
                            title={tx.description ?? ''}
                          >
                            {tx.description ?? '—'}
                          </td>
                          <td
                            className={`px-3 py-2 text-right font-medium whitespace-nowrap ${tx.amount >= 0 ? 'text-green-700' : 'text-neutral-900'}`}
                          >
                            {tx.amount >= 0 ? '+' : ''}
                            {tx.amount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="text-left pt-2">
            <Link
              href="/app"
              className="text-sm font-medium text-[#0A0A0A] underline underline-offset-2 hover:text-neutral-700"
            >
              Kembali ke App
            </Link>
          </div>
        </div>
      </main>

      {pwdOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Tutup"
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            onClick={() => setPwdOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pwd-modal-title"
            className="relative z-[121] w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl"
          >
            <button
              type="button"
              onClick={() => setPwdOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100"
              aria-label="Tutup"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 id="pwd-modal-title" className="text-lg font-bold font-['Bricolage_Grotesque'] text-left pr-10">
              Ubah password
            </h3>
            <form onSubmit={onSavePassword} className="mt-5 space-y-4 text-left">
              <div>
                <label className={labelClass} htmlFor="modalNewPassword">
                  Password baru
                </label>
                <input
                  id="modalNewPassword"
                  type="password"
                  className={inputClass}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="modalConfirmPassword">
                  Konfirmasi password
                </label>
                <input
                  id="modalConfirmPassword"
                  type="password"
                  className={inputClass}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              {passwordHint && <p className="text-sm text-red-600">{passwordHint}</p>}
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPwdOpen(false)}
                  className="px-5 py-2.5 rounded-full text-sm font-medium border border-neutral-200 hover:bg-neutral-50 w-full sm:w-auto"
                >
                  Batal
                </button>
                <SaveButton status={passwordSave.status} hasChanges />
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Tutup"
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            onClick={() => !deleteLoading && setDeleteOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            className="relative z-[121] w-full max-w-md rounded-2xl border border-red-100 bg-white p-6 shadow-xl"
          >
            <button
              type="button"
              disabled={deleteLoading}
              onClick={() => setDeleteOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100 disabled:opacity-50"
              aria-label="Tutup"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 id="delete-modal-title" className="text-lg font-bold font-['Bricolage_Grotesque'] text-red-800 text-left pr-10">
              Hapus akun permanen
            </h3>
            <p className="text-sm text-[#888888] mt-3 text-left leading-relaxed">
              Semua data akun akan dihapus dan tidak bisa dikembalikan. Pastikan kamu yakin sebelum melanjutkan.
            </p>
            <p className="text-sm text-[#0A0A0A] font-medium mt-4 text-left">
              Ketik <span className="font-mono bg-neutral-100 px-1 rounded">{DELETE_CONFIRM_PHRASE}</span> untuk
              mengonfirmasi:
            </p>
            <input
              type="text"
              className={inputClass + ' mt-2'}
              value={deletePhrase}
              onChange={(e) => setDeletePhrase(e.target.value)}
              placeholder={DELETE_CONFIRM_PHRASE}
              disabled={deleteLoading}
              autoComplete="off"
            />
            {deleteError && <p className="text-sm text-red-600 mt-2 text-left">{deleteError}</p>}
            <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => setDeleteOpen(false)}
                className="px-5 py-2.5 rounded-full text-sm font-medium border border-neutral-200 hover:bg-neutral-50 w-full sm:w-auto disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={deleteLoading || deletePhrase.trim() !== DELETE_CONFIRM_PHRASE}
                onClick={onDeleteAccount}
                className="px-5 py-2.5 rounded-full text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 w-full sm:w-auto"
              >
                {deleteLoading ? 'Menghapus…' : 'Hapus permanen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
