'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { createClient } from '@/lib/supabase/client';
import { useAuthModal } from '@/components/auth/auth-context';

interface NavbarPublicProps {
  transparent?: boolean;
  isScrolled?: boolean;
  activePage?: 'pricing' | 'about' | 'app';
}

export function NavbarPublic({ transparent = false, isScrolled = false, activePage }: NavbarPublicProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);
  const { user, loading } = useUser();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const { openAuth } = useAuthModal();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const useTransparent = transparent && !isScrolled;

  const navClass = transparent
    ? `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md border-b border-neutral-100' : 'bg-transparent border-b border-transparent'}`
    : 'sticky top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100 transition-all duration-300';

  const linkClass = (isActive: boolean) =>
    `font-medium transition-colors text-sm ${isActive
      ? (useTransparent ? 'text-white' : 'text-black')
      : (useTransparent ? 'text-white hover:text-neutral-300' : 'text-[#888888] hover:text-black')
    }`;

  return (
    <nav className={navClass}>
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/">
            <img
              src="/RePhot.svg"
              alt="Rephot"
              className={`h-8 w-auto transition-all duration-300 ${useTransparent ? 'invert-0' : 'invert'}`}
            />
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/pricing" className={linkClass(activePage === 'pricing')}>Pricing</Link>
          <Link href="/about" className={linkClass(activePage === 'about')}>About</Link>
          <Link href="/app" className={linkClass(activePage === 'app')}>App</Link>
        </div>

        <div className="hidden md:flex items-center gap-6">
          {loading ? (
            <div className="w-24 h-9 bg-neutral-100 rounded-full animate-pulse" />
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              <div 
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              >
                <span className={`text-sm font-medium transition-colors ${useTransparent ? 'text-white hover:text-neutral-300' : 'text-[#0A0A0A] hover:text-black/80'}`}>
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </span>
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Profile"
                    className="w-9 h-9 rounded-full object-cover border border-neutral-200 shadow-sm"
                  />
                ) : (
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${useTransparent ? 'bg-white/20 text-white border border-white/30' : 'bg-neutral-200 text-neutral-600 border border-neutral-300'}`}>
                    {user.email?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
              </div>

              {isProfileDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg py-1 z-50">
                  <button className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors">
                    Change Profile Photo
                  </button>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-neutral-50 transition-colors">
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => openAuth('signin')}
                className={`text-sm font-medium transition-colors ${useTransparent ? 'text-white hover:text-neutral-300' : 'text-[#0A0A0A] hover:text-black/80'}`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => openAuth('signup')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${useTransparent ? 'bg-white text-black hover:bg-neutral-200' : 'bg-[#0A0A0A] text-white hover:bg-black/80'}`}
              >
                Sign up
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`md:hidden p-2 rounded-lg transition-colors ${useTransparent ? 'text-white hover:bg-white/10' : 'text-black hover:bg-black/5'}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-neutral-100 shadow-lg py-4 px-6 flex flex-col gap-4">
          <Link href="/pricing" className="font-medium text-black text-sm py-2" onClick={() => setIsMobileMenuOpen(false)}>Pricing</Link>
          <Link href="/about" className="font-medium text-black text-sm py-2" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
          <Link href="/app" className="font-medium text-black text-sm py-2" onClick={() => setIsMobileMenuOpen(false)}>App</Link>
          <hr className="border-neutral-100" />
          {user ? (
            <div className="relative" ref={mobileDropdownRef}>
              <div 
                className="flex items-center gap-3 py-2 cursor-pointer"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              >
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover border border-neutral-200" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-bold text-neutral-600">
                    {user.email?.[0]?.toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium text-neutral-800">{user.user_metadata?.full_name || user.email}</span>
              </div>
              
              {isProfileDropdownOpen && (
                <div className="absolute top-full left-0 w-full bg-white border border-neutral-200 rounded-lg shadow-sm py-1 z-50">
                  <button className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors">
                    Change Profile Photo
                  </button>
                  <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-neutral-50 transition-colors">
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                type="button"
                className="w-full text-left font-medium text-black text-sm py-2"
                onClick={() => {
                  openAuth('signin');
                  setIsMobileMenuOpen(false);
                }}
              >
                Login
              </button>
              <button
                type="button"
                className="font-medium bg-[#0A0A0A] text-white text-sm py-2 px-4 rounded-full text-center mt-2 w-full"
                onClick={() => {
                  openAuth('signup');
                  setIsMobileMenuOpen(false);
                }}
              >
                Sign up
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
