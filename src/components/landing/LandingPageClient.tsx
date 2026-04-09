'use client';

import type { CSSProperties } from 'react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { HeroBackground } from '@/components/HeroBackground';
import { NavbarPublic } from '@/components/NavbarPublic';
import {
  IconArrowRight,
  IconCamera,
  IconDownload,
  IconImages,
  IconPalette,
  IconPlay,
  IconUpload,
  IconWallet,
  IconWandSparkles,
  IconZap,
} from '@/components/landing/LandingPageIcons';

/** Sebelum (kiri / area clip): ganti URL manual. */
const DEMO_BEFORE_IMAGE =
  'https://res.cloudinary.com/dkhb9rkke/image/upload/v1775663582/rephot/uploads/2710a430-74b5-470b-a6b6-6bc9ec4ebd5b_1775663582561.jpg';
/** Sesudah (kanan / full): ganti URL manual. */
const DEMO_AFTER_IMAGE =
  'https://res.cloudinary.com/dkhb9rkke/image/upload/v1775708063/19ac6dd3-50aa-4809-b417-79637ec1edf6_pbn6sb.jpg';

export function LandingPageClient() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [stats, setStats] = useState({ total_generations: 0 });
  /** Hindari hydration mismatch pada <img> saat URL demo diganti / HMR chunk tidak sinkron. */
  const [sliderReady, setSliderReady] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setSliderReady(true);
    fetch('/api/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  const countLabel = stats.total_generations.toLocaleString('id-ID');

  return (
    <>
      <NavbarPublic transparent isScrolled={isScrolled} />

      <main>
        <div className="relative min-h-[100vh] w-full flex flex-col justify-center overflow-hidden pt-16 bg-[#0A0A0A]">
          <HeroBackground />
          <section className="relative z-20 max-w-[1200px] w-full mx-auto px-6 flex flex-col items-center text-center pt-6 sm:pt-8 pb-16 md:pb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-black/40 backdrop-blur-md mb-8 text-sm font-medium shadow-2xl text-neutral-300">
              <IconCamera className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{countLabel} foto produk dihasilkan</span>
            </div>

            <h1 className="font-['Bricolage_Grotesque'] text-[40px] sm:text-[48px] md:text-[72px] font-extrabold leading-[1.1] tracking-tight mb-2">
              <span className="block text-white">Foto Studio Repot</span>
              <span className="block text-amber-500">Foto Studio, Rephot</span>
            </h1>

            <p className="text-neutral-300 text-base sm:text-lg md:text-xl max-w-2xl mt-6 mb-10 font-['Outfit'] leading-relaxed">
              Upload foto produk dari HP kondisi apapun. Rephot ubah jadi foto profesional dalam detik — tanpa skill,
              tanpa studio.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 w-full max-w-lg sm:max-w-none mb-3">
              <Link
                href="/app"
                className="inline-flex items-center justify-center rounded-full bg-[#111] text-white border border-white/15 px-8 py-3.5 font-semibold hover:bg-neutral-900 transition-colors font-['Outfit'] text-center"
              >
                Mulai Gratis — 2 Foto Gratis
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-full border-2 border-white/25 bg-transparent text-white px-8 py-3.5 font-medium hover:bg-white/10 transition-colors font-['Outfit'] text-center"
              >
                Lihat Harga
              </Link>
            </div>
            <p className="text-sm text-neutral-500 font-['Outfit']">Tanpa kartu kredit. 8 token langsung aktif.</p>

            <div className="w-full max-w-[1000px] overflow-hidden flex gap-4 relative py-4 mt-6">
              <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent z-10 pointer-events-none" />
            </div>
          </section>
        </div>

        <section className="max-w-[1200px] mx-auto px-6 py-20 md:py-24 border-t border-neutral-100">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="font-['Bricolage_Grotesque'] text-[28px] sm:text-[36px] md:text-[48px] font-extrabold tracking-tight mb-4 text-[#0A0A0A]">
              Lihat Rephot beraksi
            </h2>
            <p className="text-[#888888] text-base md:text-lg max-w-2xl mx-auto font-['Outfit']">
              Dari foto HP biasa ke tampilan studio — alur singkat yang sama seperti di aplikasi.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 max-w-[1000px] mx-auto">
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              className="relative group block shrink-0 w-[260px] md:w-[280px] rounded-[32px] overflow-hidden shadow-2xl shadow-black/10 border-4 border-white bg-[#0A0A0A] transition-transform hover:-translate-y-2 duration-300"
            >
              <video
                src="https://media.w3.org/2010/05/sintel/trailer_hd.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover aspect-[9/16] opacity-90 group-hover:opacity-100 transition-opacity duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/80 pointer-events-none transition-opacity group-hover:opacity-90" />
              <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-white flex items-center gap-1.5 border border-white/10">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                Demo
              </div>
              <div className="absolute bottom-6 left-6 right-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white group-hover:bg-white group-hover:text-black transition-colors">
                  <IconPlay className="w-4 h-4 ml-0.5" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Cuplikan cepat</p>
                  <p className="text-white/70 text-xs">Tonton di TikTok</p>
                </div>
              </div>
            </a>

            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="relative group block w-full max-w-[600px] rounded-[24px] overflow-hidden shadow-2xl shadow-black/10 border-4 border-white bg-[#0A0A0A] transition-transform hover:-translate-y-2 duration-300"
            >
              <video
                src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover aspect-[16/9] opacity-90 group-hover:opacity-100 transition-opacity duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/80 pointer-events-none transition-opacity group-hover:opacity-90" />
              <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-white flex items-center gap-1.5 border border-white/10">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                Tutorial
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-90 group-hover:scale-100">
                <div className="w-16 h-16 rounded-full bg-[#FF0000] flex items-center justify-center shadow-lg text-white">
                  <IconPlay className="w-6 h-6 ml-1 text-white" />
                </div>
              </div>
              <div className="absolute bottom-6 left-6 right-6 flex items-center gap-4">
                <div>
                  <p className="text-white font-bold text-lg">Panduan lengkap</p>
                  <p className="text-white/80 text-sm">Tonton di YouTube</p>
                </div>
              </div>
            </a>
          </div>
        </section>

        <section className="bg-[rgba(240,240,240,0.3)] py-20 md:py-24">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
              <div>
                <h2 className="font-['Bricolage_Grotesque'] text-[28px] sm:text-[36px] md:text-[48px] font-extrabold tracking-tight mb-6 text-[#0A0A0A] leading-[1.1]">
                  Masuk dengan kualitas biasa,
                  <br />
                  keluar dengan kualitas studio.
                </h2>
                <p className="text-[#888888] text-base md:text-lg mb-8 leading-relaxed font-['Outfit']">
                  Geser untuk bandingkan: foto produk dari HP vs hasil setelah Rephot — pencahayaan studio, background
                  rapi, tetap natural.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <Link
                    href="/app"
                    className="bg-[#0A0A0A] text-white px-8 py-3.5 rounded-full font-medium hover:bg-neutral-800 transition-colors w-full sm:w-auto text-center font-['Outfit']"
                  >
                    Coba di App
                  </Link>
                  <span className="text-sm text-[#888888] font-['Outfit']">Tanpa kartu kredit</span>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-xl shadow-black/5 border border-neutral-200">
                <div className="text-xs font-bold text-[#888888] uppercase tracking-wider mb-2 font-['Outfit']">
                  Contoh produk
                </div>
                <div className="bg-[#F9F9F9] rounded-xl p-4 border border-neutral-200 mb-6 font-medium text-[#0A0A0A] text-sm md:text-base font-['Outfit']">
                  &quot;Mouse Wireless, foto dari background laptop, — mau jadi Cinematic dengan background komputer untuk foto produk.&quot;
                </div>

                <div
                  className="aspect-square bg-[#F9F9F9] rounded-2xl border border-neutral-200 overflow-hidden relative group"
                  style={{ '--position': '50%' } as CSSProperties}
                >
                  {sliderReady ? (
                    <>
                      <img
                        src={DEMO_AFTER_IMAGE}
                        alt="Foto sesudah"
                        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                      />
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{ clipPath: 'polygon(0 0, var(--position) 0, var(--position) 100%, 0 100%)' }}
                      >
                        <img
                          src={DEMO_BEFORE_IMAGE}
                          alt="Foto sebelum"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>

                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] pointer-events-none z-10"
                        style={{ left: 'var(--position)', transform: 'translateX(-50%)' }}
                      >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center text-neutral-600 border border-neutral-200">
                          <div className="flex gap-0.5">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="m15 18-6-6 6-6" />
                            </svg>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="m9 18 6-6-6-6" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <input
                        type="range"
                        min="0"
                        max="100"
                        defaultValue="50"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                        onInput={(e) => {
                          e.currentTarget.parentElement?.style.setProperty('--position', `${e.currentTarget.value}%`);
                        }}
                      />

                      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow-sm pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Sebelum
                      </div>
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-[#0A0A0A] shadow-sm border border-black/5 flex items-center gap-1.5 pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <IconZap className="w-3.5 h-3.5 text-amber-500" />
                        Sesudah
                      </div>
                    </>
                  ) : (
                    <div
                      className="absolute inset-0 flex items-center justify-center bg-[#F0F0F0] text-[#888888] text-sm font-['Outfit']"
                      aria-hidden
                    >
                      Memuat preview…
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[rgba(240,240,240,0.3)] py-20 md:py-24 border-t border-neutral-100/80">
          <div className="max-w-[1200px] mx-auto px-6">
            <p className="text-center text-xs font-semibold uppercase tracking-wider text-[#888888] mb-2 font-['Outfit']">
              Cara Kerja Rephot
            </p>
            <h2 className="font-['Bricolage_Grotesque'] text-[28px] sm:text-[36px] md:text-[48px] font-extrabold tracking-tight text-center text-[#0A0A0A] mb-12 md:mb-16">
              Tiga langkah. Satu menit.
            </h2>

            <div className="grid md:grid-cols-3 gap-10 md:gap-8">
              <div className="text-center md:text-left">
                <div className="w-12 h-12 mx-auto md:mx-0 bg-white rounded-xl shadow-sm border border-neutral-200 flex items-center justify-center mb-5">
                  <IconUpload className="w-6 h-6 text-[#0A0A0A]" />
                </div>
                <h3 className="text-xl font-bold text-[#0A0A0A] mb-2 font-['Bricolage_Grotesque']">Upload Foto</h3>
                <p className="text-[#888888] leading-relaxed font-['Outfit']">
                  Foto dari HP, foto buram, foto dengan background berantakan — semua bisa.
                </p>
              </div>
              <div className="text-center md:text-left">
                <div className="w-12 h-12 mx-auto md:mx-0 bg-white rounded-xl shadow-sm border border-neutral-200 flex items-center justify-center mb-5">
                  <IconWandSparkles className="w-6 h-6 text-[#0A0A0A]" />
                </div>
                <h3 className="text-xl font-bold text-[#0A0A0A] mb-2 font-['Bricolage_Grotesque']">Pilih Style</h3>
                <p className="text-[#888888] leading-relaxed font-['Outfit']">
                  AI deteksi produkmu dan rekomendasikan style terbaik: Clean White, Lifestyle Warm, Dark Premium, dan 4
                  lainnya.
                </p>
              </div>
              <div className="text-center md:text-left">
                <div className="w-12 h-12 mx-auto md:mx-0 bg-white rounded-xl shadow-sm border border-neutral-200 flex items-center justify-center mb-5">
                  <IconDownload className="w-6 h-6 text-[#0A0A0A]" />
                </div>
                <h3 className="text-xl font-bold text-[#0A0A0A] mb-2 font-['Bricolage_Grotesque']">Download Hasilnya</h3>
                <p className="text-[#888888] leading-relaxed font-['Outfit']">
                  Dapat 2 variasi foto studio profesional siap upload ke Tokopedia, Shopee, atau Instagram.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-6 py-20 md:py-24">
          <div className="flex flex-col items-center text-center mb-12 md:mb-16">
            <h2 className="font-['Bricolage_Grotesque'] text-[28px] sm:text-[36px] md:text-[48px] font-extrabold tracking-tight text-[#0A0A0A]">
              Bukan edit foto biasa.
            </h2>
            <p className="text-[#888888] text-base md:text-lg mt-3 font-['Outfit']">Kenapa Rephot?</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-[#F9F9F9] rounded-2xl p-8 border border-neutral-200">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-neutral-100 flex items-center justify-center mb-6">
                <IconPalette className="w-6 h-6 text-[#0A0A0A]" />
              </div>
              <h3 className="text-xl font-bold text-[#0A0A0A] mb-3 font-['Bricolage_Grotesque']">7 Style Profesional</h3>
              <p className="text-[#888888] leading-relaxed font-['Outfit']">
                Clean White untuk marketplace, Lifestyle Warm untuk social, Dark Premium untuk produk premium — dan 4
                lainnya.
              </p>
            </div>
            <div className="bg-[#F9F9F9] rounded-2xl p-8 border border-neutral-200">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-neutral-100 flex items-center justify-center mb-6">
                <IconImages className="w-6 h-6 text-[#0A0A0A]" />
              </div>
              <h3 className="text-xl font-bold text-[#0A0A0A] mb-3 font-['Bricolage_Grotesque']">
                Memperbaiki detail produk
              </h3>
              <p className="text-[#888888] leading-relaxed font-['Outfit']">
                Merapikan detail produk dan menyetel background yang pas — supaya satu foto siap dipakai di etalase online.
              </p>
            </div>
            <div className="bg-[#F9F9F9] rounded-2xl p-8 border border-neutral-200 sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-neutral-100 flex items-center justify-center mb-6">
                <IconWallet className="w-6 h-6 text-[#0A0A0A]" />
              </div>
              <h3 className="text-xl font-bold text-[#0A0A0A] mb-3 font-['Bricolage_Grotesque']">
                Mulai gratis, bayar sesuai pakai
              </h3>
              <p className="text-[#888888] leading-relaxed font-['Outfit']">
                Daftar dan coba dulu tanpa kartu kredit. Token tidak kadaluarsa — pakai kapan saja kamu butuh foto baru.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-[#0A0A0A] text-white py-20 md:py-24">
          <div className="max-w-[1200px] mx-auto px-6 text-center">
            <h2 className="font-['Bricolage_Grotesque'] text-[28px] sm:text-[40px] md:text-[48px] font-extrabold tracking-tight mb-4">
              Siap tingkatkan foto produkmu?
            </h2>
            <p className="text-neutral-400 text-base md:text-lg max-w-xl mx-auto mb-10 font-['Outfit']">
              Mulai gratis, pilih paket saat kamu butuh lebih banyak. Detail harga ada di halaman pricing.
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 text-white font-medium hover:text-neutral-300 transition-colors group font-['Outfit']"
            >
              Lihat Paket Lengkap
              <IconArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
