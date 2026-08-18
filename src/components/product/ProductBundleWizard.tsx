"use client";

import React, { useState } from "react";
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

  // Find 2 complementary products to pair with current product
  const complementaryProducts = React.useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];
    
    // Filter out current product
    const others = allProducts.filter((p) => p.id !== currentProduct.id);
    
    // Pick up to 2 items
    return others.slice(0, 2);
  }, [currentProduct, allProducts]);

  // Track which bundle items are selected (currentProduct is always selected)
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    return [currentProduct.id, ...complementaryProducts.map((p) => p.id)];
  });

  if (complementaryProducts.length === 0) return null;

  const allBundleItems = [currentProduct, ...complementaryProducts];
  const activeItems = allBundleItems.filter((item) => selectedIds.includes(item.id));

  // Pricing math
  const originalTotal = activeItems.reduce((acc, item) => acc + item.price, 0);
  const bundleDiscountPercent = activeItems.length >= 2 ? 0.15 : 0; // 15% discount if 2+ items selected
  const discountAmount = originalTotal * bundleDiscountPercent;
  const finalPrice = originalTotal - discountAmount;

  const toggleItem = (id: string) => {
    if (id === currentProduct.id) return; // cannot deselect main product
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddBundleToCart = () => {
    if (activeItems.length === 0) return;

    activeItems.forEach((item) => {
      // Apply 15% discount to price if bundle qualifies
      const discountedProduct = activeItems.length >= 2 ? { ...item, price: Math.round(item.price * 0.85) } : item;
      addItem(discountedProduct, 1);
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
    <div className="p-6 bg-slate-50 border border-slate-200 space-y-6 font-sans text-slate-900 my-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-mono text-[10px] font-black uppercase border border-amber-300">
              SPECIAL BUNDLE OFFER
            </span>
            <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-slate-900" />
              Frequently Bought Together
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            Combine these compatible items and save an extra 15% on your order.
          </p>
        </div>

        {bundleDiscountPercent > 0 && (
          <div className="px-3 py-1.5 bg-emerald-100 border border-emerald-300 text-emerald-900 font-mono text-xs font-bold uppercase flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Save 15% Extra ({formatPrice(discountAmount)})</span>
          </div>
        )}
      </div>

      {/* Visual Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {allBundleItems.map((item, index) => {
          const isMain = item.id === currentProduct.id;
          const isChecked = selectedIds.includes(item.id);

          return (
            <React.Fragment key={item.id}>
              {index > 0 && (
                <div className="hidden md:flex items-center justify-center text-slate-400 font-bold">
                  <Plus className="w-5 h-5 text-slate-400" />
                </div>
              )}

              <div
                onClick={() => toggleItem(item.id)}
                className={`p-4 border transition-all relative flex flex-col justify-between space-y-3 ${
                  isMain
                    ? "bg-white border-slate-900 ring-1 ring-slate-900"
                    : isChecked
                    ? "bg-white border-slate-400 cursor-pointer shadow-sm"
                    : "bg-slate-100 border-slate-200 opacity-60 cursor-pointer"
                }`}
              >
                {/* Selection Checkbox */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-4 h-4 border flex items-center justify-center ${
                        isChecked
                          ? "bg-slate-900 border-slate-900 text-white"
                          : "bg-white border-slate-300"
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-500">
                      {isMain ? "This Item" : `Add Item #${index}`}
                    </span>
                  </div>

                  {isMain && (
                    <span className="px-1.5 py-0.5 bg-slate-900 text-white text-[9px] font-mono uppercase font-bold">
                      Main
                    </span>
                  )}
                </div>

                {/* Product Image & Info */}
                <div className="flex items-center space-x-3">
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-14 h-14 object-cover border border-slate-200 bg-white"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 uppercase truncate">
                      {item.name}
                    </h4>
                    <p className="text-xs font-mono font-bold text-slate-900 mt-0.5">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Bundle Pricing Summary & Action */}
      <div className="p-4 bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <span className="text-xs text-slate-500 font-mono uppercase">
              Total Price ({activeItems.length} items):
            </span>
            {bundleDiscountPercent > 0 && (
              <span className="text-xs line-through text-slate-400 font-mono">
                {formatPrice(originalTotal)}
              </span>
            )}
            <span className="text-lg font-black text-slate-900 font-mono">
              {formatPrice(finalPrice)}
            </span>
          </div>

          {bundleDiscountPercent > 0 && (
            <p className="text-[11px] text-emerald-600 font-mono font-bold mt-0.5">
              Bundle Savings: You save {formatPrice(discountAmount)} (15% OFF)
            </p>
          )}
        </div>

        <button
          onClick={handleAddBundleToCart}
          className="w-full sm:w-auto py-3 px-6 bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all border border-slate-800 cursor-pointer shadow-md"
        >
          <ShoppingBag className="w-4 h-4 text-amber-400" />
          <span>Add Bundle to Bag</span>
          <ArrowRight className="w-4 h-4 text-amber-400" />
        </button>
      </div>
    </div>
  );
}
