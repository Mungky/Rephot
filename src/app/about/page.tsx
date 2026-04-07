'use client';

import Link from 'next/link';
import { NavbarPublic } from "@/components/NavbarPublic";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-[#0A0A0A] font-['Outfit'] selection:bg-neutral-900 selection:text-white pb-20">
      
      <NavbarPublic activePage="about" />

      <main className="pt-24 pb-32">
        <div className="max-w-[1200px] mx-auto px-6">
          
          <div className="text-center mb-24 max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-neutral-200 bg-[#F9F9F9] mb-6 text-sm font-medium">
              About us
            </div>
            <h1 className="font-['Bricolage_Grotesque'] text-[48px] md:text-[72px] font-extrabold tracking-tight mb-8 text-[#0A0A0A] leading-[1.1]">
              Democratizing 3D design for everyone.
            </h1>
            <p className="text-[#888888] text-xl md:text-2xl leading-[1.6]">
              We built Isometricon because creating consistent, high-quality 3D assets used to require years of software training and hours of rendering. Now, it takes seconds.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
            <div className="aspect-square bg-[#F9F9F9] rounded-[40px] border border-neutral-200 overflow-hidden relative group">
              <img 
                src="https://images.unsplash.com/photo-1600132806370-bf17e65e942f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxhcmNoaXRlY3R1cmUlMjBtaW5pbWFsfGVufDB8fHx8MTcyNDA5NTEwN3ww&ixlib=rb-4.1.0&q=80&w=1080" 
                alt="Our Vision"
                className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
              />
            </div>
            <div>
              <h2 className="font-['Bricolage_Grotesque'] text-[32px] md:text-[40px] font-bold tracking-tight mb-6 text-[#0A0A0A]">
                Our Mission
              </h2>
              <div className="space-y-6 text-[#666666] text-lg leading-[1.7]">
                <p>
                  Isometricon (formerly Rephot) started as a small internal tool to speed up landing page mockups. We found ourselves constantly searching for perfectly matching 3D icons, only to settle for mismatched, generic asset packs.
                </p>
                <p>
                  So we built a proprietary AI pipeline that generates perfectly lit, orthographic 3D models with transparent backgrounds. It ensures that whether you&apos;re generating a coffee cup or a cloud server, the lighting, shadows, and perspective are identical.
                </p>
                <p className="text-[#0A0A0A] font-medium border-l-2 border-black pl-6 my-8">
                  &quot;Our goal is to make 3D assets as accessible and easy to generate as a simple web font.&quot;
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mb-16">
            <h2 className="font-['Bricolage_Grotesque'] text-[32px] md:text-[48px] font-bold tracking-tight mb-4 text-[#0A0A0A]">
              Connect with us
            </h2>
            <p className="text-[#888888] text-lg max-w-2xl mx-auto mb-10">
              We&apos;re a small, remote-first team building tools for designers and developers. Follow our journey.
            </p>
            <div className="flex items-center justify-center gap-6">
              <a href="#" className="w-14 h-14 rounded-full bg-[#F9F9F9] border border-neutral-200 flex items-center justify-center text-[#0A0A0A] hover:bg-black hover:text-white transition-colors group">
                <svg className="w-6 h-6 group-hover:-mt-1 transition-all" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" className="w-14 h-14 rounded-full bg-[#F9F9F9] border border-neutral-200 flex items-center justify-center text-[#0A0A0A] hover:bg-black hover:text-white transition-colors group">
                <svg className="w-6 h-6 group-hover:-mt-1 transition-all" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <a href="#" className="w-14 h-14 rounded-full bg-[#F9F9F9] border border-neutral-200 flex items-center justify-center text-[#0A0A0A] hover:bg-black hover:text-white transition-colors group">
                <svg className="w-6 h-6 group-hover:-mt-1 transition-all" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>

        </div>
      </main>

      {/* FOOTER */}
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
              <Link href="/about" className="text-[#0A0A0A] font-medium text-sm transition-colors">About</Link>
              <Link href="/app" className="text-[#888888] hover:text-[#0A0A0A] text-sm font-medium transition-colors">App</Link>
              <Link href="#" className="text-[#888888] hover:text-[#0A0A0A] text-sm font-medium transition-colors">Testimonials</Link>
              <Link href="#" className="text-[#888888] hover:text-[#0A0A0A] text-sm font-medium transition-colors">Terms</Link>
              <Link href="#" className="text-[#888888] hover:text-[#0A0A0A] text-sm font-medium transition-colors">Privacy Policy</Link>
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
