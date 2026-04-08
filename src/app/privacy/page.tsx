'use client';

import Link from 'next/link';
import { NavbarPublic } from '@/components/NavbarPublic';

export default function PrivacyPage() {
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
              Kebijakan Privasi
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
                1. Pendahuluan
              </h2>
              <p>
                Rephot (&quot;kami&quot;, &quot;kita&quot;) menghormati privasi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi data pribadi Anda saat menggunakan layanan kami di <Link href="/" className="underline underline-offset-4 hover:text-[#0A0A0A] transition-colors">rephot.id</Link>.
              </p>
            </section>

            {/* 2 */}
            <section>
              <h2 className="font-['Bricolage_Grotesque'] text-[24px] md:text-[28px] font-bold text-[#0A0A0A] mb-4">
                2. Data yang Dikumpulkan
              </h2>
              <p className="mb-4">Kami mengumpulkan data berikut:</p>

              <div className="space-y-6">
                <div className="bg-[#F9F9F9] rounded-2xl p-6 border border-neutral-200">
                  <h3 className="font-bold text-[#0A0A0A] mb-2">Data Akun</h3>
                  <p>Nama, alamat email, dan foto profil (jika menggunakan login Google). Kami <strong>tidak</strong> menyimpan password secara langsung &mdash; autentikasi dikelola oleh Supabase Auth.</p>
                </div>

                <div className="bg-[#F9F9F9] rounded-2xl p-6 border border-neutral-200">
                  <h3 className="font-bold text-[#0A0A0A] mb-2">Foto yang Diunggah</h3>
                  <p>Foto produk yang Anda unggah untuk diproses oleh AI kami. Lihat bagian &quot;Penyimpanan Foto&quot; untuk detail retensi.</p>
                </div>

                <div className="bg-[#F9F9F9] rounded-2xl p-6 border border-neutral-200">
                  <h3 className="font-bold text-[#0A0A0A] mb-2">Log Aktivitas</h3>
                  <p>Riwayat generate, penggunaan token, dan log transaksi pembayaran untuk keperluan audit dan dukungan pelanggan.</p>
                </div>
              </div>

              <div className="mt-6 flex items-start gap-3 px-5 py-4 rounded-2xl bg-green-50 border border-green-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 shrink-0 mt-0.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
                <p className="text-green-800 text-sm">
                  Kami <strong>tidak menyimpan data kartu kredit atau informasi pembayaran</strong> Anda. Seluruh proses pembayaran ditangani sepenuhnya oleh Mayar.id.
                </p>
              </div>
            </section>

            {/* 3 */}
            <section>
              <h2 className="font-['Bricolage_Grotesque'] text-[24px] md:text-[28px] font-bold text-[#0A0A0A] mb-4">
                3. Bagaimana Data Digunakan
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Memproses foto Anda melalui pipeline AI untuk menghasilkan output.</li>
                <li>Mengelola akun, saldo token, dan riwayat transaksi Anda.</li>
                <li>Mengirim notifikasi terkait layanan (bukan marketing) jika diperlukan.</li>
                <li>Meningkatkan kualitas layanan berdasarkan data agregat dan anonim.</li>
                <li>Mencegah penyalahgunaan dan menjaga keamanan platform.</li>
              </ul>
            </section>

            {/* 4 */}
            <section>
              <h2 className="font-['Bricolage_Grotesque'] text-[24px] md:text-[28px] font-bold text-[#0A0A0A] mb-4">
                4. Penyimpanan Foto
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Foto input yang Anda unggah disimpan sementara di Cloudinary untuk keperluan pemrosesan.</li>
                <li>Foto input <strong>dihapus secara otomatis</strong> setelah proses generate selesai.</li>
                <li>Foto output (hasil generate) disimpan dan tersedia di Library Anda selama akun aktif, atau sampai Anda menghapusnya secara manual.</li>
              </ul>
            </section>

            {/* 5 */}
            <section>
              <h2 className="font-['Bricolage_Grotesque'] text-[24px] md:text-[28px] font-bold text-[#0A0A0A] mb-4">
                5. Pihak Ketiga
              </h2>
              <p className="mb-4">Kami menggunakan layanan pihak ketiga berikut untuk menjalankan platform:</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-[#F9F9F9] rounded-2xl p-5 border border-neutral-200">
                  <h3 className="font-bold text-[#0A0A0A] mb-1 text-sm">Supabase</h3>
                  <p className="text-sm text-[#888888]">Database, autentikasi, dan penyimpanan file.</p>
                </div>
                <div className="bg-[#F9F9F9] rounded-2xl p-5 border border-neutral-200">
                  <h3 className="font-bold text-[#0A0A0A] mb-1 text-sm">Cloudinary</h3>
                  <p className="text-sm text-[#888888]">Penyimpanan dan pemrosesan gambar sementara.</p>
                </div>
                <div className="bg-[#F9F9F9] rounded-2xl p-5 border border-neutral-200">
                  <h3 className="font-bold text-[#0A0A0A] mb-1 text-sm">Mayar.id</h3>
                  <p className="text-sm text-[#888888]">Payment gateway untuk pembelian token.</p>
                </div>
                <div className="bg-[#F9F9F9] rounded-2xl p-5 border border-neutral-200">
                  <h3 className="font-bold text-[#0A0A0A] mb-1 text-sm">Wavespeed</h3>
                  <p className="text-sm text-[#888888]">AI inference engine untuk generate gambar.</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-[#888888]">
                Masing-masing pihak ketiga memiliki kebijakan privasi mereka sendiri. Kami hanya membagikan data yang diperlukan untuk menjalankan layanan.
              </p>
            </section>

            {/* 6 */}
            <section>
              <h2 className="font-['Bricolage_Grotesque'] text-[24px] md:text-[28px] font-bold text-[#0A0A0A] mb-4">
                6. Keamanan Data
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Seluruh komunikasi dienkripsi menggunakan HTTPS/TLS.</li>
                <li>Data disimpan di infrastruktur Supabase yang comply dengan standar keamanan industri.</li>
                <li>Akses ke database dibatasi menggunakan Row Level Security (RLS) dan service role keys.</li>
                <li>Webhook pembayaran diverifikasi menggunakan HMAC signature.</li>
              </ul>
            </section>

            {/* 7 */}
            <section>
              <h2 className="font-['Bricolage_Grotesque'] text-[24px] md:text-[28px] font-bold text-[#0A0A0A] mb-4">
                7. Hak Pengguna
              </h2>
              <p className="mb-4">Anda memiliki hak untuk:</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 bg-[#F9F9F9] rounded-2xl p-5 border border-neutral-200">
                  <div className="w-8 h-8 rounded-full bg-white border border-neutral-200 flex items-center justify-center shrink-0 text-sm font-bold text-[#0A0A0A]">1</div>
                  <div>
                    <h3 className="font-bold text-[#0A0A0A] text-sm">Akses</h3>
                    <p className="text-sm text-[#888888]">Melihat data pribadi yang kami simpan tentang Anda.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-[#F9F9F9] rounded-2xl p-5 border border-neutral-200">
                  <div className="w-8 h-8 rounded-full bg-white border border-neutral-200 flex items-center justify-center shrink-0 text-sm font-bold text-[#0A0A0A]">2</div>
                  <div>
                    <h3 className="font-bold text-[#0A0A0A] text-sm">Koreksi</h3>
                    <p className="text-sm text-[#888888]">Memperbarui atau memperbaiki data yang tidak akurat.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-[#F9F9F9] rounded-2xl p-5 border border-neutral-200">
                  <div className="w-8 h-8 rounded-full bg-white border border-neutral-200 flex items-center justify-center shrink-0 text-sm font-bold text-[#0A0A0A]">3</div>
                  <div>
                    <h3 className="font-bold text-[#0A0A0A] text-sm">Hapus</h3>
                    <p className="text-sm text-[#888888]">Meminta penghapusan akun dan seluruh data terkait.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-[#F9F9F9] rounded-2xl p-5 border border-neutral-200">
                  <div className="w-8 h-8 rounded-full bg-white border border-neutral-200 flex items-center justify-center shrink-0 text-sm font-bold text-[#0A0A0A]">4</div>
                  <div>
                    <h3 className="font-bold text-[#0A0A0A] text-sm">Portabilitas</h3>
                    <p className="text-sm text-[#888888]">Mengunduh data Anda dalam format yang dapat dibaca mesin.</p>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm text-[#888888]">
                Untuk menggunakan hak-hak di atas, silakan hubungi kami melalui email di bawah. Kami akan memproses permintaan Anda dalam waktu 30 hari kerja.
              </p>
            </section>

            {/* 8 */}
            <section>
              <h2 className="font-['Bricolage_Grotesque'] text-[24px] md:text-[28px] font-bold text-[#0A0A0A] mb-4">
                8. Cookies
              </h2>
              <p>
                Rephot hanya menggunakan <strong>cookies yang diperlukan untuk autentikasi</strong> (session cookies dari Supabase Auth). Kami <strong>tidak menggunakan cookies pelacakan (tracking cookies)</strong> dari pihak ketiga seperti Google Analytics, Facebook Pixel, atau layanan iklan lainnya.
              </p>
            </section>

            {/* 9 */}
            <section>
              <h2 className="font-['Bricolage_Grotesque'] text-[24px] md:text-[28px] font-bold text-[#0A0A0A] mb-4">
                9. Kontak
              </h2>
              <p>
                Jika Anda memiliki pertanyaan atau permintaan terkait data pribadi Anda, silakan hubungi kami:
              </p>
              <div className="mt-4 inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#F9F9F9] border border-neutral-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#888888]"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                <a href="mailto:privacy@rephot.id" className="font-medium text-[#0A0A0A] hover:underline underline-offset-4">
                  privacy@rephot.id
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
              <Link href="/terms" className="text-[#888888] hover:text-[#0A0A0A] text-sm font-medium transition-colors">Terms</Link>
              <Link href="/privacy" className="text-[#0A0A0A] font-medium text-sm transition-colors">Privacy</Link>
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
