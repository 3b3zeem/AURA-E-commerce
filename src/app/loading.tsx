'use client';

import React from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-[70vh] w-full bg-white text-black font-sans flex flex-col items-center justify-center space-y-6 px-4">
      <div className="w-14 h-14 bg-black text-white flex items-center justify-center border border-black animate-bounce">
        <Sparkles className="w-7 h-7 fill-current text-white" />
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-black">
          AURA
        </h2>
        <div className="flex items-center justify-center space-x-2 text-xs font-mono font-bold text-black uppercase">
          <RefreshCw className="w-4 h-4 animate-spin text-black" />
          <span>Synchronizing Store Ecosystem...</span>
        </div>
      </div>

      {/* Progress Bar Indicator */}
      <div className="w-48 h-1.5 bg-neutral-200 border border-black overflow-hidden relative">
        <div className="h-full bg-black animate-pulse w-full" />
      </div>
    </div>
  );
}
