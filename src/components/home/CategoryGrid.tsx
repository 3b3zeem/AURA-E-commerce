'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Category } from '@/types';

interface CategoryGridProps {
  categories: Category[];
  isLoading?: boolean;
}

export function CategoryGrid({ categories, isLoading }: CategoryGridProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const showSkeleton = !isMounted || isLoading || categories.length === 0;

  return (
    <section className="py-6 px-4 sm:px-6 lg:px-8 w-full font-sans text-slate-900">
      <div className="mb-4">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
          Shop by Category
        </h2>
        <p className="text-xs text-slate-600">
          Explore flagship tech hardware, audio gear & smart accessories
        </p>
      </div>

      {showSkeleton ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[320px]">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 p-5 flex flex-col justify-between animate-pulse min-h-[300px]"
            >
              <div className="space-y-3">
                <div className="h-5 w-32 bg-slate-200" />
                <div className="w-full h-48 bg-slate-100 border border-slate-200" />
              </div>
              <div className="h-4 w-24 bg-slate-200 mt-2" />
            </div>
          ))}
        </div>
      ) : (
        /* Amazon-style 4-column Category Card Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white border border-slate-200 p-5 flex flex-col justify-between hover:border-slate-900 transition-colors"
            >
              <div>
                <h3 className="text-base font-black text-slate-900 mb-3 line-clamp-1 uppercase">
                  {category.name}
                </h3>
                
                {/* Category Featured Image Frame */}
                <Link href={`/products?category=${category.id}`} className="block group overflow-hidden bg-slate-50 mb-3 border border-slate-200">
                  <img
                    src={category.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=75'}
                    alt={category.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>
                
                <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                  {category.description || 'Discover flagship accessories & pro gear.'}
                </p>
              </div>

              <Link
                href={`/products?category=${category.id}`}
                className="text-xs font-black text-slate-900 hover:text-black underline inline-block mt-2 uppercase"
              >
                See all {category.name} →
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
