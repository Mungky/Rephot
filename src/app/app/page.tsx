'use client';

import { Lock } from 'lucide-react';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ControlPanel } from '@/components/ControlPanel';
import { MainStage } from '@/components/MainStage';
import { LibraryProgressCard } from '@/components/LibraryProgressCard';
import { QueueBusyNotice } from '@/components/QueueBusyNotice';
import { useUser } from '@/hooks/useUser';

const STORAGE_KEY = 'rephot_active_generation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getDisplayName } from '@/lib/display-name';

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
};

function firstOutputImageUrl(outputImages: unknown): string | null {
  if (!Array.isArray(outputImages) || outputImages.length === 0) return null;
  const first = outputImages[0];
  if (typeof first === 'string') return first;
  if (first && typeof first === 'object' && 'url' in first) {
    const u = (first as { url?: unknown }).url;
    return typeof u === 'string' ? u : null;
  }
  return null;
}

export default function AppPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'generate' | 'library' | 'community'>('generate');
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
  const [selectedStyles, setSelectedStyles] = useState<string[]>(['Clean White']);
  const [ratio, setRatio] = useState('1:1');
  const [resolution, setResolution] = useState('4K');
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
    setProcessingStyle(selectedStyles[0] || 'Generation');

    try {
      const styleSlug = selectedStyles[0]?.toLowerCase().replace(/\s+/g, '_') || 'clean_white';

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
      saveActiveGeneration(data.generationId, startTs, selectedStyles[0] || 'Generation');

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
    if (selectedStyles.includes('Dark Premium')) {
      return "https://images.unsplash.com/photo-1546868871-7041f2a55e12?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydHdhdGNoJTIwZGFya3xlbnwwfHx8fDE3NzU0NTQ1Mzh8MA&ixlib=rb-4.1.0&q=80&w=1080";
    }
    if (selectedStyles.includes('Outdoor Natural')) {
      return "https://images.unsplash.com/photo-1542291026-7eec264c27ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXR1cmUlMjBzaG9lc3xlbnwwfHx8fDE3NzU0NTQ1Mzl8MA&ixlib=rb-4.1.0&q=80&w=1080";
    }
    if (selectedStyles.includes('Minimal Aesthetic')) {
      return "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxza2luY2FyZSUyMG1pbmltYWx8ZW58MHx8fHwxNzc1NDU0NTQwfDA&ixlib=rb-4.1.0&q=80&w=1080";
    }
    if (selectedStyles.includes('Cinematic')) {
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

      {/* Main Content Area */}
      {activeTab === 'generate' && (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative z-0">
          
          {/* Left Panel: Control Desk */}
          <div className="flex-1 md:flex-none w-full md:w-[320px] lg:w-[350px] xl:w-[400px] md:h-full overflow-y-auto bg-white border-t md:border-t-0 md:border-r border-neutral-200/80 shadow-[1px_0_10px_rgba(0,0,0,0.02)] z-10 flex flex-col order-2 md:order-1">
            <ControlPanel 
              selectedStyles={selectedStyles}
              setSelectedStyles={setSelectedStyles}
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
                    <div
                      key={item.id}
                      className="aspect-square bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden relative group"
                    >
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={item.style}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-neutral-100 text-neutral-400 text-xs text-center px-2">
                          {item.status === 'completed' ? 'No output' : item.status}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
                        <span className="text-white text-xs font-semibold truncate w-full text-center">{item.style}</span>
                        <div className="flex items-center gap-2">
                          {thumb && (
                            <button
                              onClick={async () => {
                                try {
                                  const res = await fetch(thumb);
                                  const blob = await res.blob();
                                  const url = URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = `rephot-${item.id.slice(0, 8)}.png`;
                                  a.click();
                                  URL.revokeObjectURL(url);
                                } catch {
                                  window.open(thumb, '_blank');
                                }
                              }}
                              className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/40 transition-colors"
                              title="Download"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                            </button>
                          )}
                          <button
                            onClick={async () => {
                              if (!confirm('Yakin ingin menghapus gambar ini? Tindakan ini tidak bisa dibatalkan.')) return;
                              try {
                                const res = await fetch(`/api/generations/${item.id}`, { method: 'DELETE' });
                                const data = await res.json();
                                if (res.ok && data.success) {
                                  setLibraryItems((prev) => prev.filter((g) => g.id !== item.id));
                                } else {
                                  setLibraryError(data.error || 'Gagal menghapus. Coba lagi.');
                                }
                              } catch {
                                setLibraryError('Gagal menghapus. Coba lagi.');
                              }
                            }}
                            className="w-9 h-9 rounded-full bg-red-500/60 backdrop-blur-sm text-white flex items-center justify-center hover:bg-red-500/90 transition-colors"
                            title="Delete"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Community View */}
      {activeTab === 'community' && (
        <div className="flex-1 flex flex-col items-center justify-center bg-neutral-50/50 min-w-0 p-8 text-center relative z-0">
          <div className="w-20 h-20 rounded-2xl bg-white border border-neutral-200 shadow-sm flex items-center justify-center mb-6">
            <Lock className="w-8 h-8 text-neutral-300" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Community Coming Soon</h2>
          <p className="text-neutral-500 max-w-sm">We&apos;re building a space for creators to share and discover amazing product photography prompts and styles.</p>
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
        <div className="w-full md:w-auto md:absolute md:left-1/2 md:-translate-x-1/2 flex items-center justify-center shrink-0 pointer-events-none">
          <div className="flex items-center justify-center gap-1 bg-neutral-100 p-1.5 rounded-full border border-neutral-200/60 shadow-inner overflow-x-auto pointer-events-auto max-w-full">
          <button 
            onClick={() => setActiveTab('generate')}
            className={`px-4 sm:px-6 py-1.5 rounded-full font-semibold text-sm transition-all whitespace-nowrap ${activeTab === 'generate' ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-neutral-200/50 text-neutral-900' : 'text-neutral-500 hover:text-neutral-900 hover:bg-black/5 font-medium border border-transparent'}`}
          >
            Generate
          </button>
          <button 
            onClick={() => setActiveTab('library')}
            className={`px-4 sm:px-6 py-1.5 rounded-full font-semibold text-sm transition-all whitespace-nowrap ${activeTab === 'library' ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-neutral-200/50 text-neutral-900' : 'text-neutral-500 hover:text-neutral-900 hover:bg-black/5 font-medium border border-transparent'}`}
          >
            Library
          </button>
          <button 
            onClick={() => setActiveTab('community')}
            className={`px-4 sm:px-6 py-1.5 rounded-full font-semibold text-sm transition-all whitespace-nowrap ${activeTab === 'community' ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-neutral-200/50 text-neutral-900' : 'text-neutral-500 hover:text-neutral-900 hover:bg-black/5 font-medium border border-transparent'}`}
          >
            Community
          </button>
          </div>
        </div>

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

    </div>
  );
}
