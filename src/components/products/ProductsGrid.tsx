'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/useCartStore';
import { ShoppingBag } from 'lucide-react';

interface ProductsGridProps {
  loading: boolean;
  filteredProducts: Product[];
  displayedProducts: Product[];
  viewMode: 'grid-4' | 'grid-3' | 'list';
  onResetFilters: () => void;
}

export function ProductsGrid({
  loading,
  filteredProducts,
  displayedProducts,
  viewMode,
  onResetFilters,
}: ProductsGridProps) {
  const { addItem } = useCartStore();

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <EmptyState
        title="No Products Found"
        description="No hardware matches your active filters or search parameters."
        actionText="Reset All Filters"
        onAction={onResetFilters}
      />
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-4 font-sans">
        {displayedProducts.map((product) => (
          <div
            key={product.id}
            className="p-4 bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 hover:border-slate-900 transition-colors"
          >
            <div className="flex items-center space-x-4 w-full sm:w-auto">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-24 h-24 object-cover border border-slate-200 flex-shrink-0 bg-slate-50"
              />
              <div className="space-y-1">
                <span className="text-[10px] text-slate-900 font-bold uppercase">{product.category?.name}</span>
                <Link href={`/products/${product.id}`}>
                  <h3 className="text-sm font-black text-slate-900 hover:text-black uppercase">{product.name}</h3>
                </Link>
                <p className="text-xs text-slate-600 line-clamp-1">{product.description}</p>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto space-y-2">
              <span className="text-lg font-black text-slate-900 font-mono">{formatPrice(product.price)}</span>
              <button
                onClick={() => addItem(product)}
                className="px-4 py-2 bg-slate-900 hover:bg-black text-white border border-slate-800 text-xs font-bold flex items-center space-x-1.5 uppercase cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-white" />
                <span>Add To Bag</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`grid gap-6 ${
        viewMode === 'grid-3'
          ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
          : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5'
      }`}
    >
      {displayedProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
