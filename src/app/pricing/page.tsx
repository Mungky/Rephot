'use client';

import Link from 'next/link';
import { Check, Zap, ChevronDown, Gift } from 'lucide-react';
import { NavbarPublic } from '@/components/NavbarPublic';
import { useUser } from '@/hooks/useUser';
import { useAuthModal } from '@/components/auth/auth-context';
import { useState } from 'react';

const PLANS = [
  {
    name: 'Starter',
    tokens: 20,
    photos: 5,
    priceIdr: 20_000,
    priceLabel: 'Rp 20.000',
    discountPct: 0,
    description: 'Coba dulu, tanpa risiko',
    mayarUrl: 'https://fikri-mustaqim.myr.id/pl/starter-39405',
    features: [
      '20 Token · 5 foto',
      '4K high-res exports',
      'Standard processing',
      'Lisensi komersial',
    ],
    popular: false,
    variant: 'light' as const,
  },
  {
    name: 'Basic',
    tokens: 50,
    photos: 12,
    priceIdr: 45_000,
    priceLabel: 'Rp 45.000',
    discountPct: 10,
    description: 'Untuk project kecil',
    mayarUrl: 'https://fikri-mustaqim.myr.id/pl/rephot-50-token',
    features: [
      '50 Token · 12 foto',
      '4K high-res exports',
      'Priority processing',
      'Lisensi komersial',
    ],
    popular: false,
    variant: 'light' as const,
  },
  {
    name: 'Pro',
    tokens: 100,
    photos: 25,
    priceIdr: 85_000,
    priceLabel: 'Rp 85.000',
    discountPct: 15,
    description: 'Untuk kreator profesional',
    mayarUrl: 'https://fikri-mustaqim.myr.id/pl/rephot-100-token',
    features: [
      '100 Token · 25 foto',
      '4K high-res exports',
      'Priority GPU processing',
      'Lisensi komersial',
    ],
    popular: true,
    variant: 'dark' as const,
  },
  {
    name: 'Studio',
    tokens: 250,
    photos: 62,
    priceIdr: 200_000,
    priceLabel: 'Rp 200.000',
    discountPct: 20,
    description: 'Untuk tim & high-volume',
    mayarUrl: 'https://fikri-mustaqim.myr.id/pl/rephot-250-token',
    features: [
      '250 Token · 62 foto',
      '4K high-res exports',
      'Priority GPU processing',
      'Lisensi komersial',
      'API Access (coming soon)',
    ],
    popular: false,
    variant: 'light' as const,
  },
];

