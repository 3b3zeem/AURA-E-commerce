'use client';

import React, { useEffect } from 'react';
import { Category } from '@/types';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { trackSearchQuery } from '@/lib/analytics/tracker';
import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  LayoutGrid,
  List,
  Zap,
  Sparkles,
  X
} from 'lucide-react';

interface ProductsTopBarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (id: string) => void;
  categories: Category[];
  totalProductsCount: number;
  products: any[];
  flashDealsOnly: boolean;
  setFlashDealsOnly: (val: boolean) => void;
  recommendedOnly?: boolean;
  setRecommendedOnly?: (val: boolean) => void;
  activeFiltersCount: number;
  setIsFilterDrawerOpen: (val: boolean) => void;
  sortBy: string;
  setSortBy: (val: any) => void;
  viewMode: 'grid-4' | 'grid-3' | 'list';
  setViewMode: (val: 'grid-4' | 'grid-3' | 'list') => void;
  selectedBadge: string;
  setSelectedBadge: (b: string) => void;
  inStockOnly: boolean;
  setInStockOnly: (val: boolean) => void;
  minRating: number;
  setMinRating: (val: number) => void;
  onResetFilters: () => void;
}

export function ProductsTopBar({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories,
  totalProductsCount,
  products,
  flashDealsOnly,
  setFlashDealsOnly,
  recommendedOnly = false,
  setRecommendedOnly,
  activeFiltersCount,
  setIsFilterDrawerOpen,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  selectedBadge,
  setSelectedBadge,
  inStockOnly,
  setInStockOnly,
  minRating,
  setMinRating,
  onResetFilters,
}: ProductsTopBarProps) {
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) return;
    const timer = setTimeout(() => {
      trackSearchQuery(searchQuery.trim());
    }, 800);
    return () => clearTimeout(timer);
  }, [searchQuery]);
  return (
    <div className="p-4 bg-white border border-slate-200 space-y-4 font-sans text-slate-900">
      
      {/* Row 1: Search + Controls */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        
        {/* Search Box */}
        <div className="relative flex-1 max-w-lg">
          <input
            type="text"
            placeholder="Search by name, specs or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 py-2.5 pl-9 pr-8 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-900 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Controls: Recommended + Flash Toggle + Advanced Modal Trigger + Sort */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Recommended Filter Toggle */}
          {setRecommendedOnly && (
            <button
              onClick={() => setRecommendedOnly(!recommendedOnly)}
              className={`px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider border flex items-center space-x-1.5 cursor-pointer transition-colors ${
                recommendedOnly
                  ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-none'
                  : 'bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-900'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${recommendedOnly ? 'fill-slate-950 text-slate-950' : 'text-amber-500'}`} />
              <span>Recommended</span>
            </button>
          )}

          {/* Flash Deals Toggle Button */}
          <button
            onClick={() => setFlashDealsOnly(!flashDealsOnly)}
            className={`px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider border flex items-center space-x-1.5 cursor-pointer transition-colors ${
              flashDealsOnly
                ? 'bg-amber-400 text-slate-900 border-amber-500 shadow-none'
                : 'bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-900'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${flashDealsOnly ? 'fill-slate-900' : 'text-slate-900'}`} />
            <span>Flash Deals</span>
          </button>

          {/* Advanced Filters Drawer Button */}
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider border flex items-center space-x-2 cursor-pointer transition-colors ${
              activeFiltersCount > 0
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-900 text-white border-slate-900 hover:bg-black'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-white" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 bg-white text-slate-900 text-[10px] font-black flex items-center justify-center rounded-full ml-1">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Custom Animated Sort Selector */}
          <CustomSelect
            value={sortBy}
            onChange={(val) => setSortBy(val)}
            options={[
              { value: 'featured', label: 'Sort: Featured' },
              { value: 'price-asc', label: 'Price: Low to High' },
              { value: 'price-desc', label: 'Price: High to Low' },
              { value: 'rating', label: 'Highest Rated' },
              { value: 'newest', label: 'New Arrivals' },
            ]}
          />

          {/* View Grid Switchers */}
          <div className="hidden sm:flex items-center space-x-1 border border-slate-300 p-1 bg-slate-50">
            <button
              onClick={() => setViewMode('grid-4')}
              className={`p-1.5 transition-colors cursor-pointer ${
                viewMode === 'grid-4' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="4-Column Grid"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid-3')}
              className={`p-1.5 transition-colors cursor-pointer ${
                viewMode === 'grid-3' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="3-Column Grid"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Category Pill Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-slate-100">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3.5 py-1.5 text-xs font-bold uppercase border whitespace-nowrap transition-colors cursor-pointer flex items-center space-x-1.5 ${
            selectedCategory === 'all'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-900'
          }`}
        >
          <span>All Categories</span>
          <span className="text-[10px] font-mono opacity-80">({products.length})</span>
        </button>

        {categories.map((cat) => {
          const count = products.filter((p) => p.category_id === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 text-xs font-bold uppercase border whitespace-nowrap transition-colors cursor-pointer flex items-center space-x-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-900'
              }`}
            >
              <span>{cat.name}</span>
              <span className="text-[10px] font-mono opacity-80">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Row 3: Active Filter Badges */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-600 uppercase mr-1">Active:</span>

          {selectedCategory !== 'all' && (
            <span className="px-2.5 py-1 bg-slate-100 border border-slate-300 text-slate-900 text-[11px] font-bold flex items-center space-x-1">
              <span>Cat: {categories.find((c) => c.id === selectedCategory)?.name || selectedCategory}</span>
              <X className="w-3 h-3 text-slate-600 hover:text-black cursor-pointer" onClick={() => setSelectedCategory('all')} />
            </span>
          )}

          {searchQuery && (
            <span className="px-2.5 py-1 bg-slate-100 border border-slate-300 text-slate-900 text-[11px] font-bold flex items-center space-x-1">
              <span>Search: "{searchQuery}"</span>
              <X className="w-3 h-3 text-slate-600 hover:text-black cursor-pointer" onClick={() => setSearchQuery('')} />
            </span>
          )}

          {flashDealsOnly && (
            <span className="px-2.5 py-1 bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-bold flex items-center space-x-1">
              <span>Flash Deals Only</span>
              <X className="w-3 h-3 text-amber-800 hover:text-black cursor-pointer" onClick={() => setFlashDealsOnly(false)} />
            </span>
          )}

          {selectedBadge !== 'all' && (
            <span className="px-2.5 py-1 bg-slate-100 border border-slate-300 text-slate-900 text-[11px] font-bold flex items-center space-x-1">
              <span>Badge: {selectedBadge}</span>
              <X className="w-3 h-3 text-slate-600 hover:text-black cursor-pointer" onClick={() => setSelectedBadge('all')} />
            </span>
          )}

          {inStockOnly && (
            <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-300 text-emerald-900 text-[11px] font-bold flex items-center space-x-1">
              <span>In Stock Only</span>
              <X className="w-3 h-3 text-emerald-800 hover:text-black cursor-pointer" onClick={() => setInStockOnly(false)} />
            </span>
          )}

          {minRating > 0 && (
            <span className="px-2.5 py-1 bg-slate-100 border border-slate-300 text-slate-900 text-[11px] font-bold flex items-center space-x-1">
              <span>Rating: {minRating}+ Stars</span>
              <X className="w-3 h-3 text-slate-600 hover:text-black cursor-pointer" onClick={() => setMinRating(0)} />
            </span>
          )}

          <button
            onClick={onResetFilters}
            className="text-[11px] font-bold text-slate-600 hover:text-slate-900 underline uppercase cursor-pointer ml-2"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
}
