'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { PasswordRequirements, passwordMeetsAllRules } from '@/components/auth/password-rules';

/**
 * Sesi recovery diset oleh GET /auth/confirm (verifyOtp + cookie), lalu user diarahkan ke sini.
 * Tidak memakai exchangeCodeForSession di klien agar menghindari error PKCE code verifier.
 */
export default function UpdatePasswordPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [ready, setReady] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    let unsub: (() => void) | null = null;

    (async () => {
      setSessionError(null);

      let { data: { session } } = await supabase.auth.getSession();
      if (!alive) return;
      if (session) {
        setReady(true);
        return;
      }

      const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
        if (!alive || !next) return;
        setReady(true);
      });
      unsub = () => listener.subscription.unsubscribe();

      for (let i = 0; i < 25 && alive; i++) {
        await new Promise((r) => setTimeout(r, 200));
        ({ data: { session } } = await supabase.auth.getSession());
        if (session) {
          setReady(true);
          unsub();
          unsub = null;
          return;
        }
      }

      unsub?.();
      unsub = null;
      if (!alive) return;
      setSessionError(
        'Sesi tidak ditemukan. Minta link reset baru dari halaman lupa password, lalu buka link dari email yang sama.'
      );
    })();

    return () => {
      alive = false;
      unsub?.();
    };
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!passwordMeetsAllRules(password)) {
      setFormError('Password belum memenuhi semua syarat di bawah.');
      return;
    }
    if (password !== confirm) {
      setFormError('Konfirmasi password tidak sama.');
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (error) {
      setFormError(error.message);
      return;
    }

    router.replace('/app?password_updated=1');
  };

  const passwordOk = passwordMeetsAllRules(password);
  const canSubmit = ready && passwordOk && password === confirm && confirm.length > 0;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F9F9F9] px-6 py-10 font-sans text-[#0A0A0A]">
      <Link href="/" className="mb-8">
        <img src="/RePhot.svg" alt="Rephot" className="h-8 w-auto invert" />
      </Link>

      <div className="w-full max-w-[420px] rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl shadow-black/10">
        <div className="mb-6 text-center">
          <h1 className="font-['Bricolage_Grotesque'] text-2xl font-extrabold tracking-tight text-[#0A0A0A]">
            Password baru
          </h1>
          <p className="mt-2 text-sm text-[#888888]">Atur password baru untuk akunmu.</p>
        </div>

        {!ready && !sessionError ? (
          <div className="flex flex-col items-center justify-center gap-3 py-8">
            <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
            <p className="text-sm text-[#888888]">Memuat…</p>
          </div>
        ) : null}

        {sessionError ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {sessionError}
            </div>
            <Link
              href="/forgot-password"
              className="block w-full rounded-xl bg-[#0A0A0A] py-3 text-center text-sm font-medium text-white hover:bg-black/80"
            >
              Minta link baru
            </Link>
          </div>
        ) : null}

        {ready ? (
          <form className="space-y-4" onSubmit={handleSubmit}>
            {formError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                {formError}
              </div>
            ) : null}

            <div>
              <label htmlFor="new-password" className="mb-1.5 block text-sm font-medium text-[#0A0A0A]">
                Password baru
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#888888]" />
                <input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-neutral-200 bg-[#F9F9F9] py-3 pl-10 pr-4 text-sm font-medium text-[#0A0A0A] outline-none transition-all focus:border-[#0A0A0A] focus:ring-2 focus:ring-[#0A0A0A]/10"
                />
              </div>
              <PasswordRequirements password={password} />
            </div>

            <div>
              <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-[#0A0A0A]">
                Konfirmasi password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#888888]" />
                <input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className="w-full rounded-xl border border-neutral-200 bg-[#F9F9F9] py-3 pl-10 pr-4 text-sm font-medium text-[#0A0A0A] outline-none transition-all focus:border-[#0A0A0A] focus:ring-2 focus:ring-[#0A0A0A]/10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !canSubmit}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A0A0A] py-3 text-sm font-medium text-white shadow-xl shadow-black/5 transition-colors hover:bg-black/80 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {submitting ? 'Menyimpan…' : 'Simpan password'}
            </button>
          </form>
        ) : null}
      </div>

      <Link href="/" className="mt-8 text-sm font-medium text-[#888888] underline-offset-2 hover:text-[#0A0A0A] hover:underline">
        Kembali ke beranda
      </Link>
    </div>
  );
}
