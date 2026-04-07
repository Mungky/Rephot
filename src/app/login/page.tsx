'use client';

import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F9F9F9] px-6 font-sans text-[#0A0A0A]">
      <Link href="/" className="mb-6">
        <img src="/RePhot.svg" alt="Rephot" className="h-7 w-auto invert" />
      </Link>
      <p className="text-center text-sm text-[#888888]">Sign in using the dialog above.</p>
      <Link
        href="/"
        className="mt-6 text-sm font-medium text-[#0A0A0A] underline-offset-2 hover:underline"
      >
        Back to home
      </Link>
    </div>
  );
}
