'use client';

import Link from 'next/link';
import { NavbarPublic } from '@/components/NavbarPublic';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-[#0A0A0A] font-['Outfit'] selection:bg-neutral-900 selection:text-white pb-20">
      <NavbarPublic />

      <main className="pt-24 pb-32">
        <div className="max-w-[800px] mx-auto px-6">

          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-neutral-200 bg-[#F9F9F9] mb-6 text-sm font-medium">
              Legal
            </div>
            <h1 className="font-['Bricolage_Grotesque'] text-[40px] md:text-[56px] font-extrabold tracking-tight mb-4 text-[#0A0A0A] leading-[1.1]">
              Syarat &amp; Ketentuan
            </h1>
            <p className="text-[#888888] text-base">
              Terakhir diperbarui: 8 April 2026
            </p>
          </div>

          {/* Content */}
          <div className="space-y-12 text-[#444444] text-[16px] leading-[1.8]">

            {/* 1 */}
            <section>
              <h2 className="font-['Bricolage_Grotesque'] text-[24px] md:text-[28px] font-bold text-[#0A0A0A] mb-4">
                1. Penerimaan Syarat
              </h2>
              <p>
                Dengan mengakses atau menggunakan layanan Rephot (<Link href="/" className="underline underline-offset-4 hover:text-[#0A0A0A] transition-colors">rephot.id</Link>), Anda menyetujui dan terikat oleh Syarat &amp; Ketentuan ini secara penuh. Jika Anda tidak menyetujui ketentuan ini, mohon untuk tidak menggunakan layanan kami.
              </p>
            </section>

            {/* 2 */}
            <section>
              <h2 className="font-['Bricolage_Grotesque'] text-[24px] md:text-[28px] font-bold text-[#0A0A0A] mb-4">
                2. Deskripsi Layanan
              </h2>
              <p className="mb-4">
                Rephot adalah platform berbasis AI yang mentransformasi foto produk biasa menjadi foto produk profesional berkualitas tinggi. Layanan kami menggunakan sistem token sebagai mata uang internal:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Setiap pengguna baru mendapatkan <strong>8 token gratis</strong> untuk mencoba layanan.</li>
                <li>Setiap proses generate membutuhkan <strong>4 token</strong>.</li>
                <li>Token tambahan dapat dibeli melalui halaman <Link href="/pricing" className="underline underline-offset-4 hover:text-[#0A0A0A] transition-colors">Pricing</Link>.</li>
              </ul>
            </section>

            {/* 3 */}
            <section>
              <h2 className="font-['Bricolage_Grotesque'] text-[24px] md:text-[28px] font-bold text-[#0A0A0A] mb-4">
                3. Akun Pengguna
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Setiap orang hanya diperbolehkan memiliki <strong>satu akun</strong>.</li>
                <li>Pembuatan akun ganda dengan tujuan mengeksploitasi token gratis (free tier abuse) dilarang keras dan akan mengakibatkan penangguhan seluruh akun terkait.</li>
                <li>Anda bertanggung jawab penuh atas keamanan kredensial akun Anda.</li>
                <li>Anda wajib memberikan informasi yang akurat saat mendaftar.</li>
              </ul>
            </section>

            {/* 4 */}
            <section>
              <h2 className="font-['Bricolage_Grotesque'] text-[24px] md:text-[28px] font-bold text-[#0A0A0A] mb-4">
                4. Token &amp; Pembayaran
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Token yang sudah dibeli <strong>tidak memiliki masa kadaluarsa</strong> &mdash; token Anda akan tetap tersedia selama akun aktif.</li>
                <li>Pembayaran bersifat <strong>final dan tidak dapat di-refund</strong>, kecuali dalam kondisi berikut: jika proses generate gagal karena kesalahan sistem, token yang terpakai akan <strong>dikembalikan secara otomatis</strong> ke akun Anda.</li>
                <li>Harga yang tertera di halaman pricing sudah termasuk pajak (jika ada).</li>
                <li>Pembayaran diproses melalui Mayar.id sebagai payment gateway resmi kami.</li>
              </ul>
            </section>

            {/* 5 */}
            <section>
              <h2 className="font-['Bricolage_Grotesque'] text-[24px] md:text-[28px] font-bold text-[#0A0A0A] mb-4">
                5. Hak atas Konten
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Anda <strong>tetap menjadi pemilik penuh</strong> atas foto input yang Anda unggah.</li>
                <li>Anda <strong>memiliki hak penuh</strong> atas semua gambar output yang dihasilkan oleh Rephot, termasuk hak untuk penggunaan komersial.</li>
                <li>Dengan mengunggah foto, Anda memberikan kami lisensi terbatas untuk memproses foto tersebut melalui pipeline AI kami semata-mata untuk tujuan menghasilkan output.</li>
                <li>Kami tidak mengklaim kepemilikan atas konten input maupun output Anda.</li>
              </ul>
            </section>

            {/* 6 */}
            <section>
              <h2 className="font-['Bricolage_Grotesque'] text-[24px] md:text-[28px] font-bold text-[#0A0A0A] mb-4">
                6. Larangan Penggunaan
              </h2>
              <p className="mb-4">Anda dilarang menggunakan Rephot untuk:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Menghasilkan konten yang melanggar hukum, mengandung SARA, pornografi, atau kekerasan.</li>
                <li>Mengunggah gambar yang melanggar hak cipta pihak lain.</li>
                <li>Melakukan rekayasa balik (reverse engineering) terhadap sistem AI kami.</li>
                <li>Mengotomatisasi akses ke layanan tanpa izin tertulis (scraping, botting).</li>
                <li>Menyalahgunakan sistem token dengan cara apapun.</li>
              </ul>
            </section>

            {/* 7 */}
            <section>
              <h2 className="font-['Bricolage_Grotesque'] text-[24px] md:text-[28px] font-bold text-[#0A0A0A] mb-4">
                7. Batasan Tanggung Jawab
              </h2>
              <p className="mb-4">
                Rephot disediakan secara &quot;as is&quot; dan &quot;as available&quot;. Kami tidak menjamin bahwa:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Layanan akan selalu tersedia tanpa gangguan.</li>
                <li>Hasil generate akan selalu sesuai ekspektasi Anda.</li>
                <li>Layanan bebas dari bug atau error.</li>
              </ul>
              <p className="mt-4">
                Dalam hal apapun, total tanggung jawab kami kepada Anda tidak akan melebihi jumlah yang telah Anda bayarkan kepada kami dalam 12 bulan terakhir.
              </p>
            </section>

            {/* 8 */}
            <section>
              <h2 className="font-['Bricolage_Grotesque'] text-[24px] md:text-[28px] font-bold text-[#0A0A0A] mb-4">
                8. Hukum yang Berlaku
              </h2>
              <p>
                Syarat &amp; Ketentuan ini diatur dan ditafsirkan berdasarkan hukum yang berlaku di <strong>Republik Indonesia</strong>. Segala sengketa yang timbul akan diselesaikan melalui musyawarah terlebih dahulu, dan jika tidak tercapai kesepakatan, akan diselesaikan melalui pengadilan yang berwenang di Indonesia.
              </p>
            </section>

            {/* 9 */}
            <section>
              <h2 className="font-['Bricolage_Grotesque'] text-[24px] md:text-[28px] font-bold text-[#0A0A0A] mb-4">
                9. Kontak
              </h2>
              <p>
                Jika Anda memiliki pertanyaan mengenai Syarat &amp; Ketentuan ini, silakan hubungi kami melalui:
              </p>
              <div className="mt-4 inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#F9F9F9] border border-neutral-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#888888]"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                <a href="mailto:hello@rephot.id" className="font-medium text-[#0A0A0A] hover:underline underline-offset-4">
                  hello@rephot.id
                </a>
              </div>
            </section>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white pt-16 pb-8">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2">
                <img src="/RePhot.svg" alt="Rephot" className="h-8 w-auto invert" />
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
              <Link href="/pricing" className="text-[#888888] hover:text-[#0A0A0A] text-sm font-medium transition-colors">Pricing</Link>
              <Link href="/about" className="text-[#888888] hover:text-[#0A0A0A] text-sm font-medium transition-colors">About</Link>
              <Link href="/app" className="text-[#888888] hover:text-[#0A0A0A] text-sm font-medium transition-colors">App</Link>
              <Link href="/terms" className="text-[#0A0A0A] font-medium text-sm transition-colors">Terms</Link>
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
