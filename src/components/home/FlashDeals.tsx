'use client';

import React, { useState, useEffect } from 'react';
import { Zap, Clock, PackageSearch } from 'lucide-react';
import { Product } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';
import { EmptyState } from '@/components/ui/EmptyState';

interface FlashDealsProps {
  products: Product[];
}

export function FlashDeals({ products }: FlashDealsProps) {
  const flashProducts = products.filter((p) => p.is_flash_deal);

  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section id="flash-deals" className="py-8 px-4 sm:px-6 lg:px-8 w-full font-sans text-slate-900">
      <div className="p-6 sm:p-8 bg-white border border-slate-200">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-slate-200 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-amber-100 text-amber-800 flex items-center justify-center font-bold border border-amber-300">
              <Zap className="w-5 h-5 text-amber-600 fill-current" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                Limited Time Offers
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                Flash Deals & Daily Drops
              </h2>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Countdown Timer */}
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-300 px-4 py-2">
              <Clock className="w-4 h-4 text-slate-900" />
              <span className="text-xs font-bold text-slate-700 uppercase mr-1">Ends in:</span>
              <div className="flex items-center space-x-1 font-mono text-xs font-bold text-white">
                <span className="px-2 py-0.5 bg-slate-900 text-white border border-slate-800">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-slate-900">:</span>
                <span className="px-2 py-0.5 bg-slate-900 text-white border border-slate-800">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-slate-900">:</span>
                <span className="px-2 py-0.5 bg-slate-900 text-white border border-slate-800">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* View All Flash Deals Button */}
            <a
              href="/products?flash=true"
              className="px-4 py-2 bg-slate-900 hover:bg-black text-white border border-slate-800 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              View All Deals ({flashProducts.length})
            </a>
          </div>
        </div>

        {/* Product Cards Grid or Empty State */}
        {flashProducts.length === 0 ? (
          <EmptyState
            icon={Zap}
            title="No Active Flash Deals Right Now"
            description="Check back soon for upcoming limited-time price drops."
            actionText="View Main Catalog"
            actionHref="/products"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {flashProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
