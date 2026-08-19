"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { getProductById, getProducts } from "@/lib/services/db";
import { Product } from "@/types";
import { formatPrice, calculateDiscountPercentage } from "@/lib/utils";
import { ProductTabs } from "@/components/product/ProductTabs";
import { ProductBundleWizard } from "@/components/product/ProductBundleWizard";
import { ProductCard } from "@/components/product/ProductCard";
import { useCartStore } from "@/store/useCartStore";
import { useUserStore } from "@/store/useUserStore";
import {
  Star,
  Heart,
  ShoppingBag,
  Share2,
  Check,
  ShieldCheck,
  Truck,
  ArrowLeft,
  RefreshCw,
  Zap,
} from "lucide-react";
import { ExpressBuyModal } from "@/components/checkout/ExpressBuyModal";
import { trackProductView } from "@/lib/analytics/tracker";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);
  const [isExpressModalOpen, setIsExpressModalOpen] = useState(false);

  const { addItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useUserStore();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [productId]);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      const [prod, catalog] = await Promise.all([
        getProductById(productId),
        getProducts(),
      ]);

      if (prod) {
        setProduct(prod);
        setSelectedImage(prod.images[0] || "");
        const initialVariants: Record<string, string> = {};
        prod.variants?.forEach((v: any) => {
          if (v.options.length > 0) initialVariants[v.name] = v.options[0];
        });
        setSelectedVariants(initialVariants);

        // Track product view event
        try {
          trackProductView(prod.id, prod.name, prod.price);
        } catch {}
      }
      if (Array.isArray(catalog)) {
        setAllProducts(catalog);
      }
      setLoading(false);
    }
    loadProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-slate-900 font-sans space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-slate-900" />
        <p className="text-xs uppercase font-bold text-slate-600">
          Loading Product Details...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-slate-900 font-sans space-y-4">
        <h1 className="text-2xl font-black uppercase text-slate-900">
          Product Not Found
        </h1>
        <Link
          href="/products"
          className="px-6 py-3 bg-slate-900 text-white font-bold text-xs uppercase border border-slate-800 inline-block hover:bg-black transition-colors"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  const isLiked = isInWishlist(product.id);
  const discount = product.original_price
    ? calculateDiscountPercentage(product.original_price, product.price)
    : 0;

  const handleShare = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] px-4 sm:px-6 lg:px-8 py-8 space-y-12 text-slate-900 font-sans">
      {/* Breadcrumb / Back button */}
      <div className="flex items-center space-x-2 text-xs text-slate-600 uppercase font-bold">
        <Link
          href="/products"
          className="hover:text-slate-900 flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalog
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-600">
          {product.category?.name || "Products"}
        </span>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900 font-black truncate">
          {product.name}
        </span>
      </div>

      {/* Main Grid: Gallery & Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column: Image Gallery with Left Side Thumbnails */}
        <div className="flex flex-col-reverse sm:flex-row gap-4 items-start">
          {/* Left: Vertical Thumbnails Column */}
          {product.images.length > 1 && (
            <div className="flex sm:flex-col gap-3 max-h-[540px] w-full sm:w-auto shrink-0 py-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 bg-white border transition-all flex-shrink-0 cursor-pointer overflow-hidden ${
                    selectedImage === img
                      ? "border-slate-900 border-2 shadow-sm scale-105"
                      : "border-slate-200 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} thumbnail ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Right: Main Display Image */}
          <div className="relative aspect-square w-full flex-1 bg-white border border-slate-200 overflow-hidden group">
            <img
              src={selectedImage || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
            />
            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-slate-900 text-white text-xs font-black px-3 py-1 uppercase border border-slate-800 shadow-md">
                SAVE {discount}%
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Product Metadata & Actions */}
        <div className="space-y-6">
          <div className="space-y-2 border-b border-slate-200 pb-6">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              {product.category?.name || "Hardware"}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black uppercase text-slate-900 tracking-tight leading-tight">
              {product.name}
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              {product.description}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {product.target_gender && (
                <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 border border-slate-300">
                  Target: {product.target_gender}
                </span>
              )}
              {product.origin_country && (
                <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 border border-slate-300">
                  Origin: {product.origin_country}
                </span>
              )}
              {product.min_order_qty && product.min_order_qty > 1 && (
                <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 border border-indigo-200">
                  Min Qty: {product.min_order_qty}
                </span>
              )}
            </div>

            {/* Ratings & Stock Status */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div className="flex items-center text-amber-500">
                <Star className="w-4 h-4 fill-current mr-1" />
                <span className="text-xs font-bold text-slate-900">
                  {product.rating_avg}
                </span>
              </div>
              <span className="text-xs text-slate-500 uppercase">
                ({product.reviews_count} Verified Reviews)
              </span>
              <span className="text-xs text-slate-300">•</span>

              {/* Intelligent Stock Alert Indicator */}
              {product.stock > 5 ? (
                <span className="text-xs text-emerald-600 font-bold uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  In Stock
                </span>
              ) : product.stock > 0 ? (
                <span className="text-xs text-amber-700 font-black uppercase flex items-center gap-1.5 bg-amber-50 border border-amber-300 px-2.5 py-1 rounded">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                  Only {product.stock} left in stock - Order soon!
                </span>
              ) : (
                <span className="text-xs text-rose-600 font-bold uppercase">
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline space-x-4">
            <span className="text-3xl font-black text-slate-900 font-mono">
              {formatPrice(product.price)}
            </span>
            {product.original_price && (
              <span className="text-base line-through text-slate-400 font-mono">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              {product.variants.map((v) => (
                <div key={v.name} className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 uppercase block">
                    {v.name}:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {v.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() =>
                          setSelectedVariants({
                            ...selectedVariants,
                            [v.name]: opt,
                          })
                        }
                        className={`px-3 py-1.5 text-xs font-bold uppercase border transition-all cursor-pointer ${
                          selectedVariants[v.name] === opt
                            ? "bg-slate-900 text-white border-slate-800"
                            : "bg-white text-slate-700 border-slate-300 hover:border-slate-900 hover:text-slate-900"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quantity & Cart Action Buttons - Clean Multi-Row Layout */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            {/* Row 1: Quantity Selector & Main Purchase CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Quantity Selector */}
              <div className="flex items-center justify-between sm:justify-start border border-slate-300 bg-white h-11 px-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-full flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-bold cursor-pointer transition-colors"
                >
                  -
                </button>
                <span className="px-4 text-xs font-mono font-bold text-slate-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-9 h-full flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-bold cursor-pointer transition-colors"
                >
                  +
                </button>
              </div>

              {/* Add To Bag */}
              <button
                onClick={() => addItem(product, quantity, selectedVariants)}
                className="flex-1 h-11 bg-slate-900 hover:bg-black text-white border border-slate-800 text-xs font-bold uppercase flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-sm"
              >
                <ShoppingBag className="w-4 h-4 text-white" />
                <span>Add {quantity} To Bag</span>
              </button>

              {/* 1-Click Express Buy Button */}
              <button
                onClick={() => setIsExpressModalOpen(true)}
                className="flex-1 h-11 bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-300 text-xs font-black uppercase flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md"
              >
                <Zap className="w-4 h-4 text-slate-950" />
                <span>Place Order</span>
              </button>
            </div>

            {/* Row 2: Secondary Utility Actions (Wishlist, Share) */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`flex-1 h-10 px-4 border text-xs font-bold uppercase flex items-center justify-center space-x-2 transition-colors cursor-pointer ${
                  isLiked
                    ? "bg-rose-600 text-white border-rose-500"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                }`}
                title="Add to Wishlist"
              >
                <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                <span className="text-[11px]">
                  {isLiked ? "Wishlisted" : "Wishlist"}
                </span>
              </button>

              <button
                onClick={handleShare}
                className="flex-1 h-10 px-4 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 text-xs font-bold uppercase flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                title="Share Product Link"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-[11px] text-emerald-600">
                      Copied!
                    </span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span className="text-[11px]">Share</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Guarantees */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-200 text-xs uppercase text-slate-600 font-bold">
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-slate-900" />
              <span>Express Delivery</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-slate-900" />
              <span>2-Year Hardware Warranty</span>
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Bought Together / Bundle Savings Wizard */}
      <ProductBundleWizard currentProduct={product} allProducts={allProducts} />

      {/* Tabs: Specifications & Customer Reviews */}
      <ProductTabs product={product} />

      {/* Similar / Related Products Section */}
      {(() => {
        const similarProducts = allProducts
          .filter(
            (p) =>
              p.id !== product.id &&
              (p.category_id === product.category_id ||
                p.category?.name === product.category?.name),
          )
          .slice(0, 4);

        const fallbackProducts =
          similarProducts.length > 0
            ? similarProducts
            : allProducts.filter((p) => p.id !== product.id).slice(0, 4);

        if (fallbackProducts.length === 0) return null;

        return (
          <div className="pt-8 border-t border-slate-200 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block">
                  Curated Recommendations
                </span>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  Similar & Related Products
                </h2>
              </div>
              <Link
                href="/products"
                className="text-xs font-mono font-bold text-slate-700 hover:text-slate-900 uppercase underline"
              >
                View All Catalog
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {fallbackProducts.map((simProd) => (
                <ProductCard key={simProd.id} product={simProd} />
              ))}
            </div>
          </div>
        );
      })()}

      {/* Express Buy Modal */}
      <ExpressBuyModal
        product={product}
        quantity={quantity}
        selectedVariants={selectedVariants}
        isOpen={isExpressModalOpen}
        onClose={() => setIsExpressModalOpen(false)}
      />
    </div>
  );
}
