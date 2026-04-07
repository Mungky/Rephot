'use client';

import { useState } from 'react';
import { UploadCloud, Zap, Sparkles, Moon, Sun, Hexagon, Leaf, Camera, Layers, Maximize, Scissors, Check, X as XIcon } from 'lucide-react';

const STYLES = [
  { name: 'Clean White', desc: 'Universal — standar Tokopedia/Shopee', icon: Sun },
  { name: 'Lifestyle Warm', desc: 'Rumah tangga, makanan, aksesoris', icon: Sparkles },
  { name: 'Dark Premium', desc: 'Elektronik, aksesoris pria, tech', icon: Moon },
  { name: 'Outdoor Natural', desc: 'Fashion, olahraga, produk outdoor', icon: Leaf },
  { name: 'Minimal Aesthetic', desc: 'Skincare, kecantikan, stationery', icon: Hexagon },
  { name: 'Flat Lay', desc: 'Makanan, fashion, stationery', icon: Layers },
  { name: 'Cinematic', desc: 'Produk premium, parfum, jam tangan', icon: Camera },
];

interface ControlPanelProps {
  selectedStyles: string[];
  setSelectedStyles: (styles: string[]) => void;
  ratio: string;
  setRatio: (ratio: string) => void;
  resolution: string;
  setResolution: (res: string) => void;
  onGenerate: () => void;
  onFileSelect?: (file: File) => void;
  onFileRemove?: () => void;
  prompt: string;
  onPromptChange: (value: string) => void;
  uploadedFile: File | null;
  uploadedPreviewUrl: string | null;
  isGenerating: boolean;
  generationStatus: string;
}

