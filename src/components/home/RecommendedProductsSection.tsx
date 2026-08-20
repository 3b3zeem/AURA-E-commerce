'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/types';
import { useUserStore } from '@/store/useUserStore';
import { useCartStore } from '@/store/useCartStore';
import { useRecommendationsQuery, useProducts } from '@/hooks/useStoreData';
import { ExpressBuyModal } from '@/components/checkout/ExpressBuyModal';
import { formatPrice } from '@/lib/utils';
import {
  ArrowRight,
  ShoppingBag,
  Star,
  Eye,
  Zap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface RecommendedCardProps {
  product: Product;
}

function RecommendedProductCard({ product }: RecommendedCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [isExpressModalOpen, setIsExpressModalOpen] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const images =
    product.images && product.images.length > 0
      ? product.images
      : ['/placeholder.jpg'];
  const hasMultipleImages = images.length > 1;

  // Carousel Autoplay
  useEffect(() => {
    if (!hasMultipleImages) return;

    const interval = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [hasMultipleImages, images.length]);

  const handlePrevImg = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImg = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <div className="bg-slate-950 border border-slate-800 p-4 flex flex-col justify-between space-y-4 group hover:border-amber-400/50 transition-all duration-300 relative font-sans">
        {/* Product Image & Multi-image Carousel */}
        <div className="relative aspect-square w-full bg-slate-900 overflow-hidden flex items-center justify-center border border-slate-800/80">
          <Link href={`/products/${product.id}`} className="block w-full h-full">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImgIndex}
                src={images[currentImgIndex] || '/placeholder.jpg'}
                alt={product.name}
                loading="lazy"
                decoding="async"
                initial={{ opacity: 0.4, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0.4 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
              />
            </AnimatePresence>
          </Link>

          {/* Multi-image Controls */}
          {hasMultipleImages && (
            <>
              <button
                onClick={handlePrevImg}
                className="absolute left-1 top-1/2 -translate-y-1/2 z-20 p-1 bg-slate-900/80 hover:bg-slate-900 text-white opacity-0 group-hover:opacity-100 transition-opacity border border-slate-700 cursor-pointer shadow-md"
                title="Previous image"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleNextImg}
                className="absolute right-1 top-1/2 -translate-y-1/2 z-20 p-1 bg-slate-900/80 hover:bg-slate-900 text-white opacity-0 group-hover:opacity-100 transition-opacity border border-slate-700 cursor-pointer shadow-md"
                title="Next image"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {/* Discount Badge */}
          {product.original_price && product.original_price > product.price && (
            <span className="absolute top-2 left-2 bg-amber-400 text-slate-950 font-mono font-black text-[10px] px-2 py-0.5 uppercase tracking-wider z-10">
              SAVE {formatPrice(product.original_price - product.price)}
            </span>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-1.5 flex-1">
          {(() => {
            const revCount = product.reviews_count || 0;
            const ratingAvg = revCount > 0 ? (product.rating_avg || 0) : 0;
            return (
              <div className="flex items-center space-x-1 text-amber-400 text-[10px]">
                <Star className="w-3 h-3 fill-amber-400" />
                <span className="font-mono font-bold">{ratingAvg}</span>
                <span className="text-slate-400 font-medium">({revCount})</span>
              </div>
            );
          })()}

          <h3 className="text-xs sm:text-sm font-bold uppercase text-white truncate group-hover:text-amber-400 transition-colors">
            <Link href={`/products/${product.id}`}>{product.name}</Link>
          </h3>

          <div className="flex items-baseline space-x-2 font-mono">
            <span className="text-sm font-black text-amber-400">
              {formatPrice(product.price)}
            </span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-xs text-slate-400 line-through">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons: Add to Cart, View Specs, Place Order */}
        <div className="space-y-2 pt-3 border-t border-slate-800">
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => addItem(product)}
              className="flex-1 py-1.5 bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-white font-mono text-[10px] font-bold uppercase tracking-wider flex items-center justify-center space-x-1 border border-slate-700 transition-colors cursor-pointer"
              title="Add to Cart"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add Cart</span>
            </button>

            <button
              onClick={() => setIsExpressModalOpen(true)}
              className="flex-1 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-mono text-[10px] font-black uppercase tracking-wider flex items-center justify-center space-x-1 transition-colors cursor-pointer shadow-sm"
              title="Place Fast Order"
            >
              <span>Place Order</span>
            </button>
          </div>

          <Link
            href={`/products/${product.id}`}
            className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-[10px] font-mono font-bold uppercase flex items-center justify-center space-x-1 transition-colors block text-center"
            title="View Specs & Details"
          >
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>View Specs</span>
          </Link>
        </div>
      </div>

      {/* Fast Express Modal */}
      <ExpressBuyModal
        product={product}
        quantity={1}
        isOpen={isExpressModalOpen}
        onClose={() => setIsExpressModalOpen(false)}
      />
    </>
  );
}

export function RecommendedProductsSection() {
  const [showAll, setShowAll] = useState(false);
  const profile = useUserStore((state) => state.profile);
  const { data: allProducts = [] } = useProducts();
  const { data: recommendations = [], isLoading: loading } = useRecommendationsQuery(
    profile?.id || ''
  );

  const products = recommendations.length > 0 ? recommendations : allProducts.slice(0, 5);

  if (loading && allProducts.length === 0) {
    return (
      <div className="w-full py-14 px-4 sm:px-6 lg:px-8 bg-slate-900 border-t border-b border-slate-800 font-sans min-h-[400px]">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-6 w-48 bg-slate-800 animate-pulse rounded" />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className="h-72 bg-slate-950 animate-pulse border border-slate-800"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

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
                {showAll
                  ? 'Collapse'
                  : `View All Recommended (${products.length})`}
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
          {visibleProducts.map((product: Product) => (
            <RecommendedProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
