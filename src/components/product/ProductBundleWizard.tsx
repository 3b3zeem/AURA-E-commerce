"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";
import { Layers, Plus, Check, ShoppingBag, Sparkles, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

interface ProductBundleWizardProps {
  currentProduct: Product;
  allProducts: Product[];
}

export function ProductBundleWizard({
  currentProduct,
  allProducts,
}: ProductBundleWizardProps) {
  const { addItem } = useCartStore();

  // Pick 2 random complementary products from the SAME category
  const complementaryProducts = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];

    // 1. Filter products from the SAME category (excluding current product)
    let categoryItems = allProducts.filter(
      (p) =>
        p.id !== currentProduct.id &&
        ((p.category_id &&
          currentProduct.category_id &&
          p.category_id === currentProduct.category_id) ||
          (p.category?.name &&
            currentProduct.category?.name &&
            p.category.name === currentProduct.category.name))
    );

    // 2. Fallback to remaining catalog items if category has fewer than 2 items
    if (categoryItems.length < 2) {
      const otherItems = allProducts.filter(
        (p) =>
          p.id !== currentProduct.id &&
          !categoryItems.some((ci) => ci.id === p.id)
      );
      categoryItems = [...categoryItems, ...otherItems];
    }

    if (categoryItems.length === 0) return [];

    // 3. Pseudo-random shuffle based on currentProduct.id so each product gets unique pairs
    let hash = 0;
    for (let i = 0; i < currentProduct.id.length; i++) {
      hash = (hash << 5) - hash + currentProduct.id.charCodeAt(i);
      hash |= 0;
    }
    const seed = Math.abs(hash);

    const shuffled = [...categoryItems];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = (seed + i * 37) % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, 2);
  }, [currentProduct, allProducts]);

  // Track which items are selected in the bundle
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Update selected IDs whenever current product or complementary products change
  useEffect(() => {
    setSelectedIds([currentProduct.id, ...complementaryProducts.map((p) => p.id)]);
  }, [currentProduct.id, complementaryProducts]);

  if (complementaryProducts.length === 0) return null;

  const allBundleItems = [currentProduct, ...complementaryProducts];
  const activeItems = allBundleItems.filter((item) => selectedIds.includes(item.id));

  // Pricing calculations
  const originalTotal = activeItems.reduce((acc, item) => acc + item.price, 0);
  const bundleDiscountPercent = activeItems.length >= 2 ? 0.15 : 0; // 15% discount when 2+ items selected
  const discountAmount = originalTotal * bundleDiscountPercent;
  const finalPrice = originalTotal - discountAmount;

  const toggleItem = (id: string) => {
    if (id === currentProduct.id) return; // Cannot deselect main product
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddBundleToCart = () => {
    if (activeItems.length === 0) return;

    activeItems.forEach((item) => {
      const discountedPrice =
        activeItems.length >= 2 ? Math.round(item.price * 0.85) : item.price;
      addItem({ ...item, price: discountedPrice }, 1);
    });

    toast.success(
      `Added ${activeItems.length} items to bag! Saved ${formatPrice(discountAmount)}`,
      {
        duration: 4000,
        style: {
          background: "#0f172a",
          color: "#ffffff",
          borderRadius: "0px",
          fontSize: "12px",
          fontWeight: "bold",
          border: "1px solid #1e293b",
        },
      }
    );
  };

  return (
    <div className="my-10 p-6 sm:p-8 bg-white border border-slate-200 shadow-sm space-y-6 font-sans text-slate-900 transition-all">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <span className="px-2.5 py-0.5 bg-amber-400 text-slate-950 font-mono text-[10px] font-black uppercase tracking-wider border border-amber-500">
              SPECIAL BUNDLE OFFER
            </span>
            <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-900" />
              Frequently Bought Together
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Pair this item with complementary items from the same category & save an extra 15% on your bundle.
          </p>
        </div>

        {bundleDiscountPercent > 0 && (
          <div className="self-start sm:self-auto px-3.5 py-2 bg-emerald-50 border border-emerald-300 text-emerald-900 font-mono text-xs font-bold uppercase flex items-center gap-2 shadow-xs">
            <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span>SAVE 15% EXTRA ({formatPrice(discountAmount)})</span>
          </div>
        )}
      </div>

      {/* Product Cards & Plus Connectors */}
      <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-3">
        {allBundleItems.map((item, index) => {
          const isMain = item.id === currentProduct.id;
          const isChecked = selectedIds.includes(item.id);

          return (
            <React.Fragment key={item.id}>
              {/* Plus Connector Icon between items */}
              {index > 0 && (
                <div className="flex items-center justify-center my-1 lg:my-0 text-slate-400 font-bold shrink-0">
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center shadow-xs">
                    <Plus className="w-4 h-4 text-slate-600" />
                  </div>
                </div>
              )}

              {/* Individual Item Card */}
              <div
                onClick={() => toggleItem(item.id)}
                className={`flex-1 w-full p-4 border transition-all relative flex flex-col justify-between space-y-4 ${
                  isMain
                    ? "bg-slate-900 text-white border-slate-900 shadow-md"
                    : isChecked
                    ? "bg-white border-slate-300 hover:border-slate-900 cursor-pointer shadow-xs"
                    : "bg-slate-50 border-slate-200 opacity-60 hover:opacity-100 cursor-pointer"
                }`}
              >
                {/* Header Checkbox & Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-4 h-4 border flex items-center justify-center transition-colors ${
                        isChecked
                          ? isMain
                            ? "bg-amber-400 border-amber-400 text-slate-950"
                            : "bg-slate-900 border-slate-900 text-white"
                          : "bg-white border-slate-300"
                      }`}
                    >
                      {isChecked && (
                        <Check
                          className={`w-3 h-3 ${
                            isMain ? "text-slate-950 font-black" : "text-white"
                          }`}
                        />
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                        isMain ? "text-slate-300" : "text-slate-500"
                      }`}
                    >
                      {isMain ? "This Item" : `Item #${index}`}
                    </span>
                  </div>

                  {isMain ? (
                    <span className="px-2 py-0.5 bg-amber-400 text-slate-950 text-[9px] font-mono uppercase font-black tracking-wider">
                      MAIN PRODUCT
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-mono">
                      {item.category?.name || "Category"}
                    </span>
                  )}
                </div>

                {/* Product Info & Thumbnail */}
                <div className="flex items-center space-x-3.5">
                  <img
                    src={item.images?.[0] || "/placeholder.jpg"}
                    alt={item.name}
                    className="w-16 h-16 object-cover border border-slate-200 bg-white shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4
                      className={`text-xs font-bold uppercase tracking-tight line-clamp-2 ${
                        isMain ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {item.name}
                    </h4>
                    <div className="flex items-baseline space-x-2 mt-1 font-mono">
                      <span
                        className={`text-xs font-black ${
                          isMain ? "text-amber-400" : "text-slate-900"
                        }`}
                      >
                        {formatPrice(item.price)}
                      </span>
                      {item.original_price && item.original_price > item.price && (
                        <span
                          className={`text-[10px] line-through ${
                            isMain ? "text-slate-400" : "text-slate-600"
                          }`}
                        >
                          {formatPrice(item.original_price)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Bundle Action Footer */}
      <div className="p-5 bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start space-x-3 font-mono">
            <span className="text-xs text-slate-500 font-bold uppercase">
              Total ({activeItems.length} items):
            </span>
            {bundleDiscountPercent > 0 && (
              <span className="text-xs line-through text-slate-600 font-bold">
                {formatPrice(originalTotal)}
              </span>
            )}
            <span className="text-xl font-black text-slate-900 font-mono">
              {formatPrice(finalPrice)}
            </span>
          </div>

          {bundleDiscountPercent > 0 ? (
            <p className="text-xs text-emerald-700 font-mono font-bold">
              ✓ Bundle Discount Applied: Saved {formatPrice(discountAmount)} (15% OFF)
            </p>
          ) : (
            <p className="text-xs text-slate-500 font-mono">
              Select 2 or more items to unlock 15% extra discount.
            </p>
          )}
        </div>

        <button
          onClick={handleAddBundleToCart}
          className="w-full sm:w-auto py-3.5 px-8 bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2.5 transition-all border border-slate-800 cursor-pointer shadow-md group"
        >
          <ShoppingBag className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          <span>Add Bundle to Bag</span>
          <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
