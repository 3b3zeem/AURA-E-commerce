'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, CheckCircle2, ArrowUp } from 'lucide-react';

interface ProductsLoadMoreProps {
  displayedCount: number;
  totalCount: number;
  progressPercent: number;
  hasMore: boolean;
  isBatchLoading: boolean;
  onLoadMore: () => void;
  onScrollToTop: () => void;
}

export function ProductsLoadMore({
  displayedCount,
  totalCount,
  progressPercent,
  hasMore,
  isBatchLoading,
  onLoadMore,
  onScrollToTop,
}: ProductsLoadMoreProps) {
  if (totalCount === 0) return null;

  return (
    <div className="p-8 bg-white border border-slate-200 text-center space-y-5 font-sans text-slate-900">
      
      {/* Progress Bar Header */}
      <div className="max-w-md mx-auto space-y-2">
        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-700">
          <span>Viewing {displayedCount} of {totalCount} items</span>
          <span className="font-mono text-slate-900 font-black">{progressPercent}%</span>
        </div>
        
        {/* Brutalist Progress Bar Container */}
        <div className="w-full h-3 bg-slate-100 border border-slate-300 overflow-hidden">
          <motion.div
            className="h-full bg-slate-900"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        {hasMore ? (
          <button
            onClick={onLoadMore}
            disabled={isBatchLoading}
            className="px-8 py-3 bg-slate-900 hover:bg-black text-white border border-slate-800 text-xs font-black uppercase tracking-wider transition-colors flex items-center space-x-2 cursor-pointer shadow-none"
          >
            {isBatchLoading ? (
              <span>Loading More Products...</span>
            ) : (
              <>
                <Plus className="w-4 h-4 text-white" />
                <span>Load More Products ({totalCount - displayedCount} remaining)</span>
              </>
            )}
          </button>
        ) : (
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-900 text-xs font-black uppercase tracking-wider border border-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>You've reached the end of the catalog</span>
          </div>
        )}

        <button
          onClick={onScrollToTop}
          className="px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold uppercase tracking-wider transition-colors flex items-center space-x-1.5 cursor-pointer"
        >
          <ArrowUp className="w-4 h-4 text-slate-900" />
          <span>Back To Top</span>
        </button>
      </div>
    </div>
  );
}
