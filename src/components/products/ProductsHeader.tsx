'use client';

import React from 'react';
import { RotateCcw } from 'lucide-react';

interface ProductsHeaderProps {
  totalCount: number;
  activeFiltersCount: number;
  onResetFilters: () => void;
}

export function ProductsHeader({
  totalCount,
  activeFiltersCount,
  onResetFilters,
}: ProductsHeaderProps) {
  return (
    <div className="p-6 bg-white border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans text-slate-900">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight flex items-center space-x-3">
          <span>Flagship Hardware Catalog</span>
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Showing {totalCount} curated products across high-performance categories.
        </p>
      </div>

      {activeFiltersCount > 0 && (
        <button
          onClick={onResetFilters}
          className="px-4 py-2 bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-300 hover:border-slate-900 text-xs font-bold flex items-center space-x-1.5 self-start md:self-auto uppercase cursor-pointer transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-900" />
          <span>Reset {activeFiltersCount} Filter{activeFiltersCount > 1 ? 's' : ''}</span>
        </button>
      )}
    </div>
  );
}
