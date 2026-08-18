import React, { useState } from "react";
import Link from "next/link";
import {
  Star,
  Heart,
  ShoppingBag,
  Eye,
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

  const isLiked = isInWishlist(product.id);
  const discount = product.original_price
    ? calculateDiscountPercentage(product.original_price, product.price)
    : 0;

  return (
    <>
      <div className="group relative bg-white border border-slate-200 overflow-hidden flex flex-col justify-between hover:border-slate-900 transition-colors">
        {/* Product Image & Overlays */}
        <div className="relative aspect-square bg-slate-50 border-b border-slate-200 overflow-hidden group">
          <img
            src={product.images[0] || '/placeholder.jpg'}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-300 ${
              product.images[1] ? 'group-hover:opacity-0' : 'group-hover:scale-105'
            }`}
          />
          {product.images[1] && (
            <img
              src={product.images[1]}
              alt={`${product.name} alternate view`}
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
            />
          )}

          {/* Top Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
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

          {/* Quick View Overlay */}
          <Link
            href={`/products/${product.id}`}
            className="absolute inset-0 z-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity"
          >
            <span className="px-3 py-1.5 bg-white text-slate-900 text-xs font-bold border border-slate-900 flex items-center space-x-1 uppercase">
              <Eye className="w-4 h-4 text-slate-900" />
              <span>Quick Specs</span>
            </span>
          </Link>
        </div>

        {/* Card Content */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
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
                className="p-2 bg-slate-900 hover:bg-black text-white font-bold transition-colors flex items-center justify-center border border-slate-800 cursor-pointer"
                title="Add to Cart"
              >
                <ShoppingBag className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* 1-Click Express Buy Button */}
            <button
              onClick={() => setIsExpressModalOpen(true)}
              className="w-full py-1.5 px-2 bg-slate-900 hover:bg-black  text-white font-bold text-[10px] uppercase tracking-wider flex items-center justify-center space-x-1 transition-all border border-slate-800 cursor-pointer shadow-sm"
              title="1-Click Express Order Confirmation"
            >
              <span>Place Order</span>
            </button>

            {/* Action Row: Wishlist */}
            {profile && (
              <div className="pt-1">
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`w-full py-1.5 px-2 text-[10px] font-bold flex items-center justify-center space-x-1 border transition-colors uppercase cursor-pointer ${
                    isLiked
                      ? "bg-slate-900 text-white border-slate-800"
                      : "bg-slate-100 text-slate-800 border-slate-300 hover:border-slate-900"
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
