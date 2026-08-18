'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Category } from '@/types';
import { formatPrice } from '@/lib/utils';
import { SlidersHorizontal, X, Tag, Star } from 'lucide-react';

interface ProductsFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: string;
  setSelectedCategory: (id: string) => void;
  categories: Category[];
  maxPrice: number;
  setMaxPrice: (val: number) => void;
  productsMaxPrice: number;
  selectedBadge: string;
  setSelectedBadge: (b: string) => void;
  badges: string[];
  minRating: number;
  setMinRating: (val: number) => void;
  flashDealsOnly: boolean;
  setFlashDealsOnly: (val: boolean) => void;
  inStockOnly: boolean;
  setInStockOnly: (val: boolean) => void;
  filteredCount: number;
  onResetFilters: () => void;
}

export function ProductsFilterDrawer({
  isOpen,
  onClose,
  selectedCategory,
  setSelectedCategory,
  categories,
  maxPrice,
  setMaxPrice,
  productsMaxPrice,
  selectedBadge,
  setSelectedBadge,
  badges,
  minRating,
  setMinRating,
  flashDealsOnly,
  setFlashDealsOnly,
  inStockOnly,
  setInStockOnly,
  filteredCount,
  onResetFilters,
}: ProductsFilterDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
          
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
          />

          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="pointer-events-auto w-screen max-w-md bg-white border-l border-slate-300 shadow-2xl flex flex-col justify-between"
            >
              {/* Drawer Header */}
              <div className="px-6 py-5 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <SlidersHorizontal className="w-5 h-5 text-white" />
                  <h2 className="text-sm font-black uppercase tracking-wider text-white">
                    Advanced Filters
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-900">
                
                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-900 block">
                    Category
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`px-3 py-2 text-xs font-bold uppercase border text-left transition-colors cursor-pointer ${
                        selectedCategory === 'all'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-900'
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3 py-2 text-xs font-bold uppercase border text-left truncate transition-colors cursor-pointer ${
                          selectedCategory === cat.id
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-900'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Filter Slider */}
                <div className="space-y-2 border-t border-slate-200 pt-5">
                  <div className="flex items-center justify-between text-xs font-black uppercase text-slate-900">
                    <label>Max Price Limit</label>
                    <span className="font-mono text-slate-900 text-sm">{formatPrice(maxPrice)}</span>
                  </div>
                  <input
                    type="range"
                    min={100}
                    max={productsMaxPrice}
                    step={100}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-slate-900 cursor-pointer"
                  />
                </div>

                {/* Badges Filter */}
                <div className="space-y-2 border-t border-slate-200 pt-5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-900 block flex items-center space-x-1.5">
                    <Tag className="w-3.5 h-3.5 text-slate-900" />
                    <span>Product Badge</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {badges.map((b) => (
                      <button
                        key={b}
                        onClick={() => setSelectedBadge(b)}
                        className={`px-3 py-1.5 text-xs font-bold uppercase border transition-colors cursor-pointer ${
                          selectedBadge === b
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-900'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Minimum Rating Filter */}
                <div className="space-y-2 border-t border-slate-200 pt-5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-900 block flex items-center space-x-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>Minimum Rating</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    {[0, 4, 4.5, 4.8].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setMinRating(rating)}
                        className={`px-3 py-1.5 text-xs font-bold border transition-colors cursor-pointer ${
                          minRating === rating
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-900'
                        }`}
                      >
                        {rating === 0 ? 'Any' : `${rating}+ Stars`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="space-y-3 border-t border-slate-200 pt-5">
                  <label className="flex items-center space-x-2 text-xs font-bold text-slate-900 cursor-pointer uppercase">
                    <input
                      type="checkbox"
                      checked={flashDealsOnly}
                      onChange={(e) => setFlashDealsOnly(e.target.checked)}
                      className="accent-slate-900 w-4 h-4 cursor-pointer"
                    />
                    <span>Flash Deals Only</span>
                  </label>

                  <label className="flex items-center space-x-2 text-xs font-bold text-slate-900 cursor-pointer uppercase">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="accent-slate-900 w-4 h-4 cursor-pointer"
                    />
                    <span>In Stock Only</span>
                  </label>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-4">
                <button
                  onClick={onResetFilters}
                  className="px-4 py-2.5 bg-white text-slate-700 hover:text-slate-900 border border-slate-300 text-xs font-bold uppercase cursor-pointer transition-colors"
                >
                  Reset All
                </button>

                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white border border-slate-800 text-xs font-black uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Apply Filters ({filteredCount})
                </button>
              </div>

            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
