'use client';

import { Lock } from 'lucide-react';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ControlPanel } from '@/components/ControlPanel';
import { MainStage } from '@/components/MainStage';
import { useUser } from '@/hooks/useUser';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

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
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>('idle');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [libraryItems, setLibraryItems] = useState<GenerationRow[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryError, setLibraryError] = useState<string | null>(null);

  const isGenerating = generationStatus === 'uploading' || generationStatus === 'processing';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // ---------- Mount & click-outside ----------
  useEffect(() => {
    setMounted(true);
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

  // ---------- Supabase Realtime: watch generation status ----------
  useEffect(() => {
    if (!generationId) return;

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
        (payload) => {
          const row = payload.new as {
            status: string;
            output_images?: unknown[] | null;
            error_message?: string | null;
          };

          if (row.status === 'completed' && row.output_images?.length) {
            const first = row.output_images[0];
            const url = typeof first === 'string'
              ? first
              : (first as { url?: string })?.url ?? null;
            if (url) setGeneratedImageUrl(url);
            setGenerationStatus('completed');
            refreshBalance();
            refreshLibrary();
          } else if (row.status === 'failed') {
            setGenerationStatus('failed');
            setErrorMessage(row.error_message || 'AI generation failed. Your tokens have not been deducted.');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [generationId, supabase, refreshBalance, refreshLibrary]);

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
        return;
      }

      setGenerationId(data.generationId);

    } catch (err) {
      console.error('handleGenerate error:', err);
      setErrorMessage('An unexpected error occurred. Please try again.');
      setGenerationStatus('failed');
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
          <div className="md:hidden relative" ref={mobileDropdownRef}>
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
                  {user?.email?.[0]?.toUpperCase() || '?'}
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
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          
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
                onRegenerate={uploadedFile ? handleGenerate : undefined}
              />
            </div>
          </div>
        </div>
      )}

      {/* Library View */}
      {activeTab === 'library' && (
        <div className="flex-1 overflow-y-auto bg-neutral-50/50 p-4 md:p-8">
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
              <p className="text-sm text-neutral-500">Belum ada generasi. Hasil Wavespeed (CloudFront) akan muncul di sini setelah selesai.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                {libraryItems.map((item) => {
                  const thumb = firstOutputImageUrl(item.output_images);
                  const meta = [item.resolution, item.aspect_ratio].filter(Boolean).join(' · ');
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
                          {item.status === 'completed' ? 'Tanpa URL output' : item.status}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 pointer-events-none">
                        <span className="text-white text-xs font-medium truncate">{item.style}</span>
                        {meta ? (
                          <span className="text-white/80 text-[10px] truncate">{meta}</span>
                        ) : null}
                        <span className="text-white/60 text-[9px] font-mono truncate mt-1" title={item.id}>
                          {item.id}
                        </span>
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
        <div className="flex-1 flex flex-col items-center justify-center bg-neutral-50/50 min-w-0 p-8 text-center">
          <div className="w-20 h-20 rounded-2xl bg-white border border-neutral-200 shadow-sm flex items-center justify-center mb-6">
            <Lock className="w-8 h-8 text-neutral-300" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Community Coming Soon</h2>
          <p className="text-neutral-500 max-w-sm">We&apos;re building a space for creators to share and discover amazing product photography prompts and styles.</p>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="flex-none h-auto md:h-[72px] py-4 md:py-0 border-t border-neutral-200/80 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-20 flex flex-col md:flex-row items-center justify-center md:justify-between px-4 md:px-6 relative gap-4 md:gap-0">
        
        {/* Pojok Kiri: Sisa Credit & Tombol Top Up (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-amber-500">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <span suppressHydrationWarning className="text-sm font-bold text-amber-600">{mounted ? (tokenBalance ?? '—') : '—'}</span>
          </div>
          <button className="text-sm font-medium bg-[#0A0A0A] text-white px-5 py-1.5 rounded-full hover:bg-neutral-800 transition-colors shadow-sm">
            Top Up
          </button>
        </div>

        {/* Tengah: 3 Pilihan Menu */}
        <div className="w-full md:w-auto md:absolute md:left-1/2 md:-translate-x-1/2 flex items-center justify-center gap-1 bg-neutral-100 p-1.5 rounded-full border border-neutral-200/60 shadow-inner overflow-x-auto shrink-0">
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

        {/* Pojok Kanan: Username & Profile Photo (Desktop) */}
        <div className="hidden md:flex relative" ref={dropdownRef}>
          <div 
            className="flex items-center gap-3 cursor-pointer hover:bg-neutral-50 p-1 rounded-full pl-4 transition-colors border border-transparent hover:border-neutral-200"
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
          >
            <span className="text-sm font-semibold text-neutral-800">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Alex Studio'}
            </span>
            {user?.user_metadata?.avatar_url ? (
              <img 
                src={user.user_metadata.avatar_url}
                alt="User Profile" 
                className="w-9 h-9 rounded-full object-cover border border-neutral-200 shadow-sm"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-neutral-200 border border-neutral-300 flex items-center justify-center text-sm font-bold text-neutral-600">
                {user?.email?.[0]?.toUpperCase() || 'A'}
              </div>
            )}
          </div>

          {isProfileDropdownOpen && (
            <div className="absolute bottom-full right-0 mb-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg py-1 z-50">
              <button className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors">
                Change Profile Photo
              </button>
              <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-neutral-50 transition-colors">
                Logout
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
