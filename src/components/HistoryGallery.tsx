'use client';

import { History, LayoutGrid, Download } from 'lucide-react';
import { motion } from 'motion/react';

const HISTORY_IMAGES = [
  "https://images.unsplash.com/photo-1708486235073-14879ff14c4c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwcGVyZnVtZSUyMGJvdHRsZSUyMHBob3RvZ3JhcGh5fGVufDF8fHx8MTc3NTQ1NDU0MHww&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1662230177619-e190429b87fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW5nbGFzc2VzJTIwbWluaW1hbCUyMHByb2R1Y3QlMjBwaG90b3xlbnwxfHx8fDE3NzU0NTQ1NDB8MA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1632233163919-799de51faf01?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwY29mZmVlJTIwY3VwJTIwcHJvZHVjdHxlbnwxfHx8fDE3NzU0NTQ1NDB8MA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1641563786213-185d68345426?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFkcGhvbmVzJTIwcHJvZHVjdCUyMHBob3RvZ3JhcGh5JTIwbWluaW1hbHxlbnwxfHx8fDE3NzU0NTQ1NDB8MA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1739949816834-893c498203a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwc2tpbmNhcmUlMjBwcm9kdWN0JTIwcGhvdG9ncmFwaHl8ZW58MXx8fHwxNzc1NDU0NTM3fDA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1708486235073-14879ff14c4c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwcGVyZnVtZSUyMGJvdHRsZSUyMHBob3RvZ3JhcGh5fGVufDF8fHx8MTc3NTQ1NDU0MHww&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1662230177619-e190429b87fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW5nbGFzc2VzJTIwbWluaW1hbCUyMHByb2R1Y3QlMjBwaG90b3xlbnwxfHx8fDE3NzU0NTQ1NDB8MA&ixlib=rb-4.1.0&q=80&w=1080"
];

export function HistoryGallery() {
  return (
    <div className="h-full flex flex-col p-4 px-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold flex items-center gap-2 text-neutral-800">
          <History className="w-4 h-4 text-neutral-500" />
          Recent Generations
        </h3>
        <button className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors">
          <LayoutGrid className="w-3.5 h-3.5" />
          View All
        </button>
      </div>
      
      <div className="flex-1 flex gap-4 overflow-x-auto pb-2 items-center" style={{ scrollbarWidth: 'thin' }}>
        {HISTORY_IMAGES.map((img, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={i} 
            className="flex-none w-[100px] h-[100px] rounded-xl overflow-hidden border border-neutral-200/80 shadow-sm relative group cursor-pointer bg-neutral-100"
          >
            <img src={img} alt={`History ${i}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <button className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/40 transition-colors">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
        
        <div className="flex-none w-[100px] h-[100px] rounded-xl border border-dashed border-neutral-300 flex items-center justify-center text-neutral-400">
          <span className="text-xs font-medium">More</span>
        </div>
      </div>
    </div>
  )
}
