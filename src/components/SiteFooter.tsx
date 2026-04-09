import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-white pt-8 pb-6">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-6">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <img src="/RePhot.svg" alt="Rephot" className="h-8 w-auto invert" />
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            <Link href="/pricing" className="text-[#888888] hover:text-[#0A0A0A] text-sm font-medium transition-colors">
              Pricing
            </Link>
            <Link href="/about" className="text-[#888888] hover:text-[#0A0A0A] text-sm font-medium transition-colors">
              About
            </Link>
            <Link href="/app" className="text-[#888888] hover:text-[#0A0A0A] text-sm font-medium transition-colors">
              App
            </Link>
            <Link href="/terms" className="text-[#888888] hover:text-[#0A0A0A] text-sm font-medium transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="text-[#888888] hover:text-[#0A0A0A] text-sm font-medium transition-colors">
              Privacy
            </Link>
          </div>
        </div>

        <div className="text-center text-[#888888] text-sm border-t border-neutral-100 pt-6">
          &copy; {new Date().getFullYear()} Rephot. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
