'use client';

import Link from 'next/link';
import { HeroBackground } from "@/components/HeroBackground";
import { NavbarPublic } from "@/components/NavbarPublic";
import { Sparkles, Play, Wand2, ArrowRight, Layers, Image as ImageIcon, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#0A0A0A] font-['Outfit'] selection:bg-neutral-900 selection:text-white pb-20">
      
      <NavbarPublic transparent isScrolled={isScrolled} />

      <main>
        {/* HERO SECTION */}
        <div className="relative min-h-[100vh] w-full flex flex-col justify-center overflow-hidden pt-32 bg-[#0A0A0A]">
          <HeroBackground />
          <section className="relative z-20 max-w-[1200px] w-full mx-auto px-6 flex flex-col items-center text-center pt-10 pb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-black/40 backdrop-blur-md mb-8 text-sm font-medium shadow-2xl text-neutral-300">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>12,658 icons generated</span>
              <ArrowRight className="w-4 h-4 text-neutral-500" />
            </div>

            <h1 className="font-['Bricolage_Grotesque'] text-[48px] md:text-[72px] font-extrabold leading-[1.1] tracking-tight mb-2">
              <span className="block text-white">Dream It. Type It.</span>
              <span className="block text-neutral-500">Icon It.</span>
            </h1>

            <p className="text-neutral-300 text-lg md:text-xl max-w-2xl mt-6 mb-10 font-['Outfit']">
              Generate consistent 3D isometric icons from text or photos. Build your product&apos;s visual identity in seconds.
            </p>

            <div className="w-full max-w-2xl relative mb-16 shadow-2xl shadow-black/50 rounded-[20px]">
              <input 
                type="text" 
                placeholder="Describe your isometric icon..." 
                className="w-full bg-black/60 backdrop-blur-lg border border-white/10 rounded-[20px] py-5 pl-6 pr-36 text-lg outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all font-['Outfit'] text-white placeholder-neutral-500"
              />
              <Link href="/app" className="absolute right-2.5 top-2.5 bottom-2.5 bg-white text-black px-6 rounded-full font-medium flex items-center justify-center hover:bg-neutral-200 transition-colors">
                Generate
              </Link>
            </div>

            {/* Marquee/Carousel of Images */}
            <div className="w-full max-w-[1000px] overflow-hidden flex gap-4 relative py-4 mask-edges">
              <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent z-10 pointer-events-none" />
            </div>
          </section>
        </div>

        {/* DEMO VIDEO SECTION */}
        <section className="max-w-[1200px] mx-auto px-6 py-24 border-t border-neutral-100">
          <div className="text-center mb-16">
            <h2 className="font-['Bricolage_Grotesque'] text-[32px] md:text-[48px] font-extrabold tracking-tight mb-4 text-[#0A0A0A]">
              Watch Isometricon in action
            </h2>
            <p className="text-[#888888] text-lg max-w-2xl mx-auto">
              See the full workflow, from writing a prompt to exporting a polished isometric icon.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 max-w-[1000px] mx-auto">
            
            {/* Portrait Video (TikTok) */}
            <a 
              href="https://tiktok.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="relative group block shrink-0 w-[260px] md:w-[280px] rounded-[32px] overflow-hidden shadow-2xl shadow-black/10 border-4 border-white bg-[#0A0A0A] transition-transform hover:-translate-y-2 duration-300"
            >
              <video 
                src="https://media.w3.org/2010/05/sintel/trailer_hd.mp4" 
                autoPlay loop muted playsInline 
                className="w-full h-full object-cover aspect-[9/16] opacity-90 group-hover:opacity-100 transition-opacity duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/80 pointer-events-none transition-opacity group-hover:opacity-90"></div>
              
              <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-white flex items-center gap-1.5 border border-white/10">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                Live Demo
              </div>

              <div className="absolute bottom-6 left-6 right-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white group-hover:bg-white group-hover:text-black transition-colors">
                  <Play className="w-4 h-4 ml-0.5 fill-current" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Quick Start</p>
                  <p className="text-white/70 text-xs">Watch on TikTok</p>
                </div>
              </div>
            </a>

            {/* Landscape Video (YouTube) */}
            <a 
              href="https://youtube.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="relative group block w-full max-w-[600px] rounded-[24px] overflow-hidden shadow-2xl shadow-black/10 border-4 border-white bg-[#0A0A0A] transition-transform hover:-translate-y-2 duration-300"
            >
              <video 
                src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" 
                autoPlay loop muted playsInline 
                className="w-full h-full object-cover aspect-[16/9] opacity-90 group-hover:opacity-100 transition-opacity duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/80 pointer-events-none transition-opacity group-hover:opacity-90"></div>
              
              <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-white flex items-center gap-1.5 border border-white/10">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                Tutorial
              </div>

              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-90 group-hover:scale-100">
                 <div className="w-16 h-16 rounded-full bg-[#FF0000] flex items-center justify-center shadow-lg text-white">
                  <Play className="w-6 h-6 ml-1 fill-white" />
                </div>
              </div>

              <div className="absolute bottom-6 left-6 right-6 flex items-center gap-4">
                <div>
                  <p className="text-white font-bold text-lg">Full Walkthrough</p>
                  <p className="text-white/80 text-sm">Watch on YouTube</p>
                </div>
              </div>
            </a>

          </div>
        </section>

        {/* INTERACTIVE DEMO SECTION */}
        <section className="bg-[rgba(240,240,240,0.3)] py-24">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="font-['Bricolage_Grotesque'] text-[32px] md:text-[48px] font-extrabold tracking-tight mb-6 text-[#0A0A0A] leading-[1.1]">
                  Type a prompt.<br/>Get an icon.
                </h2>
                <p className="text-[#888888] text-lg mb-8 leading-[1.6]">
                  Stop searching for the perfect matching icon set. Generate exactly what you need in your brand&apos;s colors with a simple text prompt. It&apos;s like having a 3D artist on demand.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <Link href="/app" className="bg-[#0A0A0A] text-white px-8 py-3.5 rounded-full font-medium hover:bg-neutral-800 transition-colors w-full sm:w-auto text-center">
                    Try It Yourself
                  </Link>
                  <span className="text-sm text-[#888888]">No credit card required</span>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-xl shadow-black/5 border border-neutral-200">
                <div className="text-xs font-bold text-[#888888] uppercase tracking-wider mb-2">Your Prompt</div>
                <div className="bg-[#F9F9F9] rounded-xl p-4 border border-neutral-200 mb-6 font-medium text-[#0A0A0A]">
                  &quot;A minimalist 3D isometric coffee cup with a subtle shadow, clean lighting, white background.&quot;
                </div>
                
                <div 
                  className="aspect-square bg-[#F9F9F9] rounded-2xl border border-neutral-200 overflow-hidden relative group"
                  style={{ '--position': '50%' } as React.CSSProperties}
                >
                  <img 
                    src="https://images.unsplash.com/photo-1632233163919-799de51faf01?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwY29mZmVlJTIwY3VwJTIwcHJvZHVjdHxlbnwxfHx8fDE3NzU0NTQ1NDB8MA&ixlib=rb-4.1.0&q=80&w=1080" 
                    alt="Demo Output"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  />

                  <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{ clipPath: 'polygon(0 0, var(--position) 0, var(--position) 100%, 0 100%)' }}
                  >
                    <img 
                      src="https://images.unsplash.com/photo-1632233163919-799de51faf01?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwY29mZmVlJTIwY3VwJTIwcHJvZHVjdHxlbnwxfHx8fDE3NzU0NTQ1NDB8MA&ixlib=rb-4.1.0&q=80&w=1080" 
                      alt="Before Output"
                      className="absolute inset-0 w-full h-full object-cover grayscale brightness-75 blur-[2px]"
                    />
                    <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
                  </div>

                  <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] pointer-events-none z-10"
                    style={{ left: 'var(--position)', transform: 'translateX(-50%)' }}
                  >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center text-neutral-600 border border-neutral-200">
                      <div className="flex gap-0.5">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
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
                    Before
                  </div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-[#0A0A0A] shadow-sm border border-black/5 flex items-center gap-1.5 pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Zap className="w-3.5 h-3.5 text-amber-500 fill-current" />
                    After
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="max-w-[1200px] mx-auto px-6 py-24">
          <div className="flex flex-col items-center text-center mb-16">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-neutral-200 bg-[#F3F3F3] mb-6 text-sm font-medium">
              Features
            </div>
            <h2 className="font-['Bricolage_Grotesque'] text-[32px] md:text-[48px] font-extrabold tracking-tight text-[#0A0A0A]">
              Isometricon Features
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#F9F9F9] rounded-2xl p-8 border border-neutral-200">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-neutral-100 flex items-center justify-center mb-6">
                <Wand2 className="w-6 h-6 text-[#0A0A0A]" />
              </div>
              <h3 className="text-[24px] font-bold text-[#0A0A0A] mb-3">Text&#8209;to&#8209;Icon</h3>
              <p className="text-[#888888] leading-[1.6]">
                Simply describe what you want, and our AI generates a perfect 3D isometric icon matching your prompt in seconds.
              </p>
            </div>

            <div className="bg-[#F9F9F9] rounded-2xl p-8 border border-neutral-200">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-neutral-100 flex items-center justify-center mb-6">
                <Layers className="w-6 h-6 text-[#0A0A0A]" />
              </div>
              <h3 className="text-[24px] font-bold text-[#0A0A0A] mb-3">Batch&#8209;Icon</h3>
              <p className="text-[#888888] leading-[1.6]">
                Generate an entire set of matching icons at once. Ensure perfect consistency across your whole product interface.
              </p>
            </div>

            <div className="bg-[#F9F9F9] rounded-2xl p-8 border border-neutral-200">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-neutral-100 flex items-center justify-center mb-6">
                <ImageIcon className="w-6 h-6 text-[#0A0A0A]" />
              </div>
              <h3 className="text-[24px] font-bold text-[#0A0A0A] mb-3">Image&#8209;to&#8209;Icon</h3>
              <p className="text-[#888888] leading-[1.6]">
                Upload a 2D sketch, photo, or logo, and turn it into a gorgeous 3D isometric asset automatically.
              </p>
            </div>
          </div>
        </section>

        {/* USE CASE SECTION */}
        <section className="bg-[#0A0A0A] text-white py-24">
          <div className="max-w-[1200px] mx-auto px-6 text-center">
            <h2 className="font-['Bricolage_Grotesque'] text-[32px] md:text-[48px] font-extrabold tracking-tight mb-6">
              Built for every use case
            </h2>
            <p className="text-neutral-400 text-lg max-w-2xl mx-auto mb-10">
              From startups to enterprises, designers and developers use Isometricon to create stunning visuals without opening a 3D software.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto mb-12">
              {['Web Designers', 'App Developers', 'Presentation Makers', 'Social Media Creators', 'Game Developers', 'Marketers'].map((persona) => (
                <div key={persona} className="px-5 py-2.5 rounded-full border border-neutral-800 bg-neutral-900 text-neutral-300 font-medium">
                  {persona}
                </div>
              ))}
            </div>

            <Link href="#" className="inline-flex items-center gap-2 text-white font-medium hover:text-neutral-300 transition-colors group">
              Explore all possibilities 
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>

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
              <Link href="/about" className="text-[#888888] hover:text-[#0A0A0A] text-sm font-medium transition-colors">About</Link>
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

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}} />
    </div>
  );
}
