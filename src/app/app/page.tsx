'use client';

import { Suspense, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ControlPanel } from '@/components/ControlPanel';
import { MainStage } from '@/components/MainStage';
import { LibraryProgressCard } from '@/components/LibraryProgressCard';
import { QueueBusyNotice } from '@/components/QueueBusyNotice';
import { LibraryDetailModal } from '@/components/LibraryDetailModal';
import { BottomTabNav } from '@/components/app/BottomTabNav';
import { useUser } from '@/hooks/useUser';

const STORAGE_KEY = 'rephot_active_generation';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getDisplayName } from '@/lib/display-name';
import { firstOutputImageUrl } from '@/lib/generation-preview';

type GenerationStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';

type GenerationRow = {
  id: string;
  input_image_url: string | null;
  style: string;
  output_images: unknown;
  prompt_used: string | null;
  status: string;
  created_at: string | null;
  completed_at: string | null;
  aspect_ratio: string | null;
  resolution: string | null;
  is_public?: boolean | null;
};

function AppPageInner() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'generate' | 'library'>('generate');
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  // Generation state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('Clean White');
  const [ratio, setRatio] = useState('1:1');
  const [resolution, setResolution] = useState('1K');
  const [generationId, setGenerationId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).generationId ?? null;
    } catch {}
    return null;
  });
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>(() => {
    if (typeof window === 'undefined') return 'idle';
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved && JSON.parse(saved).generationId) return 'processing';
    } catch {}
    return 'idle';
  });
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [processingStartedAt, setProcessingStartedAt] = useState<number | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).startedAt ?? null;
    } catch {}
    return null;
  });
  const [processingStyle, setProcessingStyle] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).style ?? '';
    } catch {}
    return '';
  });
  const [libraryItems, setLibraryItems] = useState<GenerationRow[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryError, setLibraryError] = useState<string | null>(null);
  const [libraryModalId, setLibraryModalId] = useState<string | null>(null);
  const [passwordUpdatedBanner, setPasswordUpdatedBanner] = useState(false);

  const libraryModalItem = useMemo(
    () =>
      libraryModalId ? libraryItems.find((g) => g.id === libraryModalId) ?? null : null,
    [libraryModalId, libraryItems]
  );

  const isGenerating = generationStatus === 'uploading' || generationStatus === 'processing';

  const saveActiveGeneration = useCallback((genId: string, startedAt: number, style: string) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ generationId: genId, startedAt, style }));
    } catch {}
  }, []);

  const clearActiveGeneration = useCallback(() => {
    try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // ---------- Password reset success (dari /update-password) ----------
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('password_updated') !== '1') return;
    setPasswordUpdatedBanner(true);
    params.delete('password_updated');
    const q = params.toString();
    router.replace(`/app${q ? `?${q}` : ''}`, { scroll: false });
  }, [router]);

  // ---------- Mount & click-outside ----------
  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const inDesktop = dropdownRef.current?.contains(target) ?? false;
      const inMobile = mobileDropdownRef.current?.contains(target) ?? false;
      if (!inDesktop && !inMobile) setIsProfileDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ---------- Fetch token balance ----------
  const refreshBalance = useCallback(() => {
    fetch('/api/balance')
      .then(res => res.json())
      .then(data => {
        if (data.success) setTokenBalance(data.balance);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    refreshBalance();
  }, [user, refreshBalance]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'library') setActiveTab('library');
    else setActiveTab('generate');
  }, [searchParams]);

  const refreshLibrary = useCallback(() => {
    setLibraryLoading(true);
    setLibraryError(null);
    fetch('/api/generations')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setLibraryItems(data.data as GenerationRow[]);
        } else {
          setLibraryError(data.error || 'Gagal memuat library');
        }
      })
      .catch(() => setLibraryError('Gagal memuat library'))
      .finally(() => setLibraryLoading(false));
  }, []);

  useEffect(() => {
    if (!user || activeTab !== 'library') return;
    refreshLibrary();
  }, [user, activeTab, refreshLibrary]);

  // ---------- File handling ----------
  const handleFileSelect = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File is too large. Maximum size is 10MB.');
      return;
    }
    setUploadedFile(file);
    setUploadedPreviewUrl(URL.createObjectURL(file));
    setGeneratedImageUrl(null);
    setGenerationStatus('idle');
    setErrorMessage(null);
  };

  const handleFileRemove = () => {
    if (uploadedPreviewUrl) URL.revokeObjectURL(uploadedPreviewUrl);
    setUploadedFile(null);
    setUploadedPreviewUrl(null);
  };

  // ---------- Supabase Realtime + polling fallback ----------
  useEffect(() => {
    if (!generationId) return;

    let cancelled = false;

    const handleRowUpdate = (row: { status: string; output_images?: unknown; error_message?: string | null }) => {
      if (cancelled) return;
      const images = Array.isArray(row.output_images) ? row.output_images : [];

      if (row.status === 'completed' && images.length) {
        const url = firstOutputImageUrl(images);
        if (url) setGeneratedImageUrl(url);
        setGenerationStatus('completed');
        setProcessingStartedAt(null);
        clearActiveGeneration();
        refreshBalance();
        refreshLibrary();
      } else if (row.status === 'failed') {
        setGenerationStatus('failed');
        setProcessingStartedAt(null);
        clearActiveGeneration();
        setErrorMessage(row.error_message || 'AI generation failed. Your tokens have not been deducted.');
      }
    };

    // Realtime subscription
    const channel = supabase
      .channel(`gen-${generationId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'generations',
          filter: `id=eq.${generationId}`,
        },
        (payload) => handleRowUpdate(payload.new as { status: string; output_images?: unknown; error_message?: string | null })
      )
      .subscribe();

    // Initial check — record might already be completed/failed
    supabase
      .from('generations')
      .select('status, output_images, error_message')
      .eq('id', generationId)
      .single()
      .then(({ data }) => {
        if (data && (data.status === 'completed' || data.status === 'failed')) {
          handleRowUpdate(data);
        }
      });

    // Polling fallback every 8s in case Realtime misses an event
    const pollInterval = setInterval(() => {
      supabase
        .from('generations')
        .select('status, output_images, error_message')
        .eq('id', generationId)
        .single()
        .then(({ data }) => {
          if (data && (data.status === 'completed' || data.status === 'failed')) {
            handleRowUpdate(data);
          }
        });
    }, 8000);

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [generationId, supabase, refreshBalance, refreshLibrary, clearActiveGeneration]);

  // ---------- handleGenerate: the core flow ----------
  const handleGenerate = async () => {
    if (!uploadedFile || !user) return;

    if (tokenBalance !== null && tokenBalance < 4) {
      setErrorMessage('Not enough tokens. Please top up first.');
      return;
    }

    setGenerationStatus('uploading');
    setErrorMessage(null);
    setGeneratedImageUrl(null);
    const startTs = Date.now();
    setProcessingStartedAt(startTs);
    setProcessingStyle(selectedStyle || 'Generation');

    try {
      const styleSlug = selectedStyle?.toLowerCase().replace(/\s+/g, '_') || 'clean_white';

      const form = new FormData();
      form.append('file', uploadedFile);
      form.append('style', styleSlug);
      form.append('prompt', customPrompt);
      form.append('aspectRatio', ratio);
      form.append('resolution', resolution);

      setGenerationStatus('processing');

      const res = await fetch('/api/generate', {
        method: 'POST',
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Generation failed');
        setGenerationStatus('failed');
        setProcessingStartedAt(null);
        clearActiveGeneration();
        return;
      }

      setGenerationId(data.generationId);
      saveActiveGeneration(data.generationId, startTs, selectedStyle || 'Generation');

    } catch (err) {
      console.error('handleGenerate error:', err);
      setErrorMessage('An unexpected error occurred. Please try again.');
      setGenerationStatus('failed');
      setProcessingStartedAt(null);
      clearActiveGeneration();
    }
  };

  // ---------- Preview image based on selected style ----------
  const getPreviewImage = () => {
    if (uploadedPreviewUrl) return uploadedPreviewUrl;
    if (selectedStyle === 'Dark Premium') {
      return "https://images.unsplash.com/photo-1546868871-7041f2a55e12?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydHdhdGNoJTIwZGFya3xlbnwwfHx8fDE3NzU0NTQ1Mzh8MA&ixlib=rb-4.1.0&q=80&w=1080";
    }
    if (selectedStyle === 'Outdoor Natural') {
      return "https://images.unsplash.com/photo-1542291026-7eec264c27ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXR1cmUlMjBzaG9lc3xlbnwwfHx8fDE3NzU0NTQ1Mzl8MA&ixlib=rb-4.1.0&q=80&w=1080";
    }
    if (selectedStyle === 'Minimal Aesthetic') {
      return "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxza2luY2FyZSUyMG1pbmltYWx8ZW58MHx8fHwxNzc1NDU0NTQwfDA&ixlib=rb-4.1.0&q=80&w=1080";
    }
    if (selectedStyle === 'Cinematic') {
      return "https://images.unsplash.com/photo-1594035910387-fea47794261f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJmdW1lJTIwY2luZW1hdGljfGVufDB8fHx8MTc3NTQ1NDU0MXww&ixlib=rb-4.1.0&q=80&w=1080";
    }
    return "https://images.unsplash.com/photo-1739949816834-893c498203a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwc2tpbmNhcmUlMjBwcm9kdWN0JTIwcGhvdG9ncmFwaHl8ZW58MXx8fHwxNzc1NDU0NTM3fDA&ixlib=rb-4.1.0&q=80&w=1080";
  };

  return (
    <div className="flex flex-col h-screen bg-white text-neutral-900 font-sans overflow-hidden">
      
      {/* Top Header */}
      <header className="flex-none flex items-center justify-between px-4 md:px-6 py-3.5 border-b border-neutral-200/80 bg-white/80 backdrop-blur-md z-20">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <img src="/RePhot.svg" alt="Rephot" className="h-6 w-auto invert" />
        </Link>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 mr-2">
            <span className={`w-2 h-2 rounded-full ${isGenerating ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></span>
            <span className="text-sm font-medium text-neutral-600">{isGenerating ? 'Processing...' : 'Studio Ready'}</span>
          </div>

          {/* Tokens (Mobile Only) */}
          <div className="md:hidden flex items-center gap-1.5 bg-amber-50 px-2.5 py-1.5 rounded-full border border-amber-200 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-amber-500">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <span suppressHydrationWarning className="text-sm font-bold text-amber-600">{mounted ? (tokenBalance ?? '—') : '—'}</span>
          </div>

          {/* Profile (Mobile Only) */}
          <div className="md:hidden relative z-30 isolate" ref={mobileDropdownRef}>
            <div 
              className="flex items-center cursor-pointer shrink-0"
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            >
              {user?.user_metadata?.avatar_url ? (
                <img 
                  src={user.user_metadata.avatar_url}
                  alt="User Profile" 
                  className="w-8 h-8 rounded-full object-cover border border-neutral-200 shadow-sm"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-neutral-200 border border-neutral-300 flex items-center justify-center text-xs font-bold text-neutral-600">
                  {user ? getDisplayName(user).charAt(0).toUpperCase() : '?'}
                </div>
              )}
            </div>

            {isProfileDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-xl py-1 z-[200] pointer-events-auto">
                <Link
                  href="/profile"
                  className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsProfileDropdownOpen(false);
                    router.push('/profile');
                  }}
                >
                  Profil
                </Link>
                <button type="button" onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-neutral-50 transition-colors">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {errorMessage && (
        <div className="flex-none px-4 md:px-6 py-2.5 bg-red-50 border-b border-red-200 flex items-center justify-between">
          <span className="text-sm text-red-700 font-medium">{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-600 text-xs font-medium">
            Dismiss
          </button>
        </div>
      )}

      {passwordUpdatedBanner && (
        <div className="flex-none px-4 md:px-6 py-2.5 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between">
          <span className="text-sm text-emerald-800 font-medium">
            Password berhasil diperbarui. Kamu sudah masuk dengan password baru.
          </span>
          <button
            type="button"
            onClick={() => setPasswordUpdatedBanner(false)}
            className="text-emerald-600 hover:text-emerald-800 text-xs font-medium"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Main Content Area */}
      {activeTab === 'generate' && (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative z-0">
          
          {/* Left Panel: Control Desk */}
          <div className="flex-1 md:flex-none w-full md:w-[320px] lg:w-[350px] xl:w-[400px] md:h-full overflow-y-auto bg-white border-t md:border-t-0 md:border-r border-neutral-200/80 shadow-[1px_0_10px_rgba(0,0,0,0.02)] z-10 flex flex-col order-2 md:order-1">
            <ControlPanel 
              selectedStyle={selectedStyle}
              onStyleChange={setSelectedStyle}
              ratio={ratio}
              setRatio={setRatio}
              resolution={resolution}
              setResolution={setResolution}
              onGenerate={handleGenerate}
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              prompt={customPrompt}
              onPromptChange={setCustomPrompt}
              uploadedFile={uploadedFile}
              uploadedPreviewUrl={uploadedPreviewUrl}
              isGenerating={isGenerating}
              generationStatus={generationStatus}
            />
          </div>

          {/* Right Panel: Main Stage */}
          <div className="flex-none md:flex-1 h-[45vh] md:h-auto flex flex-col bg-neutral-50/50 min-w-0 min-h-0 order-1 md:order-2">
            <div className="flex-1 p-4 md:p-6 lg:p-8 flex items-center justify-center min-h-0">
              <MainStage 
                previewImage={getPreviewImage()} 
                isGenerating={isGenerating}
                ratio={ratio}
                resolution={resolution}
                generatedImageUrl={generatedImageUrl}
                generationStatus={generationStatus}
                processingStartedAt={processingStartedAt}
              />
            </div>
          </div>
        </div>
      )}

      {/* Library View */}
      {activeTab === 'library' && (
        <div className="flex-1 overflow-y-auto bg-neutral-50/50 p-4 md:p-8 relative z-0">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between gap-4 mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-neutral-900">Your Library</h2>
              <button
                type="button"
                onClick={refreshLibrary}
                disabled={libraryLoading}
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900 disabled:opacity-50"
              >
                {libraryLoading ? 'Memuat…' : 'Refresh'}
              </button>
            </div>
            {libraryError && (
              <p className="text-sm text-red-600 mb-4">{libraryError}</p>
            )}
            {libraryLoading && libraryItems.length === 0 ? (
              <p className="text-sm text-neutral-500">Memuat riwayat…</p>
            ) : libraryItems.length === 0 ? (
              <p className="text-sm text-neutral-500">Belum ada generasi. Hasil akan muncul di sini setelah selesai.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                {libraryItems.map((item) => {
                  const isItemProcessing = item.status === 'processing' || item.status === 'pending';
                  if (isItemProcessing) {
                    const startTime = item.created_at ? new Date(item.created_at).getTime() : Date.now();
                    return (
                      <LibraryProgressCard
                        key={item.id}
                        style={item.style}
                        startedAt={startTime}
                      />
                    );
                  }
                  const thumb = firstOutputImageUrl(item.output_images);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setLibraryModalId(item.id)}
                      className="group flex flex-col aspect-square overflow-hidden rounded-xl border border-neutral-200 bg-white text-left shadow-sm outline-none transition-[border-color,box-shadow] duration-200 hover:border-neutral-300 hover:shadow-md focus-visible:ring-2 focus-visible:ring-neutral-900/15 focus-visible:ring-offset-2"
                      aria-label={`Buka detail: ${item.style}`}
                    >
                      <div className="relative min-h-0 flex-1 bg-neutral-100">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center px-2 text-center text-xs text-neutral-400">
                            {item.status === 'completed' ? 'Tanpa output' : item.status}
                          </div>
                        )}
                      </div>
                      <div className="flex-none border-t border-neutral-100 bg-white px-2 py-1.5">
                        <p className="truncate text-[11px] font-medium text-neutral-700">{item.style}</p>
                        {item.is_public ? (
                          <p className="truncate text-[10px] text-emerald-600">Publik di Community</p>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="flex-none h-auto md:h-[72px] py-4 md:py-0 border-t border-neutral-200/80 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-40 flex flex-col md:flex-row items-center justify-center md:justify-between px-4 md:px-6 relative gap-4 md:gap-0">
        
        {/* Pojok Kiri: Sisa Credit & Tombol Top Up (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-amber-500">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <span suppressHydrationWarning className="text-sm font-bold text-amber-600">{mounted ? (tokenBalance ?? '—') : '—'}</span>
          </div>
          <Link href="/pricing" className="text-sm font-medium bg-[#0A0A0A] text-white px-5 py-1.5 rounded-full hover:bg-neutral-800 transition-colors shadow-sm">
            Top Up
          </Link>
        </div>

        {/* Tengah: pointer-events-none supaya area kosong di luar pill tidak menangkap klik (mis. ke dropdown Profil di atas) */}
        <BottomTabNav mainTab={activeTab} />

        {/* Pojok Kanan: Username & Profile Photo (Desktop) */}
        <div className="hidden md:flex relative z-50 isolate pointer-events-auto" ref={dropdownRef}>
          <div 
            className="flex items-center gap-3 cursor-pointer hover:bg-neutral-50 p-1 rounded-full pl-4 transition-colors border border-transparent hover:border-neutral-200"
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
          >
            <span className="text-sm font-semibold text-neutral-800">
              {user ? getDisplayName(user) : 'Pengguna'}
            </span>
            {user?.user_metadata?.avatar_url ? (
              <img 
                src={user.user_metadata.avatar_url}
                alt="User Profile" 
                className="w-9 h-9 rounded-full object-cover border border-neutral-200 shadow-sm"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-neutral-200 border border-neutral-300 flex items-center justify-center text-sm font-bold text-neutral-600">
                {user ? getDisplayName(user).charAt(0).toUpperCase() : 'P'}
              </div>
            )}
          </div>

          {isProfileDropdownOpen && (
            <div className="absolute bottom-full right-0 mb-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-xl py-1 z-[200] pointer-events-auto">
              <Link
                href="/profile"
                className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  setIsProfileDropdownOpen(false);
                  router.push('/profile');
                }}
              >
                Profil
              </Link>
              <button type="button" onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-neutral-50 transition-colors">
                Logout
              </button>
            </div>
          )}
        </div>

      </div>

      <QueueBusyNotice isGenerating={isGenerating} startedAt={processingStartedAt} />

      {libraryModalItem && (
        <LibraryDetailModal
          item={{
            id: libraryModalItem.id,
            style: libraryModalItem.style,
            prompt_used: libraryModalItem.prompt_used,
            status: libraryModalItem.status,
            created_at: libraryModalItem.created_at,
            completed_at: libraryModalItem.completed_at,
            is_public: libraryModalItem.is_public,
          }}
          imageUrl={firstOutputImageUrl(libraryModalItem.output_images)}
          onClose={() => setLibraryModalId(null)}
          onDownload={async () => {
            const url = firstOutputImageUrl(libraryModalItem.output_images)
            if (!url) return
            try {
              const res = await fetch(url)
              const blob = await res.blob()
              const u = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = u
              a.download = `rephot-${libraryModalItem.id.slice(0, 8)}.png`
              a.click()
              URL.revokeObjectURL(u)
            } catch {
              window.open(url, '_blank')
            }
          }}
          onDelete={async () => {
            const id = libraryModalItem.id
            try {
              const res = await fetch(`/api/generations/${id}`, { method: 'DELETE' })
              const data = await res.json()
              if (res.ok && data.success) {
                setLibraryModalId(null)
                setLibraryItems((prev) => prev.filter((g) => g.id !== id))
              } else {
                setLibraryError(data.error || 'Gagal menghapus. Coba lagi.')
              }
            } catch {
              setLibraryError('Gagal menghapus. Coba lagi.')
            }
          }}
          onShareSuccess={() => {
            const id = libraryModalItem.id
            setLibraryItems((prev) =>
              prev.map((g) => (g.id === id ? { ...g, is_public: true } : g))
            )
            refreshBalance()
          }}
        />
      )}

    </div>
  );
}

export default function AppPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-white text-neutral-500 text-sm">
          Memuat…
        </div>
      }
    >
      <AppPageInner />
    </Suspense>
  );
}
