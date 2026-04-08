'use client';

import { Download, MoveDiagonal, ImageIcon, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

interface MainStageProps {
  previewImage: string;
  isGenerating: boolean;
  ratio: string;
  resolution: string;
  generatedImageUrl?: string | null;
  generationStatus?: string;
  processingStartedAt?: number | null;
}

function computeProgress(startedAt: number): number {
  const elapsed = (Date.now() - startedAt) / 1000;
  if (elapsed < 3) return (elapsed / 3) * 15;
  if (elapsed < 15) return 15 + ((elapsed - 3) / 12) * 40;
  if (elapsed < 40) return 55 + ((elapsed - 15) / 25) * 25;
  if (elapsed < 120) return 80 + ((elapsed - 40) / 80) * 12;
  return 92;
}

export function MainStage({
  previewImage,
  isGenerating,
  ratio,
  resolution,
  generatedImageUrl,
  generationStatus = 'idle',
  processingStartedAt,
}: MainStageProps) {
  const [fakeProgress, setFakeProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isProcessing = generationStatus === 'uploading' || generationStatus === 'processing';

  useEffect(() => {
    if (!isProcessing || !processingStartedAt) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (generationStatus === 'completed') setFakeProgress(100);
      else if (generationStatus === 'idle') setFakeProgress(0);
      return;
    }

    // Immediately compute current progress from the persisted timestamp
    setFakeProgress(Math.min(computeProgress(processingStartedAt), 92));

    intervalRef.current = setInterval(() => {
      setFakeProgress(Math.min(computeProgress(processingStartedAt), 92));
    }, 250);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isProcessing, generationStatus, processingStartedAt]);

  const getAspectRatio = () => {
    switch (ratio) {
      case '9:16': return 'aspect-[9/16] h-[95%] max-h-[800px] max-w-full';
      case '16:9': return 'aspect-[16/9] w-full max-w-[800px] max-h-full';
      case '1:1': return 'aspect-square h-full max-h-[800px] max-w-full';
      default: return 'aspect-square h-full max-h-[800px] max-w-full';
    }
  };

  const getStatusLabel = () => {
    switch (generationStatus) {
      case 'uploading': return 'Uploading image...';
      case 'processing': return 'AI Processing...';
      case 'completed': return 'Ready';
      case 'failed': return 'Failed';
      default: return 'Ready';
    }
  };

  const getStatusDot = () => {
    if (isProcessing || isGenerating) return 'bg-amber-500 animate-pulse';
    if (generationStatus === 'failed') return 'bg-red-500';
    return 'bg-green-500';
  };

  const handleDownload = async () => {
    if (!generatedImageUrl) return;
    try {
      const res = await fetch(generatedImageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rephot-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(generatedImageUrl, '_blank');
    }
  };

  const showResult = generationStatus === 'completed' && !!generatedImageUrl;

  return (
    <div className="w-full h-full bg-neutral-100/50 rounded-[24px] border border-neutral-200/80 shadow-sm p-2 flex flex-col relative group items-center justify-center">

      <div className={`relative rounded-[18px] overflow-hidden bg-neutral-200/50 border border-neutral-200/50 shadow-inner flex items-center justify-center transition-all duration-500 ease-in-out ${getAspectRatio()}`}>

        {previewImage ? (
          <img
            src={previewImage}
            alt="Source"
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
              isProcessing ? 'blur-[2px] brightness-75' : ''
            } ${showResult ? 'opacity-0' : 'opacity-100'}`}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 text-neutral-400">
            <ImageIcon className="w-12 h-12" />
            <span className="text-sm font-medium">Upload an image to get started</span>
          </div>
        )}

        {/* Progress bar overlay */}
        <AnimatePresence>
          {isProcessing && previewImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
              className="absolute inset-0 z-20"
            >
              <div
                className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent transition-all duration-300 ease-out"
                style={{ clipPath: `inset(0 ${100 - fakeProgress}% 0 0)` }}
              />
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/20 backdrop-blur-sm z-30">
                <div
                  className="h-full bg-white rounded-r-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                  style={{ width: `${fakeProgress}%` }}
                />
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-30">
                <div className="w-10 h-10 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
                <span className="text-sm font-semibold text-white drop-shadow-md">
                  {getStatusLabel()}
                </span>
                <span className="text-xs text-white/70 font-mono tabular-nums drop-shadow-sm">
                  {Math.round(fakeProgress)}%
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Failed overlay */}
        <AnimatePresence>
          {generationStatus === 'failed' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3"
            >
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <span className="text-sm font-semibold text-white">Generation Failed</span>
              <span className="text-xs text-white/60 max-w-[200px] text-center">
                Something went wrong. Your tokens have not been deducted.
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generated result — slides in from right */}
        <AnimatePresence>
          {showResult && (
            <motion.img
              key={generatedImageUrl}
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              src={generatedImageUrl!}
              alt="Generated Product"
              className="absolute inset-0 w-full h-full object-cover z-10"
            />
          )}
        </AnimatePresence>

        {/* Top-left status badges */}
        <div className="absolute top-4 left-4 z-30 flex gap-2">
          <div className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-black/5 shadow-sm text-neutral-800 text-xs font-semibold tracking-wide flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot()}`} />
            {getStatusLabel()}
          </div>
          <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-medium tracking-wide">
            {resolution}
          </div>
        </div>

        <button className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md border border-black/5 shadow-sm flex items-center justify-center text-neutral-600 hover:text-black hover:bg-white transition-all opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0 duration-200">
          <MoveDiagonal className="w-4 h-4" />
        </button>

        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="absolute bottom-6 right-6 z-30"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownload}
                className="flex items-center gap-2 bg-neutral-900 shadow-[0_8px_16px_-6px_rgba(0,0,0,0.3)] text-white font-medium px-5 py-2.5 rounded-full hover:bg-black transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm font-semibold">Download</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
