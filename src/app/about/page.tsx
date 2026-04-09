'use client';

import Link from 'next/link';
import { NavbarPublic } from '@/components/NavbarPublic';
import { ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-[#0A0A0A] font-['Outfit'] selection:bg-neutral-900 selection:text-white">
      
      <NavbarPublic activePage="about" />

      <main className="pt-24 pb-0">
        <div className="max-w-[1200px] mx-auto px-6">
          
          {/* Hero */}
          <div className="text-center mb-24 max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-neutral-200 bg-[#F9F9F9] mb-6 text-sm font-medium">
              Tentang Rephot
            </div>
            <h1 className="font-['Bricolage_Grotesque'] text-[40px] md:text-[64px] font-extrabold tracking-tight mb-8 text-[#0A0A0A] leading-[1.1]">
              Foto random &rarr; Foto produk profesional, dalam detik.
            </h1>
            <p className="text-[#888888] text-lg md:text-xl leading-[1.7] max-w-3xl mx-auto">
              Jutaan UMKM Indonesia jualan online tiap hari, tapi masih pakai foto seadanya dari kamera HP. Rephot hadir supaya siapapun bisa punya foto produk berkualitas studio &mdash; tanpa studio, tanpa fotografer, tanpa skill editing.
            </p>
          </div>

          {/* Story + Stats */}
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-start mb-32">
            
            {/* Story */}
            <div>
              <h2 className="font-['Bricolage_Grotesque'] text-[28px] md:text-[36px] font-bold tracking-tight mb-6 text-[#0A0A0A]">
                Kenapa kami buat Rephot?
              </h2>
              <div className="space-y-5 text-[#666666] text-[16px] leading-[1.8]">
                <p>
                  Kami melihat satu pola yang terus berulang: produk bagus gagal menarik pembeli karena fotonya jelek. Seller di Tokopedia, Shopee, dan Instagram sering foto produk di atas kasur, di lantai, atau di meja berantakan. Bukan karena tidak peduli &mdash; tapi karena opsi lain terlalu mahal atau ribet.
                </p>
                <p>
                  Sewa fotografer? Minimal ratusan ribu per sesi. Belajar Photoshop? Butuh berminggu-minggu. Pakai jasa editing? Harus nunggu berhari-hari.
                </p>
                <p>
                  Rephot menyelesaikan ini dengan AI. Upload foto produk dari HP, pilih style, tunggu beberapa detik &mdash; dapat variasi foto produk profesional siap dipakai di etalase online.
                </p>
                <p className="text-[#0A0A0A] font-medium border-l-2 border-[#0A0A0A] pl-6 my-4">
                  &quot;Kami percaya foto bagus bukan privilege orang yang punya budget besar. Itu hak semua orang yang jualan.&quot;
                </p>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="bg-[#F9F9F9] rounded-[28px] p-7 border border-neutral-200">
                  <div className="font-['Bricolage_Grotesque'] text-[36px] font-extrabold text-[#0A0A0A] leading-none mb-2">
                    &lt;10s
                  </div>
                  <p className="text-[#888888] text-sm font-medium">
                    Proses generate per foto
                  </p>
                </div>
                <div className="bg-[#F9F9F9] rounded-[28px] p-7 border border-neutral-200">
                  <div className="font-['Bricolage_Grotesque'] text-[36px] font-extrabold text-[#0A0A0A] leading-none mb-2">
                    7
                  </div>
                  <p className="text-[#888888] text-sm font-medium">
                    Preset style siap pakai
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="bg-[#F9F9F9] rounded-[28px] p-7 border border-neutral-200">
                  <div className="font-['Bricolage_Grotesque'] text-[36px] font-extrabold text-[#0A0A0A] leading-none mb-2">
                    2x
                  </div>
                  <p className="text-[#888888] text-sm font-medium">
                    Variasi output tiap generate
                  </p>
                </div>
                <div className="bg-[#F9F9F9] rounded-[28px] p-7 border border-neutral-200">
                  <div className="font-['Bricolage_Grotesque'] text-[36px] font-extrabold text-[#0A0A0A] leading-none mb-2">
                    8
                  </div>
                  <p className="text-[#888888] text-sm font-medium">
                    Token gratis akun baru
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Values */}
          <div className="mb-32">
            <div className="text-center mb-12">
              <h2 className="font-['Bricolage_Grotesque'] text-[32px] md:text-[44px] font-extrabold tracking-tight mb-4 text-[#0A0A0A]">
                Yang kami pegang teguh
              </h2>
              <p className="text-[#888888] text-lg max-w-2xl mx-auto">
                Prinsip di balik setiap keputusan produk yang kami buat.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-[#F9F9F9] rounded-[28px] p-8 border border-neutral-200">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-neutral-100 flex items-center justify-center mb-5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#0A0A0A]"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                </div>
                <h3 className="font-['Bricolage_Grotesque'] text-[22px] font-bold text-[#0A0A0A] mb-3">
                  Cepat &amp; Mudah
                </h3>
                <p className="text-[#888888] leading-[1.7]">
                  Upload, pilih style, selesai. Tidak ada learning curve, tidak perlu tutorial 30 menit. Kalau kamu bisa pakai Instagram, kamu bisa pakai Rephot.
                </p>
              </div>

              <div className="bg-[#F9F9F9] rounded-[28px] p-8 border border-neutral-200">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-neutral-100 flex items-center justify-center mb-5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#0A0A0A]"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
                </div>
                <h3 className="font-['Bricolage_Grotesque'] text-[22px] font-bold text-[#0A0A0A] mb-3">
                  Transparan &amp; Jujur
                </h3>
                <p className="text-[#888888] leading-[1.7]">
                  Tidak ada langganan tersembunyi. Token tidak kadaluarsa. Kalau generate gagal karena sistem kami, token dikembalikan otomatis. Sesimpel itu.
                </p>
              </div>

              <div className="bg-[#F9F9F9] rounded-[28px] p-8 border border-neutral-200">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-neutral-100 flex items-center justify-center mb-5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#0A0A0A]"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                </div>
                <h3 className="font-['Bricolage_Grotesque'] text-[22px] font-bold text-[#0A0A0A] mb-3">
                  AI yang Benar-benar Kerja
                </h3>
                <p className="text-[#888888] leading-[1.7]">
                  Bukan gimmick. Pipeline AI kami dibangun khusus untuk foto produk &mdash; lighting yang konsisten, background yang bersih, hasil yang siap upload ke marketplace.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* CTA Section */}
        <section className="bg-[#0A0A0A] py-24">
          <div className="max-w-[800px] mx-auto px-6 text-center">
            <h2 className="font-['Bricolage_Grotesque'] text-[32px] md:text-[48px] font-extrabold tracking-tight mb-6 text-white leading-[1.1]">
              Coba gratis, langsung lihat hasilnya.
            </h2>
            <p className="text-neutral-400 text-lg mb-10 max-w-xl mx-auto">
              Daftar sekarang dan dapat 8 token gratis &mdash; cukup untuk 2 foto produk profesional pertama kamu. Tanpa kartu kredit.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/app"
                className="inline-flex items-center gap-2 bg-white text-[#0A0A0A] px-8 py-3.5 rounded-full font-semibold hover:bg-neutral-200 transition-colors"
              >
                Mulai Generate
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 text-neutral-400 hover:text-white px-6 py-3.5 rounded-full font-medium transition-colors border border-neutral-800 hover:border-neutral-600"
              >
                Lihat Harga
              </Link>
            </div>
            <p className="text-neutral-600 text-sm mt-8">
              Rephot adalah produk dari <strong className="text-neutral-500">Restard</strong>
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white pt-8 pb-6">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2">
                <img src="/RePhot.svg" alt="Rephot" className="h-8 w-auto invert" />
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
              <Link href="/pricing" className="text-[#888888] hover:text-[#0A0A0A] text-sm font-medium transition-colors">Pricing</Link>
              <Link href="/about" className="text-[#0A0A0A] font-medium text-sm transition-colors">About</Link>
              <Link href="/app" className="text-[#888888] hover:text-[#0A0A0A] text-sm font-medium transition-colors">App</Link>
              <Link href="/terms" className="text-[#888888] hover:text-[#0A0A0A] text-sm font-medium transition-colors">Terms</Link>
              <Link href="/privacy" className="text-[#888888] hover:text-[#0A0A0A] text-sm font-medium transition-colors">Privacy</Link>
            </div>
          </div>
          <div className="text-center text-[#888888] text-sm border-t border-neutral-100 pt-6">
            &copy; {new Date().getFullYear()} Rephot. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
