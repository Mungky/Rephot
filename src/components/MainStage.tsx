'use client';

import { Download, RefreshCw, MoveDiagonal, ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MainStageProps {
  previewImage: string;
  isGenerating: boolean;
  ratio: string;
  resolution: string;
  generatedImageUrl?: string | null;
  generationStatus?: string;
  onRegenerate?: () => void;
}

export function MainStage({ 
  previewImage, 
  isGenerating, 
  ratio, 
  resolution, 
  generatedImageUrl,
  generationStatus = 'idle',
  onRegenerate,
}: MainStageProps) {
  const getAspectRatio = () => {
    switch (ratio) {
      case '9:16': return 'aspect-[9/16] h-[95%] max-h-[800px] max-w-full';
      case '16:9': return 'aspect-[16/9] w-full max-w-[800px] max-h-full';
      case '1:1': return 'aspect-square h-full max-h-[800px] max-w-full';
      default: return 'aspect-square h-full max-h-[800px] max-w-full';
    }
  };

  const displayImage = generatedImageUrl || previewImage;
  const isProcessing = generationStatus === 'uploading' || generationStatus === 'processing';

  const getStatusLabel = () => {
    switch (generationStatus) {
      case 'uploading': return 'Uploading image...';
      case 'processing': return `AI Processing ${resolution}...`;
      case 'completed': return 'Ready';
      case 'failed': return 'Failed';
      default: return isGenerating ? `Generating ${resolution}...` : 'Ready';
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

  return (
    <div className="w-full h-full bg-neutral-100/50 rounded-[24px] border border-neutral-200/80 shadow-sm p-2 flex flex-col relative group items-center justify-center">
      
      <div className={`relative rounded-[18px] overflow-hidden bg-neutral-200/50 border border-neutral-200/50 shadow-inner flex items-center justify-center transition-all duration-500 ease-in-out ${getAspectRatio()}`}>
        
        <AnimatePresence>
          {(isGenerating || isProcessing) && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/70 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-3"
            >
              <div className="w-8 h-8 border-4 border-neutral-200 border-t-black rounded-full animate-spin"></div>
              <span className="text-sm font-semibold text-neutral-800">{getStatusLabel()}</span>
              {generationStatus === 'processing' && (
                <span className="text-xs text-neutral-500">This may take 30-60 seconds</span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {displayImage ? (
          <motion.img 
            key={displayImage}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            src={displayImage} 
            alt="Generated Product" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 text-neutral-400">
            <ImageIcon className="w-12 h-12" />
            <span className="text-sm font-medium">Upload an image to get started</span>
          </div>
        )}

        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <div className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-black/5 shadow-sm text-neutral-800 text-xs font-semibold tracking-wide flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot()}`}></span>
            {getStatusLabel()}
          </div>
          <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-medium tracking-wide">
            {resolution}
          </div>
        </div>

        <button className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md border border-black/5 shadow-sm flex items-center justify-center text-neutral-600 hover:text-black hover:bg-white transition-all opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0 duration-200">
          <MoveDiagonal className="w-4 h-4" />
        </button>
        
        <div className="absolute bottom-6 right-6 flex items-center gap-3">
          {onRegenerate && (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRegenerate}
              disabled={isProcessing}
              className="flex items-center gap-2 bg-white/95 backdrop-blur-md border border-neutral-200/60 shadow-[0_8px_16px_-6px_rgba(0,0,0,0.1)] text-neutral-700 font-medium px-5 py-2.5 rounded-full hover:text-black transition-colors disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm font-semibold">Regenerate</span>
            </motion.button>
          )}
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownload}
            disabled={!generatedImageUrl}
            className="flex items-center gap-2 bg-neutral-900 shadow-[0_8px_16px_-6px_rgba(0,0,0,0.3)] text-white font-medium px-5 py-2.5 rounded-full hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-semibold">Download</span>
          </motion.button>
        </div>

      </div>
    </div>
  );
}
