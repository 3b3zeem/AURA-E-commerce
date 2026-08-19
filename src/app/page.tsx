'use client';

import React from 'react';
import Link from 'next/link';
import { useProducts, useStories, useCategories } from '@/hooks/useStoreData';
import { StoryHero } from '@/components/home/StoryHero';
import { BentoGridHero } from '@/components/home/BentoGridHero';
import { FlashDeals } from '@/components/home/FlashDeals';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { RecommendedProductsSection } from '@/components/home/RecommendedProductsSection';
import { ProductCard } from '@/components/product/ProductCard';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const { data: products = [] } = useProducts();
  const { data: stories = [] } = useStories();
  const { data: categories = [] } = useCategories();

  const flashDealProducts = products.filter((p) => p.is_flash_deal);
  const featuredProducts = products.filter((p) => p.is_featured);

  return (
    <div className="space-y-12 bg-[#f8fafc] text-slate-900 pb-16 font-sans">
      {/* 1. Apple-Style Bento Grid Hero */}
      <BentoGridHero />

      {/* 2. App-Style Interactive Story Hero Carousel */}
      <StoryHero stories={stories} />
      
      {/* 3. Flash Deals Section with Live Countdown */}
      <FlashDeals products={flashDealProducts.length > 0 ? flashDealProducts : products.slice(0, 3)} />

      {/* 5. Recommended Products Section (Powered by Supabase AI Engine) */}
      <RecommendedProductsSection />

      {/* 6. Category Grid Showcase */}
      <CategoryGrid categories={categories} />

      {/* 4. Trending Innovations Showcase */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-slate-200 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-slate-100 text-slate-900 text-xs font-bold uppercase tracking-wider mb-2 border border-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-slate-900" />
              <span>Flagship Selections</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
              Trending Innovations
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Top rated technology hardware and luxury accessories.
            </p>
          </div>

          <Link
            href="/products"
            className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center space-x-2 w-fit border border-slate-800 cursor-pointer"
          >
            <span>View Full Catalog</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </Link>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredProducts.length > 0 ? (
            featuredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            products.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
