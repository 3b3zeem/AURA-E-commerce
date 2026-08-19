import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Heart,
  ShoppingBag,
  Eye,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";
import { Product } from "@/types";
import { formatPrice, calculateDiscountPercentage } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";
import { useUserStore } from "@/store/useUserStore";
import { ExpressBuyModal } from "@/components/checkout/ExpressBuyModal";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { profile, toggleWishlist, isInWishlist } = useUserStore();
  const [isExpressModalOpen, setIsExpressModalOpen] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const images =
    product.images && product.images.length > 0
      ? product.images
      : ["/placeholder.jpg"];
  const hasMultipleImages = images.length > 1;

  // Autoplay Slideshow Carousel Effect
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

  const isLiked = isInWishlist(product.id);
  const discount = product.original_price
    ? calculateDiscountPercentage(product.original_price, product.price)
    : 0;

  return (
    <>
      <div className="group relative bg-white border border-slate-200 overflow-hidden flex flex-col justify-between hover:border-slate-900 transition-colors">
        {/* Product Image Container */}
        <div className="relative aspect-square bg-slate-50 border-b border-slate-200 overflow-hidden group">
          <Link
            href={`/products/${product.id}`}
            className="block w-full h-full"
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImgIndex}
                src={images[currentImgIndex] || "/placeholder.jpg"}
                alt={product.name}
                loading="lazy"
                decoding="async"
                initial={{ opacity: 0.4, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0.4 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
          </Link>

          {/* Multi-image Navigation Controls */}
          {hasMultipleImages && (
            <>
              {/* Prev / Next Arrow Buttons */}
              <button
                onClick={handlePrevImg}
                className="absolute left-1.5 top-1/2 -translate-y-1/2 z-20 p-1.5 bg-transparent text-slate-900 border border-slate-700 cursor-pointer shadow-md"
                title="Previous image"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleNextImg}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 p-1.5 bg-transparent text-slate-900 border border-slate-700 cursor-pointer shadow-md"
                title="Next image"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {/* Top Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 pointer-events-none">
            {product.badge && (
              <span className="px-2 py-0.5 bg-slate-900 text-white font-bold text-[10px] uppercase tracking-wider border border-slate-800">
                {product.badge}
              </span>
            )}
            {product.is_flash_deal && (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold text-[10px] uppercase tracking-wider border border-amber-300">
                Flash Deal
              </span>
            )}
            {discount > 0 && (
              <span className="px-2 py-0.5 bg-rose-100 text-rose-700 font-bold text-[10px] border border-rose-300">
                -{discount}% OFF
              </span>
            )}
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
          <div>
            <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wider block">
              {product.category?.name || "Flagship"}
            </span>

            <Link href={`/products/${product.id}`}>
              <h3 className="text-xs font-bold text-slate-900 tracking-tight line-clamp-1 mt-0.5 hover:text-black">
                {product.name}
              </h3>
            </Link>

            <div className="flex items-center space-x-1 mt-1">
              <div className="flex items-center text-amber-500">
                <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
              </div>
              <span className="text-xs font-bold text-slate-800">
                {product.rating_avg}
              </span>
              <span className="text-[11px] text-slate-500">
                ({product.reviews_count})
              </span>
            </div>
          </div>

          {/* Price & Action Buttons */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-black text-slate-900 font-mono block">
                  {formatPrice(product.price)}
                </span>
                {product.original_price && (
                  <span className="text-[11px] text-slate-400 line-through font-mono">
                    {formatPrice(product.original_price)}
                  </span>
                )}
              </div>

              <button
                onClick={() => addItem(product)}
                className="p-2 bg-slate-900 hover:bg-black text-white font-bold transition-colors flex items-center justify-center border border-slate-800 cursor-pointer shadow-sm"
                title="Add to Cart"
              >
                <ShoppingBag className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Regular View Details & Order Buttons Grid */}
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <Link
                href={`/products/${product.id}`}
                className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-[10px] uppercase tracking-wider flex items-center justify-center space-x-1 border border-slate-300 transition-colors"
                title="View Product Specs & Details"
              >
                <Eye className="w-3.5 h-3.5 text-slate-700" />
                <span>View Specs</span>
              </Link>

              <button
                onClick={() => setIsExpressModalOpen(true)}
                className="py-1.5 px-2 bg-slate-900 hover:bg-black text-white font-bold text-[10px] uppercase tracking-wider flex items-center justify-center space-x-1 border border-slate-800 transition-colors cursor-pointer"
                title="1-Click Fast Checkout"
              >
                <span>Place Order</span>
              </button>
            </div>

            {/* Wishlist Toggle Button */}
            {profile && (
              <div className="pt-0.5">
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`w-full py-1 px-2 text-[10px] font-bold flex items-center justify-center space-x-1 border transition-colors uppercase cursor-pointer ${
                    isLiked
                      ? "bg-slate-900 text-white border-slate-800"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-800"
                  }`}
                >
                  <Heart
                    className={`w-3 h-3 ${isLiked ? "fill-current text-white" : "text-slate-500"}`}
                  />
                  <span>{isLiked ? "Wishlisted" : "Wishlist"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Express Buy Modal */}
      <ExpressBuyModal
        product={product}
        quantity={1}
        isOpen={isExpressModalOpen}
        onClose={() => setIsExpressModalOpen(false)}
      />
    </>
  );
}
