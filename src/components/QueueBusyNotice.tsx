'use client';

import { Clock, X } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface QueueBusyNoticeProps {
  isGenerating: boolean;
  startedAt: number | null;
  thresholdMs?: number;
}

function formatElapsed(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

export function QueueBusyNotice({
  isGenerating,
  startedAt,
  thresholdMs = 120_000,
}: QueueBusyNoticeProps) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const reset = useCallback(() => {
    setVisible(false);
    setDismissed(false);
    setElapsed(0);
  }, []);

  useEffect(() => {
    if (!isGenerating || !startedAt) {
      reset();
      return;
    }

    const tick = () => {
      const now = Date.now() - startedAt;
      setElapsed(now);
      if (now >= thresholdMs && !dismissed) {
        setVisible(true);
      }
    };

    tick();
    const id = setInterval(tick, 5000);
    return () => clearInterval(id);
  }, [isGenerating, startedAt, thresholdMs, dismissed, reset]);

  return (
    <AnimatePresence>
      {visible && !dismissed && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 24, stiffness: 260 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-[480px]"
        >
          <div className="bg-[#0A0A0A] text-white rounded-2xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5)] p-5 flex gap-4 items-start border border-neutral-800">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3 mb-1">
                <h4 className="font-semibold text-sm">
                  Queue sedang ramai ({formatElapsed(elapsed)})
                </h4>
                <button
                  onClick={() => setDismissed(true)}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-neutral-400 text-xs leading-relaxed">
                Kamu bisa meninggalkan halaman ini &mdash; proses tetap berjalan di background. Kembali lagi nanti untuk melihat hasilnya.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
