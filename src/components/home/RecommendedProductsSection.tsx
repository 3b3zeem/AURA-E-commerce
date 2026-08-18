'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { useUserStore } from '@/store/useUserStore';
import { useCartStore } from '@/store/useCartStore';
import { Sparkles, ShoppingBag, ArrowRight, Star } from 'lucide-react';

export function RecommendedProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);
  const profile = useUserStore((state) => state.profile);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const userId = profile?.id || 'guest-session';
        const res = await fetch(`/api/recommendations?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data || []);
        }
      } catch (err) {
        console.error('Failed to load recommendations:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [profile?.id]);

  if (loading) {
    return (
      <div className="w-full py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-b border-slate-200 font-sans">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-6 w-48 bg-slate-200 animate-pulse rounded" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-72 bg-slate-200 animate-pulse border border-slate-300" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) return null;

  const visibleProducts = showAll ? products : products.slice(0, 5);

  return (
    <section className="w-full py-14 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white font-sans border-t border-b border-slate-800 relative overflow-hidden">
      {/* Background Decorative Accent */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="space-y-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-800 pb-5 gap-4">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
              Recommended For You ({products.length})
            </h2>
            <p className="text-xs text-slate-400 max-w-lg">
              Tailored product picks based on your interaction history and previous cart activity in Supabase.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {products.length > 5 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-white text-xs font-mono font-bold uppercase tracking-wider border border-slate-700 transition-colors cursor-pointer"
              >
                {showAll ? 'Collapse' : `View All Recommended (${products.length})`}
              </button>
            )}

            <Link
              href="/products?recommended=true"
              className="inline-flex items-center space-x-2 text-xs font-mono font-bold text-amber-400 hover:text-amber-300 uppercase tracking-wider transition-colors cursor-pointer group"
            >
              <span>Explore In Catalog</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6">
          {visibleProducts.map((product) => {
            const imageUrl = product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e';
            return (
              <div
                key={product.id}
                className="bg-slate-950 border border-slate-800 p-4 flex flex-col justify-between space-y-4 group hover:border-amber-400/50 transition-all duration-300 relative"
              >
                {/* Image & Badge */}
                <div className="relative aspect-square w-full bg-slate-900 overflow-hidden flex items-center justify-center">
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  />
                  {product.original_price && product.original_price > product.price && (
                    <span className="absolute top-2 left-2 bg-amber-400 text-slate-950 font-mono font-black text-[10px] px-2 py-0.5 uppercase tracking-wider">
                      SAVE ${product.original_price - product.price}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-1 text-amber-400 text-[10px]">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span className="font-mono font-bold">{product.rating_avg || 4.8}</span>
                    <span className="text-slate-500">({product.reviews_count || 12})</span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold uppercase text-white truncate group-hover:text-amber-400 transition-colors">
                    <Link href={`/products/${product.id}`}>{product.name}</Link>
                  </h3>

                  <div className="flex items-baseline space-x-2 font-mono">
                    <span className="text-sm font-black text-amber-400">${product.price}</span>
                    {product.original_price && product.original_price > product.price && (
                      <span className="text-xs text-slate-500 line-through">${product.original_price}</span>
                    )}
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="pt-2 border-t border-slate-800 flex items-center space-x-2">
                  <button
                    onClick={() => addItem(product)}
                    className="flex-1 py-2 bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-white font-mono text-[11px] font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </button>

                  <Link
                    href={`/products/${product.id}`}
                    className="px-2.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-mono font-bold uppercase flex items-center justify-center transition-colors"
                    title="View Details"
                  >
                    Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
