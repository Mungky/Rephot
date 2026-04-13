'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

export default function ForgotPasswordPage() {
  const [linkInvalid, setLinkInvalid] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get('error') === 'link_invalid' || p.get('reason') === 'link_expired') {
      setLinkInvalid(true);
      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      url.searchParams.delete('reason');
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F9F9F9] px-6 py-10 font-sans text-[#0A0A0A]">
      <Link href="/" className="mb-8">
        <img src="/RePhot.svg" alt="Rephot" className="h-8 w-auto invert" />
      </Link>

      <div className="w-full max-w-[420px] rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl shadow-black/10">
        <div className="mb-6 text-center">
          <h1 className="font-['Bricolage_Grotesque'] text-2xl font-extrabold tracking-tight text-[#0A0A0A]">
            Lupa password
          </h1>
          <p className="mt-2 text-sm text-[#888888]">Masukkan email akunmu. Kami kirim link untuk atur ulang password.</p>
        </div>

        {linkInvalid ? (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900" role="status">
            Link di email sudah tidak berlaku (kadaluarsa, sudah dipakai, atau terbuka otomatis oleh aplikasi email).
            Minta link reset baru di bawah, lalu buka link dari perangkat yang sama bila memungkinkan.
          </div>
        ) : null}

        <ForgotPasswordForm
          onBack={() => {
            window.location.href = '/?auth=1';
          }}
          backLabel="Kembali ke beranda"
        />
      </div>

      <Link href="/" className="mt-8 text-sm font-medium text-[#888888] underline-offset-2 hover:text-[#0A0A0A] hover:underline">
        Kembali ke beranda
      </Link>
    </div>
  );
}
