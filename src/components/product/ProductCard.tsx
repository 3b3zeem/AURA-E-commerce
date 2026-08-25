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
import { formatPrice, calculateDiscountPercentage, getProductRating, getProductReviewsCount } from "@/lib/utils";
import { calculateExpressDelivery, getActiveGovernorate, setActiveGovernorate } from "@/lib/shipping";
import { useCartStore } from "@/store/useCartStore";
import { useUserStore } from "@/store/useUserStore";
import { useUserWishlist } from "@/hooks/useUserData";
import { ExpressBuyModal } from "@/components/checkout/ExpressBuyModal";
import { ProductDiscountCountdown } from "@/components/product/ProductDiscountCountdown";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { profile } = useUserStore();
  const { data: wishlistRaw = [], addToWishlistMutation, removeFromWishlistMutation } = useUserWishlist(profile?.id);
  const [isExpressModalOpen, setIsExpressModalOpen] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [activeGov, setActiveGov] = useState<string>(() => getActiveGovernorate());

  useEffect(() => {
    const handleGovChange = () => {
      setActiveGov(getActiveGovernorate());
    };

    window.addEventListener("aura_governorate_selected", handleGovChange);
    return () => {
      window.removeEventListener("aura_governorate_selected", handleGovChange);
    };
  }, []);

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
    }, 6000);

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

  const isLiked =
    Array.isArray(wishlistRaw) &&
    wishlistRaw.some(
      (w: any) =>
        w.product_id === product.id || w.id === product.id || w === product.id,
    );

  const handleToggleWishlist = () => {
    if (!profile?.id) return;
    if (isLiked) {
      removeFromWishlistMutation.mutate({
        userId: profile.id,
        productId: product.id,
      });
    } else {
      addToWishlistMutation.mutate({
        userId: profile.id,
        productId: product.id,
      });
    }
  };

  const nowStr = new Date().toISOString();
  const isDiscountActive = Boolean(
    product.original_price &&
      product.original_price > product.price &&
      (!product.discount_starts_at || product.discount_starts_at <= nowStr) &&
      (!product.discount_ends_at || product.discount_ends_at >= nowStr)
  );

  const discount = isDiscountActive && product.original_price
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
              <span className={`px-2 py-0.5 font-black text-[10px] uppercase tracking-wider border ${
                product.badge.toLowerCase().includes("best seller")
                  ? "bg-amber-500 text-slate-950 border-amber-600 shadow-sm"
                  : product.badge.toLowerCase().includes("limited")
                  ? "bg-rose-600 text-white border-rose-700 shadow-sm"
                  : "bg-slate-900 text-white border-slate-800"
              }`}>
                {product.badge}
              </span>
            )}
            {product.is_flash_deal && (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold text-[10px] uppercase tracking-wider border border-amber-300">
                Limited Time Deal
              </span>
            )}
            {discount > 0 && (
              <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-black text-[10px] border border-rose-300">
                -{discount}% OFF
              </span>
            )}
          </div>

          {/* Compact Offer Countdown */}
          {(discount > 0 || product.discount_ends_at || product.is_flash_deal) && (
            <div className="absolute bottom-2 left-2 z-20">
              <ProductDiscountCountdown
                compact
                targetDate={product.discount_ends_at || product.flash_deal_ends_at}
                discountPercent={discount}
              />
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              {product.brand ? `Brand: ${product.brand}` : (product.category?.name || "Product")}
            </span>

            <Link href={`/products/${product.id}`}>
              <h3 className="text-xs font-bold text-slate-900 tracking-tight line-clamp-2 hover:text-amber-600 transition-colors leading-snug">
                {product.name}
              </h3>
            </Link>

            {/* Ratings & Bought Count */}
            {(() => {
              const ratingAvg = getProductRating(product);
              const reviewsCount = getProductReviewsCount(product);
              const hasReviews = reviewsCount > 0 && ratingAvg > 0;
              return (
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <div className="flex items-center">
                    <Star className={`w-3.5 h-3.5 ${hasReviews ? "fill-current text-amber-500" : "text-slate-300"}`} />
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    {hasReviews ? ratingAvg : "0"}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">
                    ({reviewsCount})
                  </span>
                  
                  {/* Sales Volume / Bought Count - Real Supabase Column */}
                  {Boolean(product.bought_past_month) && (
                    <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 border border-slate-200">
                      {product.bought_past_month}+ bought in past month
                    </span>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Price & Action Buttons */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            {/* Price section with List Price format */}
            <div className="flex items-baseline justify-between">
              <div>
                <div className="flex items-baseline gap-1.5">
                  {discount > 0 && (
                    <span className="text-[10px] font-bold bg-slate-900 text-white px-1 py-0.5">-{discount}%</span>
                  )}
                  <span className="text-sm font-black text-slate-900 font-mono">
                    {formatPrice(product.price)}
                  </span>
                </div>
                {isDiscountActive && product.original_price && (
                  <span className="text-[11px] text-slate-600 font-medium line-through font-mono block">
                    List: {formatPrice(product.original_price)}
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

            {/* Delivery ETA & Fulfillment Info */}
            <div className="text-[10px] space-y-0.5 pt-1 text-slate-600 border-t border-dashed border-slate-200">
              <p className="font-semibold text-slate-700">
                Get it as soon as <span className="font-bold text-slate-900">{calculateExpressDelivery(17, activeGov).deliveryText}</span>
              </p>
              <p className="text-slate-500">
                Fulfilled by AURA • {product.price >= 2000 ? "FREE Shipping" : "Standard Shipping"}
              </p>
              {product.stock <= 3 && product.stock > 0 && (
                <p className="text-slate-900 font-bold">
                  Only {product.stock} left in stock - order soon.
                </p>
              )}
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
                  onClick={handleToggleWishlist}
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
