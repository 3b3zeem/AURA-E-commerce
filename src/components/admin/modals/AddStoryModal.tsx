"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Loader2, Package, Search, Filter, Palette } from "lucide-react";
import { Product, Category } from "@/types";

export const GRADIENT_PRESETS = [
  { label: "Gentlemen Gold", value: "from-yellow-950 via-stone-900 to-black" },
  { label: "Purple Cyber", value: "from-purple-900 via-indigo-900 to-slate-900" },
  { label: "Amber Luxury", value: "from-amber-950 via-slate-900 to-black" },
  { label: "Rose Studio", value: "from-rose-950 via-slate-900 to-zinc-900" },
  { label: "Emerald Teal", value: "from-emerald-950 via-teal-950 to-slate-900" },
  { label: "Deep Ocean", value: "from-blue-950 via-slate-950 to-black" },
  { label: "Midnight Dark", value: "from-slate-950 via-slate-900 to-black" },
];

interface AddStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSubmitting: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, onSuccess: (url: string) => void) => void;
  newStoryTitle: string;
  setNewStoryTitle: (v: string) => void;
  newStorySub: string;
  setNewStorySub: (v: string) => void;
  newStoryImg: string;
  setNewStoryImg: (v: string) => void;
  newStoryBgGradient?: string;
  setNewStoryBgGradient?: (v: string) => void;
  newStoryIsActive?: boolean;
  setNewStoryIsActive?: (v: boolean) => void;
  productsList?: Product[];
  categoriesList?: Category[];
  selectedProductIds?: string[];
  setSelectedProductIds?: (ids: string[]) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function AddStoryModal({
  isOpen,
  onClose,
  isSubmitting,
  onFileUpload,
  newStoryTitle,
  setNewStoryTitle,
  newStorySub,
  setNewStorySub,
  newStoryImg,
  setNewStoryImg,
  newStoryBgGradient = "from-yellow-950 via-stone-900 to-black",
  setNewStoryBgGradient,
  newStoryIsActive = true,
  setNewStoryIsActive,
  productsList = [],
  categoriesList = [],
  selectedProductIds = [],
  setSelectedProductIds,
  onSubmit,
}: AddStoryModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCatFilter, setSelectedCatFilter] = useState("");

  const toggleProduct = (productId: string) => {
    if (!setSelectedProductIds) return;
    if (selectedProductIds.includes(productId)) {
      setSelectedProductIds(selectedProductIds.filter((id) => id !== productId));
    } else {
      setSelectedProductIds([...selectedProductIds, productId]);
    }
  };

  const filteredProducts = productsList.filter((p) => {
    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      !selectedCatFilter ||
      p.category_id === selectedCatFilter ||
      p.category?.id === selectedCatFilter ||
      p.category?.slug === selectedCatFilter ||
      p.category?.name === selectedCatFilter ||
      (typeof p.category === "string" && p.category === selectedCatFilter);

    return matchesSearch && matchesCategory;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border border-slate-200 w-full max-w-lg p-6 space-y-6 text-slate-900 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h3 className="text-lg font-black uppercase text-slate-900">
                Add New Story Drop
              </h3>
              <button
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-600 mb-1">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  required
                  value={newStoryTitle}
                  onChange={(e) => setNewStoryTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                  placeholder="e.g. CYBER EDITION '26"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={newStorySub}
                  onChange={(e) => setNewStorySub(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                  placeholder="e.g. Next-Gen Wireless Audio"
                />
              </div>

              {/* BACKGROUND GRADIENT PICKER */}
              <div>
                <label className="block text-slate-600 mb-1 flex items-center justify-between">
                  <span className="flex items-center space-x-1">
                    <Palette className="w-3.5 h-3.5 text-amber-600" />
                    <span>Story Background Theme (Gradient)</span>
                  </span>
                </label>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={newStoryBgGradient}
                      onChange={(e) => setNewStoryBgGradient && setNewStoryBgGradient(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 p-2 text-slate-900 text-xs focus:outline-none focus:border-slate-900"
                    >
                      {GRADIENT_PRESETS.map((preset) => (
                        <option key={preset.value} value={preset.value}>
                          {preset.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={newStoryBgGradient}
                      onChange={(e) => setNewStoryBgGradient && setNewStoryBgGradient(e.target.value)}
                      placeholder="Custom tailwind gradient classes..."
                      className="w-full bg-slate-50 border border-slate-300 p-2 text-slate-900 text-[11px] font-mono focus:outline-none focus:border-slate-900"
                    />
                  </div>
                  {/* Live Gradient Preview Bar */}
                  <div
                    className={`h-6 rounded border border-slate-300 bg-gradient-to-r ${newStoryBgGradient} flex items-center justify-center text-[10px] text-white font-bold tracking-wider shadow-inner`}
                  >
                    BACKGROUND GRADIENT PREVIEW
                  </div>
                </div>
              </div>

              {/* STORY ACTIVE STATUS TOGGLE */}
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200">
                <div>
                  <span className="block text-slate-900 font-bold text-xs">Publish Status (Is Active)</span>
                  <span className="block text-[11px] text-slate-500 font-normal">
                    {newStoryIsActive ? "Active & visible on homepage stories bar" : "Hidden / Inactive draft story"}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newStoryIsActive}
                    onChange={(e) => setNewStoryIsActive && setNewStoryIsActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">
                  Image (Upload from Folder or URL)
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
                          onFileUpload(e, (url) => setNewStoryImg(url))
                        }
                      />
                    </label>
                    <input
                      type="text"
                      value={newStoryImg}
                      onChange={(e) => setNewStoryImg(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-300 p-2 text-slate-900 text-xs font-mono focus:outline-none focus:border-slate-900"
                      placeholder="Paste image URL..."
                    />
                  </div>
                  {newStoryImg && (
                    <div className="relative w-16 h-16 border border-slate-200">
                      <img
                        src={newStoryImg}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* PRODUCT SELECTOR WITH SEARCH & CATEGORY FILTER */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 font-bold flex items-center space-x-1">
                    <Package className="w-3.5 h-3.5 text-purple-600" />
                    <span>Attach Products to Story ({selectedProductIds.length} Selected)</span>
                  </label>
                  {selectedProductIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedProductIds && setSelectedProductIds([])}
                      className="text-[10px] text-rose-600 hover:underline font-bold"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>

                {/* Search & Category Filter Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search product..."
                      className="w-full pl-8 pr-2 py-1.5 bg-slate-50 border border-slate-300 text-slate-900 text-[11px] focus:outline-none focus:border-purple-600"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                      value={selectedCatFilter}
                      onChange={(e) => setSelectedCatFilter(e.target.value)}
                      className="w-full pl-8 pr-2 py-1.5 bg-slate-50 border border-slate-300 text-slate-900 text-[11px] focus:outline-none focus:border-purple-600"
                    >
                      <option value="">All Categories</option>
                      {categoriesList.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="max-h-48 overflow-y-auto border border-slate-200 p-2 space-y-1 bg-slate-50 divide-y divide-slate-100">
                  {productsList.length === 0 ? (
                    <p className="text-slate-500 text-[11px] p-2 text-center">
                      Loading products list...
                    </p>
                  ) : filteredProducts.length === 0 ? (
                    <p className="text-slate-500 text-[11px] p-2 text-center">
                      No products match your search/filter.
                    </p>
                  ) : (
                    filteredProducts.map((p) => {
                      const isSelected = selectedProductIds.includes(p.id);
                      return (
                        <label
                          key={p.id}
                          className={`flex items-center justify-between p-1.5 cursor-pointer rounded transition-colors ${
                            isSelected ? "bg-purple-100/70 border border-purple-300" : "hover:bg-slate-100"
                          }`}
                        >
                          <div className="flex items-center space-x-2 truncate pr-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleProduct(p.id)}
                              className="rounded border-slate-300 text-purple-600 focus:ring-0 cursor-pointer"
                            />
                            <span className="text-xs font-bold text-slate-900 truncate">{p.name}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 font-bold">
                            ${p.price}
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  If no products are selected, smart keyword matching will automatically curate items for this story.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-slate-900 hover:bg-black text-white font-black text-xs uppercase border border-slate-800 transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing Story...</span>
                  </>
                ) : (
                  <span>Publish Story to Supabase</span>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
