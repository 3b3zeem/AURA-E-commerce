"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Loader2, Filter } from "lucide-react";
import { Product, Category } from "@/types";
import { CustomSelect } from "@/components/ui/CustomSelect";

interface AddOfferModalProps {
  isOpen: boolean;
  onClose?: () => void;
  isSubmitting: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, onSuccess: (url: string) => void) => void;
  productsList?: Product[];
  categoriesList?: Category[];
  newOfferTitle?: string;
  setNewOfferTitle?: (v: string) => void;
  newOfferBadge?: string;
  setNewOfferBadge?: (v: string) => void;
  newOfferSub?: string;
  setNewOfferSub?: (v: string) => void;
  newOfferSelectedProductIds?: string[];
  setNewOfferSelectedProductIds?: (ids: string[]) => void;
  newOfferOrigPrice?: string;
  setNewOfferOrigPrice?: (v: string) => void;
  newOfferPrice?: string;
  setNewOfferPrice?: (v: string) => void;
  newOfferImage?: string;
  setNewOfferImage?: (v: string) => void;
  newOfferDesc?: string;
  setNewOfferDesc?: (v: string) => void;
  newOfferStartsAt?: string;
  setNewOfferStartsAt?: (v: string) => void;
  newOfferEndsAt?: string;
  setNewOfferEndsAt?: (v: string) => void;
  newOfferOverlay?: boolean;
  setNewOfferOverlay?: (v: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function AddOfferModal({
  isOpen,
  onClose,
  isSubmitting,
  onFileUpload,
  productsList,
  categoriesList,
  newOfferTitle = "",
  setNewOfferTitle,
  newOfferBadge = "",
  setNewOfferBadge,
  newOfferSub = "",
  setNewOfferSub,
  newOfferSelectedProductIds = [],
  setNewOfferSelectedProductIds,
  newOfferOrigPrice = "",
  setNewOfferOrigPrice,
  newOfferPrice = "",
  setNewOfferPrice,
  newOfferImage = "",
  setNewOfferImage,
  newOfferDesc = "",
  setNewOfferDesc,
  newOfferStartsAt = "",
  setNewOfferStartsAt,
  newOfferEndsAt = "",
  setNewOfferEndsAt,
  newOfferOverlay = false,
  setNewOfferOverlay,
  onSubmit,
}: AddOfferModalProps) {
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border border-slate-200 w-full max-w-2xl p-6 space-y-6 text-slate-900 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h3 className="text-lg font-black uppercase text-slate-900">
                Create New Offer Bundle
              </h3>
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-1 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <form onSubmit={onSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-600 mb-1">Offer / Bundle Title *</label>
                <input
                  type="text"
                  required
                  value={newOfferTitle}
                  onChange={(e) => setNewOfferTitle && setNewOfferTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                  placeholder="e.g. AURA Cyber Gaming Suite"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={newOfferBadge}
                    onChange={(e) => setNewOfferBadge && setNewOfferBadge(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                    placeholder="e.g. 35% OFF BUNDLE"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={newOfferSub}
                    onChange={(e) => setNewOfferSub && setNewOfferSub(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                    placeholder="e.g. Limited Time Tech Bundle"
                  />
                </div>
              </div>

              {/* Multi-Select Products for Bundle */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-slate-900 font-bold uppercase text-[11px]">
                    1. Select Included Products from Catalog:
                  </label>
                  {productsList && newOfferSelectedProductIds.length > 0 && (
                    <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                      Total Reg Price: $
                      {productsList
                        .filter((p) => newOfferSelectedProductIds.includes(p.id))
                        .reduce((acc, p) => acc + (Number(p.price) || 0), 0)
                        .toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Category Filter Dropdown using CustomSelect */}
                <div className="space-y-1 mb-2">
                  <div className="flex items-center space-x-1.5 text-slate-700">
                    <Filter className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Filter Catalog by Category:
                    </span>
                  </div>
                  <CustomSelect
                    value={categoryFilter}
                    onChange={(val) => setCategoryFilter(val)}
                    options={[
                      {
                        value: "ALL",
                        label: `All Categories (${(productsList || []).length} products)`,
                      },
                      ...(categoriesList || []).map((c) => {
                        const count = (productsList || []).filter(
                          (p) => p.category_id === c.id || p.category?.id === c.id
                        ).length;
                        return {
                          value: c.id,
                          label: `${c.name} (${count} items)`,
                        };
                      }),
                    ]}
                    triggerClassName="w-full justify-between py-1.5 text-xs font-bold bg-white border-slate-300"
                  />
                </div>

                <div className="max-h-44 overflow-y-auto border border-slate-300 bg-slate-50 p-2 space-y-1">
                  {(productsList || [])
                    .filter((p) => {
                      if (categoryFilter === "ALL") return true;
                      return p.category_id === categoryFilter || p.category?.id === categoryFilter;
                    })
                    .map((p) => {
                    const isSelected = newOfferSelectedProductIds.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        className="flex items-center space-x-2 p-1.5 hover:bg-white cursor-pointer border border-transparent hover:border-slate-200"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (!setNewOfferSelectedProductIds) return;
                            const updatedIds = e.target.checked
                              ? [...newOfferSelectedProductIds, p.id]
                              : newOfferSelectedProductIds.filter((id) => id !== p.id);
                            
                            setNewOfferSelectedProductIds(updatedIds);

                            // Auto calculate Original Price from selected items sum
                            const newTotalOrig = (productsList || [])
                              .filter((item) => updatedIds.includes(item.id))
                              .reduce((acc, item) => acc + (Number(item.price) || 0), 0);
                            
                            if (setNewOfferOrigPrice) {
                              setNewOfferOrigPrice(newTotalOrig > 0 ? newTotalOrig.toFixed(2) : "");
                            }
                          }}
                          className="w-4 h-4 accent-slate-900"
                        />
                        <span className="text-slate-900 font-medium truncate flex-1">{p.name}</span>
                        <span className="text-slate-500 font-mono text-[11px]">${p.price}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Quick Discount Percent Picker & Price Calculations */}
              <div className="bg-slate-50 p-3 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-800 font-bold uppercase text-[10px]">
                    2. Quick Apply Discount Percentage:
                  </label>
                  <span className="text-[10px] text-slate-500 font-medium">Click to auto-calculate final offer price</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[10, 15, 20, 25, 30, 35, 40, 50].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => {
                        const currentOrig = parseFloat(newOfferOrigPrice || "0");
                        if (currentOrig > 0) {
                          const calculatedOfferP = (currentOrig * (1 - pct / 100)).toFixed(2);
                          if (setNewOfferPrice) setNewOfferPrice(calculatedOfferP);
                          if (setNewOfferBadge) setNewOfferBadge(`${pct}% OFF BUNDLE`);
                        }
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-slate-900 hover:text-white border border-slate-300 text-slate-800 font-mono font-bold text-[11px] transition-colors cursor-pointer"
                    >
                      {pct}% OFF
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 mb-1">Original Regular Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newOfferOrigPrice}
                    onChange={(e) => setNewOfferOrigPrice && setNewOfferOrigPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900 font-mono"
                    placeholder="Auto-calculated from selected items"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Special Offer Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newOfferPrice}
                    onChange={(e) => setNewOfferPrice && setNewOfferPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 font-bold focus:outline-none focus:border-slate-900 font-mono"
                    placeholder="e.g. 499.99"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">
                  Banner Image (Upload or URL)
                </label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <label className="px-3 py-2 bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs hover:border-slate-900 hover:text-slate-900 transition-colors cursor-pointer flex items-center space-x-1 whitespace-nowrap">
                      <Upload className="w-3.5 h-3.5 text-slate-900" />
                      <span>Choose File</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          onFileUpload(e, (url) => setNewOfferImage && setNewOfferImage(url))
                        }
                      />
                    </label>
                    <input
                      type="text"
                      value={newOfferImage}
                      onChange={(e) => setNewOfferImage && setNewOfferImage(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-300 p-2 text-slate-900 text-xs font-mono focus:outline-none focus:border-slate-900"
                      placeholder="Paste image URL..."
                    />
                  </div>
                  {newOfferImage && (
                    <div className="relative w-16 h-16 border border-slate-200">
                      <img src={newOfferImage} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newOfferDesc}
                  onChange={(e) => setNewOfferDesc && setNewOfferDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              {/* Offer Start & Expiry Date Inputs */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 border border-slate-200">
                <div>
                  <label className="block text-slate-800 font-bold mb-1 uppercase text-[10px]">
                    Start Date & Time (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={newOfferStartsAt}
                    onChange={(e) => setNewOfferStartsAt && setNewOfferStartsAt(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-2 text-slate-900 focus:outline-none focus:border-slate-900 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-800 font-bold mb-1 uppercase text-[10px]">
                    End Date & Time (Expiry)
                  </label>
                  <input
                    type="datetime-local"
                    value={newOfferEndsAt}
                    onChange={(e) => setNewOfferEndsAt && setNewOfferEndsAt(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-2 text-slate-900 focus:outline-none focus:border-slate-900 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1 text-slate-700">
                <input
                  type="checkbox"
                  id="add-offer-overlay"
                  checked={newOfferOverlay}
                  onChange={(e) => setNewOfferOverlay && setNewOfferOverlay(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
                <label htmlFor="add-offer-overlay" className="text-slate-900 font-black cursor-pointer uppercase">
                  ★ Set as Entrance Overlay Popup for Website Visitors
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-slate-900 hover:bg-black text-white font-black text-xs uppercase border border-slate-800 transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Offer...</span>
                  </>
                ) : (
                  <span>Save Offer Bundle to Supabase</span>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
