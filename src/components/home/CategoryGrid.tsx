'use client';

import React from 'react';
import Link from 'next/link';
import { Category } from '@/types';
import { EmptyState } from '@/components/ui/EmptyState';
import { FolderX } from 'lucide-react';

interface CategoryGridProps {
  categories: Category[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
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

      {categories.length === 0 ? (
        <EmptyState
          icon={FolderX}
          title="No Categories Available"
          description="Categories will appear here once added to the database."
          actionText="Browse All Products"
          actionHref="/products"
        />
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