const FAQ = [
  {
    q: 'Apakah token kadaluarsa?',
    a: 'Tidak. Token yang sudah dibeli tidak pernah kadaluarsa dan tetap tersedia selama akun kamu aktif.',
  },
  {
    q: 'Berapa foto yang dihasilkan per generate?',
    a: '1 kali generate (4 token) menghasilkan 2 variasi foto produk profesional. Kamu bisa pilih yang paling cocok atau pakai keduanya.',
  },
  {
    q: 'Apakah ada refund jika generate gagal?',
    a: 'Ya. Jika proses generate gagal karena kesalahan sistem, token kamu akan dikembalikan secara otomatis. Kamu tidak akan dikenakan biaya untuk generate yang gagal.',
  },
  {
    q: 'Apakah bisa untuk keperluan komersial?',
    a: 'Ya, semua paket sudah termasuk lisensi komersial. Kamu bebas menggunakan hasil foto untuk jualan di marketplace, media sosial, website, atau keperluan bisnis lainnya.',
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-neutral-200 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left"
      >
        <span className="font-semibold text-[#0A0A0A] text-[15px]">{q}</span>
        <ChevronDown className={`w-5 h-5 text-[#888888] shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-40 pb-5' : 'max-h-0'}`}
      >
        <p className="text-[#888888] text-sm leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

export default function PricingPage() {
  const { user } = useUser();
  const { openAuth } = useAuthModal();

  const handleBuy = (plan: typeof PLANS[number]) => {
    if (!user) {
      openAuth('signin');
      return;
    }
    const url = new URL(plan.mayarUrl);
    if (user.email) url.searchParams.set('email', user.email);
    const name = user.user_metadata?.full_name;
    if (name) url.searchParams.set('name', name);
    window.open(url.toString(), '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-[#0A0A0A] font-['Outfit'] selection:bg-neutral-900 selection:text-white pb-20">
      <NavbarPublic activePage="pricing" />

      <main className="pt-24 pb-32">
        <div className="max-w-[1200px] mx-auto px-6">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-neutral-200 bg-white mb-6 text-sm font-medium">
              Pricing
            </div>
            <h1 className="font-['Bricolage_Grotesque'] text-[40px] md:text-[56px] font-extrabold tracking-tight mb-4 text-[#0A0A0A]">
              Harga simpel, tanpa ribet
            </h1>
            <p className="text-[#888888] text-lg max-w-2xl mx-auto">
              Beli kredit sekali pakai. Tidak ada langganan bulanan. Token tidak kadaluarsa.
            </p>
          </div>

          {/* Free Tier Callout */}
          <div className="max-w-[600px] mx-auto mb-12">
            <div className="flex items-center gap-3.5 bg-white rounded-2xl px-5 py-4 border border-neutral-200 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                <Gift className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-sm text-[#666666] leading-snug">
                <strong className="text-[#0A0A0A]">Gratis untuk mulai.</strong> Daftar dan dapat 8 token (2 foto) sebagai bonus selamat datang.
              </p>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1100px] mx-auto mb-24">
            {PLANS.map((plan) => {
              const perToken = Math.round(plan.priceIdr / plan.tokens);
              return (
                <div
                  key={plan.name}
                  className={`rounded-[32px] p-7 flex flex-col hover:-translate-y-1 transition-transform duration-300 ${
                    plan.variant === 'dark'
                      ? 'bg-[#0A0A0A] text-white border border-neutral-800 shadow-2xl shadow-black/10 relative'
                      : 'bg-white border border-neutral-200 relative'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-[#0A0A0A] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-neutral-200">
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      Best Value
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-['Bricolage_Grotesque'] text-xl font-bold">{plan.name}</h3>
                    {plan.discountPct > 0 && (
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        plan.variant === 'dark'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-green-50 text-green-600 border border-green-200'
                      }`}>
                        Hemat {plan.discountPct}%
                      </span>
                    )}
                  </div>
                  <p className={`text-sm mb-5 ${plan.variant === 'dark' ? 'text-neutral-400' : 'text-[#888888]'}`}>
                    {plan.description}
                  </p>

                  <div className="mb-1">
                    <span className="text-3xl font-extrabold">{plan.tokens}</span>
                    <span className={`text-sm ml-1 ${plan.variant === 'dark' ? 'text-neutral-400' : 'text-[#888888]'}`}>tokens</span>
                  </div>
                  <div className={`text-base font-bold mb-1 ${plan.variant === 'dark' ? 'text-neutral-300' : 'text-[#0A0A0A]'}`}>
                    {plan.priceLabel}
                  </div>
                  <div className={`text-xs font-medium mb-6 ${plan.variant === 'dark' ? 'text-neutral-500' : 'text-[#AAAAAA]'}`}>
                    Rp {perToken.toLocaleString('id-ID')} per token &middot; {plan.photos} foto
                  </div>

                  <button
                    type="button"
                    onClick={() => handleBuy(plan)}
                    className={`w-full py-3 px-4 rounded-xl font-semibold text-sm text-center transition-colors mb-6 ${
                      plan.variant === 'dark'
                        ? 'bg-white text-[#0A0A0A] hover:bg-neutral-200'
                        : 'bg-[#0A0A0A] text-white hover:bg-neutral-800'
                    }`}
                  >
                    Beli Sekarang
                  </button>

                  <div className="space-y-3.5 flex-1">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                          plan.variant === 'dark' ? 'bg-white/10' : 'bg-neutral-100'
                        }`}>
                          <Check className={`w-3 h-3 ${plan.variant === 'dark' ? 'text-white' : 'text-[#0A0A0A]'}`} />
                        </div>
                        <span className={`text-sm font-medium ${
                          plan.variant === 'dark' ? 'text-neutral-300' : 'text-[#666666]'
                        }`}>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* FAQ Section */}
          <div className="max-w-[680px] mx-auto">
            <div className="text-center mb-8">
              <h2 className="font-['Bricolage_Grotesque'] text-[28px] md:text-[36px] font-extrabold tracking-tight text-[#0A0A0A] mb-2">
                Pertanyaan umum
              </h2>
              <p className="text-[#888888] text-base">
                Hal-hal yang sering ditanyakan soal harga dan token.
              </p>
            </div>
            <div className="bg-white rounded-[28px] border border-neutral-200 px-6 md:px-8 divide-neutral-200">
              {FAQ.map((item, i) => (
                <FaqItem key={i} q={item.q} a={item.a} />
              ))}
            </div>
          </div>

        </div>
      </main>

      <footer className="border-t border-neutral-200 bg-white pt-16 pb-8">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2">
                <img src="/RePhot.svg" alt="Rephot" className="h-8 w-auto invert" />
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
              <Link href="/pricing" className="text-[#0A0A0A] font-medium text-sm transition-colors">Pricing</Link>
              <Link href="/about" className="text-[#888888] hover:text-[#0A0A0A] text-sm font-medium transition-colors">About</Link>
              <Link href="/app" className="text-[#888888] hover:text-[#0A0A0A] text-sm font-medium transition-colors">App</Link>
              <Link href="/terms" className="text-[#888888] hover:text-[#0A0A0A] text-sm font-medium transition-colors">Terms</Link>
              <Link href="/privacy" className="text-[#888888] hover:text-[#0A0A0A] text-sm font-medium transition-colors">Privacy</Link>
            </div>
          </div>
          <div className="text-center text-[#888888] text-sm border-t border-neutral-100 pt-8">
            &copy; {new Date().getFullYear()} Rephot. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