export function ControlPanel({ 
  selectedStyles, 
  setSelectedStyles, 
  ratio, 
  setRatio, 
  resolution, 
  setResolution,
  onGenerate,
  onFileSelect,
  onFileRemove,
  prompt,
  onPromptChange,
  uploadedFile,
  uploadedPreviewUrl,
  isGenerating,
  generationStatus,
}: ControlPanelProps) {
  const toggleStyle = (name: string) => {
    setSelectedStyles(
      selectedStyles.includes(name) 
        ? selectedStyles.filter(s => s !== name) 
        : [...selectedStyles, name]
    );
  };
  
  const handleRatioChange = (r: string) => {
    setRatio(r);
    setOpenPopup(null);
  };

  const handleResolutionChange = (r: string) => {
    setResolution(r);
    setOpenPopup(null);
  };

  const [openPopup, setOpenPopup] = useState<'ratio' | 'resolution' | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
    e.target.value = '';
  };

  const canGenerate = !!uploadedFile && !isGenerating;

  const getButtonLabel = () => {
    if (!uploadedFile) return 'Upload image first';
    switch (generationStatus) {
      case 'uploading': return 'Uploading...';
      case 'processing': return 'AI Processing...';
      default: return 'Generate';
    }
  };

  return (
    <div className="flex flex-col h-auto min-h-full px-6 pt-6 pb-0 gap-6">
      
      {/* Upload Zone */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-neutral-800 flex items-center justify-between">
          <span>Source Image</span>
          <span className="text-xs font-normal text-neutral-500">Max 10MB</span>
        </label>

        {uploadedFile && uploadedPreviewUrl ? (
          <div className="relative rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50 h-[104px] group">
            <img 
              src={uploadedPreviewUrl} 
              alt="Uploaded preview" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
            <button
              type="button"
              onClick={onFileRemove}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
            >
              <XIcon className="w-3.5 h-3.5" />
            </button>
            <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[11px] font-medium text-neutral-700 truncate max-w-[80%]">
                {uploadedFile.name}
              </div>
            </div>
          </div>
        ) : (
          <label className="border-2 border-dashed border-neutral-300 rounded-xl bg-neutral-50/50 hover:bg-neutral-50 transition-colors flex flex-col items-center justify-center p-5 cursor-pointer group relative overflow-hidden h-[104px]">
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
            <div className="absolute inset-0 bg-neutral-100/0 group-hover:bg-neutral-100/50 transition-colors" />
            <div className="w-9 h-9 rounded-lg bg-white shadow-sm border border-neutral-100 flex items-center justify-center mb-2 group-hover:-translate-y-0.5 transition-transform duration-300 relative z-10">
              <UploadCloud className="text-[#0A0A0A] w-4 h-4" />
            </div>
            <span className="text-[13px] font-medium text-neutral-800 relative z-10">Drag & drop or click</span>
          </label>
        )}
      </div>

      {/* Prompt */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-neutral-800 flex items-center justify-between">
          <span>Prompt</span>
          <span className="text-xs font-normal text-neutral-400">Opsional</span>
        </label>
        <textarea 
          placeholder="Describe specific details you want to add..." 
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          className="w-full text-sm p-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:border-[#0A0A0A] focus:outline-none transition-colors resize-none h-20"
        />
      </div>

      {/* Style Selector */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-neutral-800">Environment Style</label>
        </div>
        <div className="flex flex-wrap gap-2 pr-1 pb-4">
          {STYLES.map((style) => {
            const Icon = style.icon;
            const isSelected = selectedStyles.includes(style.name);
            return (
              <button 
                key={style.name}
                onClick={() => toggleStyle(style.name)}
                className={`px-3 py-1.5 rounded-full border transition-all duration-200 flex items-center gap-2 ${
                  isSelected 
                    ? 'border-[#0A0A0A] bg-[#0A0A0A] text-white shadow-sm' 
                    : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50/50'
                }`}
                title={style.desc}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-neutral-200' : 'text-neutral-500'}`} />
                <span className="font-medium text-[12px] whitespace-nowrap">{style.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Bottom */}
      <div className="mt-auto sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm pt-4 pb-6 border-t border-neutral-200 flex items-center gap-4 z-30 shadow-[0_-10px_20px_rgba(0,0,0,0.03)] -mx-6 px-6">
        
        {openPopup && (
          <div className="fixed inset-0 z-40" onClick={() => setOpenPopup(null)} />
        )}

        {openPopup === 'ratio' && (
          <div className="absolute bottom-full right-[46px] mb-3 bg-white border border-neutral-200 shadow-lg rounded-xl p-1.5 z-50 flex flex-col min-w-[110px] animate-in fade-in zoom-in-95 duration-150">
            {['1:1', '9:16', '16:9', 'Auto'].map(r => (
              <button 
                key={r} 
                onClick={() => handleRatioChange(r)} 
                className={`text-xs text-left px-3 py-2.5 rounded-lg hover:bg-neutral-100 flex items-center justify-between ${ratio === r ? 'font-bold bg-neutral-50 text-[#0A0A0A]' : 'font-medium text-neutral-600'}`}
              >
                {r}
                {ratio === r && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        )}

        {openPopup === 'resolution' && (
          <div className="absolute bottom-full right-0 mb-3 bg-white border border-neutral-200 shadow-lg rounded-xl p-1.5 z-50 flex flex-col min-w-[100px] animate-in fade-in zoom-in-95 duration-150">
            {['1K', '2K', '4K'].map(r => (
              <button 
                key={r} 
                onClick={() => handleResolutionChange(r)} 
                className={`text-xs text-left px-3 py-2.5 rounded-lg hover:bg-neutral-100 flex items-center justify-between ${resolution === r ? 'font-bold bg-neutral-50 text-[#0A0A0A]' : 'font-medium text-neutral-600'}`}
              >
                {r}
                {resolution === r && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        )}

        <button 
          onClick={() => onGenerate()}
          disabled={!canGenerate}
          className={`flex-1 font-medium py-3 px-4 rounded-full shadow-sm shadow-black/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2 relative z-30 ${
            canGenerate
              ? 'bg-[#0A0A0A] hover:bg-neutral-800 text-white'
              : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
          }`}
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="text-sm">{getButtonLabel()}</span>
            </>
          ) : (
            <>
              <Sparkles className={`w-4 h-4 ${canGenerate ? 'text-neutral-300' : 'text-neutral-400'}`} />
              <span className="text-sm">{getButtonLabel()}</span>
              {canGenerate && (
                <div className="ml-1 bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-current text-white" />
                  <span className="text-[11px] font-bold tracking-wide">4</span>
                </div>
              )}
            </>
          )}
        </button>
        
        <div className="flex items-center gap-1.5 shrink-0 relative z-50">
          <button 
            onClick={() => setOpenPopup(openPopup === 'ratio' ? null : 'ratio')}
            className={`flex flex-col items-center justify-center w-[42px] h-[42px] rounded-full border transition-colors shadow-sm ${openPopup === 'ratio' ? 'border-[#0A0A0A] bg-neutral-50' : 'border-neutral-200 bg-white hover:bg-neutral-50'}`}
          >
            <Scissors className={`w-3.5 h-3.5 mb-0.5 ${openPopup === 'ratio' ? 'text-[#0A0A0A]' : 'text-neutral-500'}`} />
            <span className="text-[9px] font-bold text-neutral-800 leading-none">{ratio}</span>
          </button>
          <button 
            onClick={() => setOpenPopup(openPopup === 'resolution' ? null : 'resolution')}
            className={`flex flex-col items-center justify-center w-[42px] h-[42px] rounded-full border transition-colors shadow-sm ${openPopup === 'resolution' ? 'border-[#0A0A0A] bg-neutral-50' : 'border-neutral-200 bg-white hover:bg-neutral-50'}`}
          >
            <Maximize className={`w-3.5 h-3.5 mb-0.5 ${openPopup === 'resolution' ? 'text-[#0A0A0A]' : 'text-neutral-500'}`} />
            <span className="text-[9px] font-bold text-neutral-800 leading-none">{resolution}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
