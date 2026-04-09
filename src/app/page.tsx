import { LandingPageClient } from '@/components/landing/LandingPageClient';
import { SiteFooter } from '@/components/SiteFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#0A0A0A] font-['Outfit'] selection:bg-neutral-900 selection:text-white">
      <LandingPageClient />
      <SiteFooter />
    </div>
  );
}
