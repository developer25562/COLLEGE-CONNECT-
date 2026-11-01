import React, { useState } from 'react';
import { AlertCircle, Bell, ChevronRight, X } from 'lucide-react';
import { Notice } from '../types';

interface NoticeTickerProps {
  notices: Notice[];
}

export const NoticeTicker: React.FC<NoticeTickerProps> = ({ notices }) => {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const activeNotices = notices.filter(
    (n) => n.active && !dismissed.includes(n.id)
  );

  if (activeNotices.length === 0) return null;

  const current = activeNotices[currentIndex % activeNotices.length];

  return (
    <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white text-xs py-2 px-4 border-b border-indigo-800/40 relative z-30 shadow-inner">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider shrink-0 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            {current.priority === 'urgent' ? (
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Bell className="w-3.5 h-3.5 text-indigo-300" />
            )}
            <span>Notice</span>
          </div>

          <div className="truncate">
            <span className="font-semibold text-white mr-2">{current.title}:</span>
            <span className="text-slate-300">{current.content}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {activeNotices.length > 1 && (
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % activeNotices.length)}
              className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[11px] font-medium flex items-center gap-1 transition"
            >
              Next ({((currentIndex % activeNotices.length) + 1)}/{activeNotices.length})
              <ChevronRight className="w-3 h-3" />
            </button>
          )}

          <button
            onClick={() => setDismissed((prev) => [...prev, current.id])}
            aria-label="Dismiss notice"
            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
