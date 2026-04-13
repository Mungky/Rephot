'use client';

import { useMemo, useState } from 'react';
import { Mail, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { getUpdatePasswordCallbackUrl } from '@/lib/site-origin';

type ForgotPasswordFormProps = {
  /** Teks tombol kembali (modal vs halaman penuh) */
  onBack?: () => void;
  backLabel?: string;
};

export function ForgotPasswordForm({ onBack, backLabel = 'Kembali ke masuk' }: ForgotPasswordFormProps) {
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const redirectTo = getUpdatePasswordCallbackUrl();
    if (process.env.NODE_ENV === 'development') {
      console.info('[forgot password] redirectTo dikirim ke Supabase:', redirectTo);
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSent(true);
  };

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          Link reset sudah dikirim ke email kamu. Cek inbox dan folder spam—kadang perlu beberapa menit sampai masuk.
        </p>
        <p className="text-sm text-[#888888]">
          Masih belum terima? Pastikan alamat email sama dengan yang dipakai saat daftar, atau coba kirim ulang nanti.
        </p>
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="text-sm font-medium text-[#0A0A0A] underline-offset-2 hover:underline"
          >
            {backLabel}
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </div>
      ) : null}

      <div>
        <label htmlFor="forgot-email" className="mb-1.5 block text-sm font-medium text-[#0A0A0A]">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#888888]" />
          <input
            id="forgot-email"
            type="email"
            autoComplete="email"
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-neutral-200 bg-[#F9F9F9] py-3 pl-10 pr-4 text-sm font-medium text-[#0A0A0A] outline-none transition-all focus:border-[#0A0A0A] focus:ring-2 focus:ring-[#0A0A0A]/10"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !email.trim()}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A0A0A] py-3 text-sm font-medium text-white shadow-xl shadow-black/5 transition-colors hover:bg-black/80 disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {loading ? 'Mengirim…' : 'Kirim link reset'}
      </button>

      {onBack ? (
        <p className="text-center text-sm text-[#888888]">
          <button
            type="button"
            onClick={onBack}
            className="font-medium text-[#0A0A0A] underline-offset-2 hover:underline"
          >
            {backLabel}
          </button>
        </p>
      ) : null}
    </form>
  );
}
