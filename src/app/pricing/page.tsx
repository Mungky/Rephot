'use client';

import Link from 'next/link';
import { Check, Zap, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { NavbarPublic } from '@/components/NavbarPublic';
import { useUser } from '@/hooks/useUser';
import { useAuthModal } from '@/components/auth/auth-context';
import {
  getPackageIdForPlan,
  PRICING_CHECKOUT_STORAGE_KEY,
  type PendingPricingCheckout,
  type PricingPlan,
} from '@/lib/pricing-checkout';

export default function PricingPage() {
  const [currency, setCurrency] = useState<'USD' | 'IDR'>('USD');
  const { user } = useUser();
  const { openAuth } = useAuthModal();
  const [checkoutLoading, setCheckoutLoading] = useState<PricingPlan | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const runCheckout = useCallback(async (plan: PricingPlan) => {
    setCheckoutError(null);

    if (plan === 'starter') {
      window.location.href = '/app';
      return;
    }

    const packageId = getPackageIdForPlan(plan);
    if (!packageId) {
      setCheckoutError(
        'Payment packages are not configured. Add NEXT_PUBLIC_TOKEN_PACKAGE_CREATOR_ID and NEXT_PUBLIC_TOKEN_PACKAGE_STUDIO_ID to your environment.'
      );
      return;
    }

    setCheckoutLoading(plan);
    try {
      const res = await fetch('/api/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId }),
      });
      const data = (await res.json()) as { paymentUrl?: string; error?: string };
      if (!res.ok || !data.paymentUrl) {
        throw new Error(data.error || 'Could not start checkout.');
      }
      window.location.href = data.paymentUrl;
    } catch (e) {
      setCheckoutError(e instanceof Error ? e.message : 'Checkout failed.');
    } finally {
      setCheckoutLoading(null);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    const raw = sessionStorage.getItem(PRICING_CHECKOUT_STORAGE_KEY);
    if (!raw) return;
    let parsed: PendingPricingCheckout;
    try {
      parsed = JSON.parse(raw) as PendingPricingCheckout;
    } catch {
      sessionStorage.removeItem(PRICING_CHECKOUT_STORAGE_KEY);
      return;
    }
    if (!parsed.plan || !parsed.currency) {
      sessionStorage.removeItem(PRICING_CHECKOUT_STORAGE_KEY);
      return;
    }
    sessionStorage.removeItem(PRICING_CHECKOUT_STORAGE_KEY);
    void runCheckout(parsed.plan);
  }, [user, runCheckout]);

  const handleBuy = (plan: PricingPlan) => {
    setCheckoutError(null);
    if (!user) {
      try {
        const pending: PendingPricingCheckout = { plan, currency };
        sessionStorage.setItem(PRICING_CHECKOUT_STORAGE_KEY, JSON.stringify(pending));
      } catch {
        /* storage blocked */
      }
      openAuth('signin');
      return;
    }
    void runCheckout(plan);
  };

  const buyButtonClass = (variant: 'light' | 'dark') =>
    variant === 'dark'
      ? 'flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 px-4 text-center text-sm font-semibold text-[#0A0A0A] transition-colors hover:bg-neutral-200 disabled:opacity-60'
      : 'flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white py-3 px-4 text-center text-sm font-semibold text-[#0A0A0A] transition-colors hover:bg-neutral-50 disabled:opacity-60';

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-[#0A0A0A] font-['Outfit'] selection:bg-neutral-900 selection:text-white pb-20">
      <NavbarPublic activePage="pricing" />

      <main className="pt-24 pb-32">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-neutral-200 bg-white mb-6 text-sm font-medium">
              Pricing
            </div>
            <h1 className="font-['Bricolage_Grotesque'] text-[40px] md:text-[56px] font-extrabold tracking-tight mb-4 text-[#0A0A0A]">
              Simple, transparent pricing
            </h1>
            <p className="text-[#888888] text-lg max-w-2xl mx-auto mb-8">
              Choose the perfect plan for your needs. Generate 3D isometric icons at a fraction of the cost of hiring an agency.
            </p>

            <div className="inline-flex items-center bg-white border border-neutral-200 rounded-full p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${currency === 'USD' ? 'bg-[#0A0A0A] text-white shadow-md' : 'text-[#888888] hover:text-[#0A0A0A]'}`}
              >
                USD ($)
              </button>
              <button
                type="button"
                onClick={() => setCurrency('IDR')}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${currency === 'IDR' ? 'bg-[#0A0A0A] text-white shadow-md' : 'text-[#888888] hover:text-[#0A0A0A]'}`}
              >
                IDR (Rp)
              </button>
            </div>
          </div>

          {checkoutError && (
            <div
              className="max-w-[1000px] mx-auto mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {checkoutError}
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-8 max-w-[1000px] mx-auto">
            <div className="bg-white rounded-[32px] p-8 border border-neutral-200 flex flex-col hover:-translate-y-1 transition-transform duration-300">
              <h3 className="font-['Bricolage_Grotesque'] text-2xl font-bold mb-2">Starter</h3>
              <p className="text-[#888888] text-sm mb-6">Perfect to test the waters</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold">{currency === 'USD' ? '$0' : 'Rp 0'}</span>
                <span className="text-[#888888]">/forever</span>
              </div>
              <button
                type="button"
                onClick={() => handleBuy('starter')}
                disabled={checkoutLoading !== null}
                className={`${buyButtonClass('light')} mb-8`}
              >
                {checkoutLoading === 'starter' ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : null}
                Buy now
              </button>
              <div className="space-y-4 flex-1">
                {[
                  '2 Free Credits initially',
                  '720p resolution exports',
                  'Standard processing speed',
                  'Community support',
                  'CC-BY License (Requires attribution)',
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-[#0A0A0A]" />
                    </div>
                    <span className="text-sm font-medium text-[#666666]">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0A0A0A] text-white rounded-[32px] p-8 border border-neutral-800 flex flex-col relative shadow-2xl shadow-black/10 hover:-translate-y-1 transition-transform duration-300 scale-105">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-[#0A0A0A] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-neutral-200">
                <Zap className="w-3.5 h-3.5 fill-current" />
                Most Popular
              </div>

              <h3 className="font-['Bricolage_Grotesque'] text-2xl font-bold mb-2">Creator</h3>
              <p className="text-neutral-400 text-sm mb-6">For independent designers</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold">{currency === 'USD' ? '$19' : 'Rp 290rb'}</span>
                <span className="text-neutral-400">/month</span>
              </div>
              <button
                type="button"
                onClick={() => handleBuy('creator')}
                disabled={checkoutLoading !== null}
                className={`${buyButtonClass('dark')} mb-8`}
              >
                {checkoutLoading === 'creator' ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[#0A0A0A]" aria-hidden />
                ) : null}
                Buy now
              </button>
              <div className="space-y-4 flex-1">
                {[
                  '500 Credits per month',
                  '4K high-res exports',
                  'Priority GPU processing',
                  'Transparent backgrounds (PNG)',
                  'Commercial use license',
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm font-medium text-neutral-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[32px] p-8 border border-neutral-200 flex flex-col hover:-translate-y-1 transition-transform duration-300">
              <h3 className="font-['Bricolage_Grotesque'] text-2xl font-bold mb-2">Studio</h3>
              <p className="text-[#888888] text-sm mb-6">For teams and high-volume</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold">{currency === 'USD' ? '$49' : 'Rp 750rb'}</span>
                <span className="text-[#888888]">/month</span>
              </div>
              <button
                type="button"
                onClick={() => handleBuy('studio')}
                disabled={checkoutLoading !== null}
                className={`${buyButtonClass('light')} mb-8`}
              >
                {checkoutLoading === 'studio' ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : null}
                Buy now
              </button>
              <div className="space-y-4 flex-1">
                {[
                  'Unlimited Credits',
                  'API Access',
                  'Custom brand models',
                  'Priority 24/7 support',
                  'Full Commercial license',
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-[#0A0A0A]" />
                    </div>
                    <span className="text-sm font-medium text-[#666666]">{feature}</span>
                  </div>
                ))}
              </div>
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
              <Link href="/pricing" className="text-[#0A0A0A] font-medium text-sm transition-colors">
                Pricing
              </Link>
              <Link href="/about" className="text-[#888888] hover:text-[#0A0A0A] text-sm font-medium transition-colors">
                About
              </Link>
              <Link href="/app" className="text-[#888888] hover:text-[#0A0A0A] text-sm font-medium transition-colors">
                App
              </Link>
              <Link href="#" className="text-[#888888] hover:text-[#0A0A0A] text-sm font-medium transition-colors">
                Testimonials
              </Link>
              <Link href="#" className="text-[#888888] hover:text-[#0A0A0A] text-sm font-medium transition-colors">
                Terms
              </Link>
              <Link href="#" className="text-[#888888] hover:text-[#0A0A0A] text-sm font-medium transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>

          <div className="text-center text-[#888888] text-sm border-t border-neutral-100 pt-8">
            &copy; {new Date().getFullYear()} Isometricon. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
