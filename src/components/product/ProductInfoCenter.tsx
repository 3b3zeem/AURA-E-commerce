"use client";

import React from "react";
import { Star, CreditCard, Banknote, RotateCcw, Truck, CheckCircle2, Lock } from "lucide-react";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { ProductDiscountCountdown } from "./ProductDiscountCountdown";

interface ProductInfoCenterProps {
  product: Product;
  dynamicRatingAvg: string | number;
  dynamicReviewsCount: number;
  discount: number;
  selectedVariants: Record<string, string>;
  setSelectedVariants: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  handleSearchThisPage: () => void;
  techSpecs: Record<string, any>;
  aboutHighlights: string[];
}

export function ProductInfoCenter({
  product,
  dynamicRatingAvg,
  dynamicReviewsCount,
  discount,
  selectedVariants,
  setSelectedVariants,
  handleSearchThisPage,
  techSpecs,
  aboutHighlights,
}: ProductInfoCenterProps) {
  return (
    <div className="lg:col-span-5 space-y-5 border-b lg:border-b-0 border-slate-200 pb-6 lg:pb-0 font-sans text-slate-900">
      <div>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
          Brand: <strong className="text-slate-900">{product.brand || "AURA Flagship"}</strong>
        </span>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight mt-1">
          {product.name}
        </h1>

        {/* Ratings, Reviews & Link */}
        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
          {dynamicReviewsCount > 0 ? (
            <>
              <div className="flex items-center text-amber-500">
                <span className="font-black mr-1 text-slate-900">{dynamicRatingAvg}</span>
                <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
              </div>
              <span className="text-slate-600 font-bold">
                ({dynamicReviewsCount} verified {dynamicReviewsCount === 1 ? 'rating' : 'ratings'})
              </span>
            </>
          ) : (
            <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
              <div className="flex items-center text-slate-300">
                <Star className="w-3.5 h-3.5 text-slate-300" />
              </div>
              <span>0 (0 verified ratings)</span>
            </div>
          )}
          <span className="text-slate-300">|</span>
          <button
            onClick={handleSearchThisPage}
            className="text-slate-600 hover:text-slate-900 underline font-semibold cursor-pointer"
          >
            Search this page
          </button>
        </div>
      </div>

      {/* Pricing Banner */}
      <div className="space-y-2 pb-4 border-b border-slate-200">
        <div className="flex items-baseline gap-3">
          {discount > 0 && (
            <span className="text-lg font-black text-rose-600">-{discount}%</span>
          )}
          <span className="text-2xl font-black text-slate-900 font-mono">
            {formatPrice(product.price)}
          </span>
          {product.original_price && (
            <span className="text-xs font-semibold line-through text-slate-600 font-mono">
              List Price: {formatPrice(product.original_price)}
            </span>
          )}
        </div>

        {/* Live Countdown */}
        {(discount > 0 || product.discount_ends_at || product.is_flash_deal) && (
          <ProductDiscountCountdown
            targetDate={product.discount_ends_at || product.flash_deal_ends_at}
            discountPercent={discount}
          />
        )}

        {/* Installments */}
        <div className="text-xs text-slate-700 flex items-center gap-1.5 pt-1 border-t border-slate-100 font-medium">
          <CreditCard className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>
            Or <strong>{formatPrice(Math.round(product.price / 3))}</strong>/month x 3 months
            at 0% interest.
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-bold uppercase pt-0.5">
          <span className="text-emerald-700">FREE Returns</span>
          <span>•</span>
          <span>All prices include VAT</span>
        </div>
      </div>

      {/* 5 Trust Badges Grid */}
      <div className="grid grid-cols-5 gap-1.5 py-3 border-y border-slate-200 text-center text-[10px] font-bold text-slate-700">
        <div className="flex flex-col items-center space-y-1 p-1.5 bg-white border border-slate-200">
          <Banknote className="w-4 h-4 text-slate-900" />
          <span>Cash on Delivery</span>
        </div>
        <div className="flex flex-col items-center space-y-1 p-1.5 bg-white border border-slate-200">
          <RotateCcw className="w-4 h-4 text-slate-900" />
          <span>15 Days Returnable</span>
        </div>
        <div className="flex flex-col items-center space-y-1 p-1.5 bg-white border border-slate-200">
          <Truck className="w-4 h-4 text-slate-900" />
          <span>Free Delivery</span>
        </div>
        <div className="flex flex-col items-center space-y-1 p-1.5 bg-white border border-slate-200">
          <CheckCircle2 className="w-4 h-4 text-slate-900" />
          <span>Delivered by AURA</span>
        </div>
        <div className="flex flex-col items-center space-y-1 p-1.5 bg-white border border-slate-200">
          <Lock className="w-4 h-4 text-slate-900" />
          <span>Secure Transaction</span>
        </div>
      </div>

      {/* Variants Selector */}
      {product.variants && product.variants.length > 0 && (
        <div className="space-y-3">
          {product.variants.map((v) => (
            <div key={v.name} className="space-y-1.5">
              <span className="text-xs font-bold text-slate-800 uppercase block">
                {v.name}:{" "}
                <strong className="text-slate-950">
                  {selectedVariants[v.name] || "Select"}
                </strong>
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
                        ? "bg-slate-900 text-white border-slate-800 shadow-sm"
                        : "bg-white text-slate-700 border-slate-300 hover:border-slate-900"
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

      {/* Specs Summary */}
      {Object.keys(techSpecs).length > 0 && (
        <div className="space-y-2 pt-2">
          <span className="text-xs font-black uppercase text-slate-800 block">
            Technical Specifications
          </span>
          <div className="bg-white border border-slate-200 text-xs divide-y divide-slate-100">
            {Object.entries(techSpecs)
              .slice(0, 5)
              .map(([key, val]) => (
                <div key={key} className="grid grid-cols-2 p-2">
                  <span className="font-bold text-slate-600">{key}</span>
                  <span className="text-slate-900 font-medium">{String(val)}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* About Highlights List */}
      {aboutHighlights.length > 0 && (
        <div className="space-y-2 pt-2">
          <span className="text-xs font-black uppercase text-slate-800 block">
            About this item
          </span>
          <ul className="list-disc list-inside text-xs text-slate-700 space-y-1.5 pl-1 leading-relaxed">
            {aboutHighlights.map((hl, idx) => (
              <li key={idx} className="text-slate-800">
                <span className="font-semibold text-slate-900">{hl}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
