"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Loader2, Plus, Image as ImageIcon, ArrowRight, Trash2, Star, Check } from "lucide-react";
import { Category, Brand } from "@/types";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { PRODUCT_BADGE_OPTIONS, TARGET_GENDER_OPTIONS, DEFAULT_PRODUCT_BRANDS } from "./modalConstants";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSubmitting: boolean;
  categoriesList: Category[];
  brandsList?: Brand[];
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, onSuccess: (url: string) => void) => void;

  newProdName: string;
  setNewProdName: (v: string) => void;
  newProdDesc: string;
  setNewProdDesc: (v: string) => void;
  newProdPrice: string;
  setNewProdPrice: (v: string) => void;
  newProdOrigPrice: string;
  setNewProdOrigPrice: (v: string) => void;
  newProdStock: string;
  setNewProdStock: (v: string) => void;
  newProdBadge: string;
  setNewProdBadge: (v: string) => void;
  newProdCategory: string;
  setNewProdCategory: (v: string) => void;
  newProdImage: string;
  setNewProdImage: (v: string) => void;
  newProdImages?: string[];
  setNewProdImages?: (imgs: string[]) => void;
  newProdFeatured: boolean;
  setNewProdFeatured: (v: boolean) => void;
  newProdFlashDeal: boolean;
  setNewProdFlashDeal: (v: boolean) => void;

  newProdBrand?: string;
  setNewProdBrand?: (v: string) => void;
  newProdBoughtPastMonth?: string;
  setNewProdBoughtPastMonth?: (v: string) => void;
  newProdSku?: string;
  setNewProdSku?: (v: string) => void;
  newProdTargetGender?: string;
  setNewProdTargetGender?: (v: string) => void;
  newProdOriginCountry?: string;
  setNewProdOriginCountry?: (v: string) => void;
  newProdShelfLife?: string;
  setNewProdShelfLife?: (v: string) => void;
  newProdKeyBenefits?: string;
  setNewProdKeyBenefits?: (v: string) => void;
  newProdHighlights?: string;
  setNewProdHighlights?: (v: string) => void;
  newProdUsage?: string;
  setNewProdUsage?: (v: string) => void;
  newProdCare?: string;
  setNewProdCare?: (v: string) => void;
  newProdPackageIncludes?: string;
  setNewProdPackageIncludes?: (v: string) => void;
  newProdDeliveryInfo?: string;
  setNewProdDeliveryInfo?: (v: string) => void;
  newProdReturnPolicy?: string;
  setNewProdReturnPolicy?: (v: string) => void;
  newProdDiscountStartsAt?: string;
  setNewProdDiscountStartsAt?: (v: string) => void;
  newProdDiscountEndsAt?: string;
  setNewProdDiscountEndsAt?: (v: string) => void;
  newProdFlashStartsAt?: string;
  setNewProdFlashStartsAt?: (v: string) => void;
  newProdFlashEndsAt?: string;
  setNewProdFlashEndsAt?: (v: string) => void;

  onSubmit: (e: React.FormEvent) => void;
}

export function AddProductModal({
  isOpen,
  onClose,
  isSubmitting,
  categoriesList,
  brandsList,
  onFileUpload,
  newProdName,
  setNewProdName,
  newProdDesc,
  setNewProdDesc,
  newProdPrice,
  setNewProdPrice,
  newProdOrigPrice,
  setNewProdOrigPrice,
  newProdStock,
  setNewProdStock,
  newProdBadge,
  setNewProdBadge,
  newProdCategory,
  setNewProdCategory,
  newProdImage,
  setNewProdImage,
  newProdImages = [],
  setNewProdImages,
  newProdFeatured,
  setNewProdFeatured,
  newProdFlashDeal,
  setNewProdFlashDeal,
  newProdBrand = "",
  setNewProdBrand,
  newProdBoughtPastMonth = "50",
  setNewProdBoughtPastMonth,
  newProdSku = "",
  setNewProdSku,
  newProdTargetGender = "unisex",
  setNewProdTargetGender,
  newProdOriginCountry = "",
  setNewProdOriginCountry,
  newProdShelfLife = "",
  setNewProdShelfLife,
  newProdKeyBenefits = "",
  setNewProdKeyBenefits,
  newProdHighlights = "",
  setNewProdHighlights,
  newProdUsage = "",
  setNewProdUsage,
  newProdCare = "",
  setNewProdCare,
  newProdPackageIncludes = "",
  setNewProdPackageIncludes,
  newProdDeliveryInfo = "",
  setNewProdDeliveryInfo,
  newProdReturnPolicy = "",
  setNewProdReturnPolicy,
  newProdDiscountStartsAt = "",
  setNewProdDiscountStartsAt,
  newProdDiscountEndsAt = "",
  setNewProdDiscountEndsAt,
  newProdFlashStartsAt = "",
  setNewProdFlashStartsAt,
  newProdFlashEndsAt = "",
  setNewProdFlashEndsAt,
  onSubmit,
}: AddProductModalProps) {
  const [addTab, setAddTab] = useState<'basic' | 'gallery' | 'specs' | 'shipping'>('basic');
  const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false);

  const brandSelectOptions = [
    ...(brandsList && brandsList.length > 0
      ? brandsList.map((b) => ({ value: b.name, label: b.name }))
      : DEFAULT_PRODUCT_BRANDS),
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-5xl bg-white border border-slate-200 shadow-2xl overflow-hidden text-slate-900 my-auto"
          >
            {/* Executive Dark Header */}
            <div className="bg-slate-950 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-slate-800 border border-slate-700 text-white">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase tracking-wider text-white">
                    Create New Product
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Supabase Live Catalog Infrastructure
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer border border-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modern Tab Bar Header */}
            <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto">
              <button
                type="button"
                onClick={() => setAddTab('basic')}
                className={`flex-1 py-3 px-4 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  addTab === 'basic'
                    ? 'border-slate-900 text-slate-950 bg-white shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>BASIC & PRICING</span>
              </button>

              <button
                type="button"
                onClick={() => setAddTab('gallery')}
                className={`flex-1 py-3 px-4 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  addTab === 'gallery'
                    ? 'border-slate-900 text-slate-950 bg-white shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>MEDIA GALLERY</span>
              </button>

              <button
                type="button"
                onClick={() => setAddTab('specs')}
                className={`flex-1 py-3 px-4 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  addTab === 'specs'
                    ? 'border-slate-900 text-slate-950 bg-white shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>UNIVERSAL SPECS</span>
              </button>

              <button
                type="button"
                onClick={() => setAddTab('shipping')}
                className={`flex-1 py-3 px-4 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  addTab === 'shipping'
                    ? 'border-slate-900 text-slate-950 bg-white shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>SHIPPING & USAGE</span>
              </button>
            </div>

            <form onSubmit={onSubmit}>
              <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
                {/* TAB 1: BASIC INFORMATION & PRICING */}
                {addTab === 'basic' && (
                  <div className="space-y-5 animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Product Title / Name *</label>
                        <input
                          type="text"
                          required
                          value={newProdName}
                          onChange={(e) => setNewProdName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 font-medium focus:outline-none focus:border-slate-900"
                          placeholder="e.g. AURA Cyber-Headphones Wireless"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">SKU / Serial Code</label>
                        <input
                          type="text"
                          value={newProdSku}
                          onChange={(e) => setNewProdSku && setNewProdSku(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-900"
                          placeholder="e.g. AURA-AUD-009"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Category *</label>
                        <CustomSelect
                          value={newProdCategory}
                          onChange={(val) => setNewProdCategory(val)}
                          options={[
                            { value: "", label: "-- Select Category --" },
                            ...categoriesList.map((c) => ({
                              value: c.id,
                              label: c.name,
                            })),
                          ]}
                          triggerClassName="w-full justify-between py-2.5 font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Brand Name</label>
                        <div className="space-y-1.5">
                          {brandSelectOptions.length > 0 && (
                            <CustomSelect
                              value={brandSelectOptions.some(b => b.value === newProdBrand) ? newProdBrand : (newProdBrand ? 'Other' : '')}
                              onChange={(val) => {
                                if (val !== 'Other') {
                                  setNewProdBrand?.(val);
                                }
                              }}
                              options={brandSelectOptions}
                              triggerClassName="w-full justify-between py-2 font-bold"
                            />
                          )}
                          <input
                            type="text"
                            value={newProdBrand || ''}
                            onChange={(e) => setNewProdBrand?.(e.target.value)}
                            placeholder="Type brand name freely..."
                            className="w-full bg-slate-50 border border-slate-300 p-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Badge Tag</label>
                        <CustomSelect
                          value={newProdBadge}
                          onChange={(val) => setNewProdBadge(val)}
                          options={PRODUCT_BADGE_OPTIONS}
                          triggerClassName="w-full justify-between py-2.5 font-bold"
                        />
                      </div>
                    </div>

                    {/* Pricing & Discount Calculation Section */}
                    <div className="bg-slate-50 p-3 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-slate-900 font-bold uppercase text-[11px]">
                          Product Pricing & Discount Calculator:
                        </label>
                        {parseFloat(newProdOrigPrice) > 0 && parseFloat(newProdPrice) > 0 && parseFloat(newProdOrigPrice) > parseFloat(newProdPrice) && (
                          <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                            YOU SAVE: ${(parseFloat(newProdOrigPrice) - parseFloat(newProdPrice)).toFixed(2)} (
                            {Math.round(((parseFloat(newProdOrigPrice) - parseFloat(newProdPrice)) / parseFloat(newProdOrigPrice)) * 100)}% OFF)
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1 text-[11px]">Original Price ($)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={newProdOrigPrice}
                            onChange={(e) => {
                              const orig = e.target.value;
                              setNewProdOrigPrice(orig);
                              const origNum = parseFloat(orig);
                              const priceNum = parseFloat(newProdPrice);
                              if (origNum > 0 && priceNum > 0 && origNum >= priceNum) {
                                // keep current price, percentage updates visually
                              }
                            }}
                            className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-900"
                            placeholder="e.g. 100.00"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1 text-[11px]">Discount (%)</label>
                          <input
                            type="number"
                            step="1"
                            max="99"
                            min="0"
                            value={
                              parseFloat(newProdOrigPrice) > 0 && parseFloat(newProdPrice) > 0 && parseFloat(newProdOrigPrice) > parseFloat(newProdPrice)
                                ? Math.round(((parseFloat(newProdOrigPrice) - parseFloat(newProdPrice)) / parseFloat(newProdOrigPrice)) * 100)
                                : ""
                            }
                            onChange={(e) => {
                              const pct = parseFloat(e.target.value) || 0;
                              const origNum = parseFloat(newProdOrigPrice);
                              if (origNum > 0) {
                                const calculatedPrice = (origNum * (1 - pct / 100)).toFixed(2);
                                setNewProdPrice(calculatedPrice);
                              }
                            }}
                            className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono text-xs font-bold focus:outline-none focus:border-slate-900"
                            placeholder="e.g. 20%"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-900 font-bold mb-1 text-[11px]">Final Price ($) *</label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={newProdPrice}
                            onChange={(e) => setNewProdPrice(e.target.value)}
                            className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono text-xs font-bold focus:outline-none focus:border-slate-900"
                            placeholder="e.g. 80.00"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1 text-[11px]">Stock Quantity *</label>
                          <input
                            type="number"
                            value={newProdStock}
                            onChange={(e) => setNewProdStock(e.target.value)}
                            className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-bold text-xs focus:outline-none focus:border-slate-900"
                          />
                        </div>
                      </div>

                      {/* Quick Discount Percent Bar */}
                      <div className="flex items-center space-x-1.5 pt-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Quick Discounts:</span>
                        <div className="flex flex-wrap gap-1">
                          {[10, 15, 20, 25, 30, 40, 50].map((pct) => (
                            <button
                              key={pct}
                              type="button"
                              onClick={() => {
                                const origNum = parseFloat(newProdOrigPrice) || parseFloat(newProdPrice);
                                if (origNum > 0) {
                                  if (!newProdOrigPrice || parseFloat(newProdOrigPrice) === 0) {
                                    setNewProdOrigPrice(origNum.toString());
                                  }
                                  const calculatedPrice = (origNum * (1 - pct / 100)).toFixed(2);
                                  setNewProdPrice(calculatedPrice);
                                  if (!newProdBadge) setNewProdBadge("SALE");
                                }
                              }}
                              className="px-2 py-0.5 bg-white hover:bg-slate-900 hover:text-white border border-slate-300 text-slate-800 font-mono font-bold text-[10px] transition-colors cursor-pointer"
                            >
                              {pct}% OFF
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Scheduled Product Discount Window */}
                    <div className="grid grid-cols-2 gap-4 bg-emerald-50/60 p-3 border border-emerald-200">
                      <div>
                        <label className="block text-emerald-900 font-bold mb-1 uppercase text-[10px]">
                          Discount Start Date & Time (Optional)
                        </label>
                        <input
                          type="datetime-local"
                          value={newProdDiscountStartsAt}
                          onChange={(e) => setNewProdDiscountStartsAt && setNewProdDiscountStartsAt(e.target.value)}
                          className="w-full bg-white border border-emerald-300 p-2 text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-emerald-900 font-bold mb-1 uppercase text-[10px]">
                          Discount End Date & Time (Expiry)
                        </label>
                        <input
                          type="datetime-local"
                          value={newProdDiscountEndsAt}
                          onChange={(e) => setNewProdDiscountEndsAt && setNewProdDiscountEndsAt(e.target.value)}
                          className="w-full bg-white border border-emerald-300 p-2 text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Description</label>
                      <textarea
                        rows={4}
                        value={newProdDesc}
                        onChange={(e) => setNewProdDesc(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 p-3 text-slate-900 leading-relaxed focus:outline-none focus:border-slate-900"
                        placeholder="Write a clear, compelling description for the product..."
                      />
                    </div>

                    <div className="space-y-3 p-3.5 bg-slate-50 border border-slate-200">
                      <div className="flex items-center space-x-6">
                        <label className="flex items-center space-x-2 cursor-pointer font-bold">
                          <input
                            type="checkbox"
                            checked={newProdFeatured}
                            onChange={(e) => setNewProdFeatured(e.target.checked)}
                            className="w-4 h-4 accent-slate-900 cursor-pointer"
                          />
                          <span>Featured Product</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer font-bold">
                          <input
                            type="checkbox"
                            checked={newProdFlashDeal}
                            onChange={(e) => setNewProdFlashDeal(e.target.checked)}
                            className="w-4 h-4 accent-slate-900 cursor-pointer"
                          />
                          <span>Flash Deal Item</span>
                        </label>
                      </div>

                      {newProdFlashDeal && (
                        <div className="grid grid-cols-2 gap-4 bg-amber-50 p-2.5 border border-amber-200">
                          <div>
                            <label className="block text-amber-900 font-bold mb-1 uppercase text-[10px]">
                              Flash Deal Start Date & Time
                            </label>
                            <input
                              type="datetime-local"
                              value={newProdFlashStartsAt}
                              onChange={(e) => setNewProdFlashStartsAt && setNewProdFlashStartsAt(e.target.value)}
                              className="w-full bg-white border border-amber-300 p-1.5 text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-900"
                            />
                          </div>
                          <div>
                            <label className="block text-amber-900 font-bold mb-1 uppercase text-[10px]">
                              Flash Deal End Date & Time
                            </label>
                            <input
                              type="datetime-local"
                              value={newProdFlashEndsAt}
                              onChange={(e) => setNewProdFlashEndsAt && setNewProdFlashEndsAt(e.target.value)}
                              className="w-full bg-white border border-amber-300 p-1.5 text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-900"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 2: COVER & MEDIA GALLERY */}
                {addTab === 'gallery' && (
                  <div className="space-y-6 animate-fadeIn">
                    {/* Primary Cover Image Box */}
                    <div className="p-4 bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-slate-900 font-black text-xs uppercase flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-slate-900" />
                          <span>Primary Cover Image *</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsPickerOpen(true)}
                          className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-[11px] uppercase flex items-center gap-1 border border-amber-500 shadow-xs cursor-pointer transition-all"
                        >
                          <Star className="w-3.5 h-3.5 fill-slate-950" />
                          <span>Select Main Cover from Gallery</span>
                        </button>
                      </div>

                      <div className="flex items-center space-x-2">
                        <label className="px-3 py-2 bg-white border border-slate-300 text-slate-800 font-bold text-xs hover:border-slate-900 transition-colors cursor-pointer flex items-center space-x-1 whitespace-nowrap shadow-xs">
                          <Upload className="w-3.5 h-3.5 text-slate-900" />
                          <span>Upload Cover</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              onFileUpload(e, (url) => setNewProdImage(url))
                            }
                          />
                        </label>
                        <input
                          type="text"
                          required
                          value={newProdImage}
                          onChange={(e) => setNewProdImage(e.target.value)}
                          className="flex-1 bg-white border border-slate-300 p-2 text-slate-900 text-xs font-mono focus:outline-none focus:border-slate-900"
                          placeholder="Paste Cover Image URL..."
                        />
                      </div>
                      {newProdImage && (
                        <div className="relative w-28 h-28 border-2 border-slate-900 bg-white p-1 shadow-sm">
                          <img src={newProdImage} alt="Cover Preview" className="w-full h-full object-cover" />
                          <span className="absolute top-1 left-1 bg-slate-950 text-white text-[9px] font-black px-1.5 py-0.5 uppercase flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                            <span>MAIN COVER</span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Additional Media Gallery Images */}
                    <div className="p-4 bg-slate-50 border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-black uppercase text-slate-900">Additional Media Gallery Images</h4>
                          <p className="text-[10px] text-slate-500">Upload multiple angle photos or paste image URLs</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (setNewProdImages) {
                              setNewProdImages([...newProdImages, '']);
                            }
                          }}
                          className="py-1 px-2.5 bg-slate-900 hover:bg-black text-white font-bold text-[10px] uppercase flex items-center gap-1 border border-slate-800 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Image URL Slot</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        {newProdImages.map((imgUrl, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-white p-2 border border-slate-200 shadow-xs">
                            <span className="text-xs font-mono font-bold text-slate-500 w-6 text-center">#{idx + 1}</span>

                            {imgUrl ? (
                              <div className="w-10 h-10 border border-slate-300 flex-shrink-0 overflow-hidden bg-slate-100 relative">
                                <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                              </div>
                            ) : null}

                            <input
                              type="text"
                              value={imgUrl}
                              onChange={(e) => {
                                if (setNewProdImages) {
                                  const updated = [...newProdImages];
                                  updated[idx] = e.target.value;
                                  setNewProdImages(updated);
                                }
                              }}
                              className="flex-1 bg-slate-50 border border-slate-300 p-2 text-slate-900 text-xs font-mono focus:outline-none focus:border-slate-900"
                              placeholder={`Gallery Image #${idx + 1} URL...`}
                            />

                            {imgUrl ? (
                              <button
                                type="button"
                                onClick={() => {
                                  // Set this image as main cover, push previous cover to gallery
                                  const prevCover = newProdImage;
                                  setNewProdImage(imgUrl);
                                  if (setNewProdImages) {
                                    const updated = newProdImages.filter((_, i) => i !== idx);
                                    if (prevCover) updated.unshift(prevCover);
                                    setNewProdImages(updated);
                                  }
                                }}
                                className="px-2 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold uppercase flex items-center gap-1 cursor-pointer transition-colors"
                                title="Set as Main Cover Image"
                              >
                                <Star className="w-3 h-3 fill-amber-500 text-amber-600" />
                                <span>Set as Main</span>
                              </button>
                            ) : null}

                            <label className="p-2 bg-white border border-slate-300 text-slate-700 hover:text-slate-950 cursor-pointer">
                              <Upload className="w-3.5 h-3.5" />
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                  onFileUpload(e, (url) => {
                                    if (setNewProdImages) {
                                      const updated = [...newProdImages];
                                      updated[idx] = url;
                                      setNewProdImages(updated);
                                    }
                                  })
                                }
                              />
                            </label>

                            <button
                              type="button"
                              onClick={() => {
                                if (setNewProdImages) {
                                  setNewProdImages(newProdImages.filter((_, i) => i !== idx));
                                }
                              }}
                              className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-slate-200 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pop-up Visual Main Cover Selector Modal */}
                    {isPickerOpen && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
                        <div className="bg-white border border-slate-300 shadow-2xl max-w-2xl w-full p-5 space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                            <h3 className="text-sm font-black uppercase text-slate-900 flex items-center gap-2">
                              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                              <span>Select Main Cover Image</span>
                            </h3>
                            <button
                              type="button"
                              onClick={() => setIsPickerOpen(false)}
                              className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>

                          <p className="text-xs text-slate-600">
                            Click on any image below to make it the <strong>Primary Cover Photo</strong> for this product:
                          </p>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto p-1">
                            {[...(newProdImage ? [newProdImage] : []), ...newProdImages.filter(Boolean)].map((imgUrl, i) => {
                              const isMain = imgUrl === newProdImage;
                              return (
                                <div
                                  key={i}
                                  onClick={() => {
                                    if (!isMain) {
                                      const prevCover = newProdImage;
                                      setNewProdImage(imgUrl);
                                      if (setNewProdImages) {
                                        const remaining = newProdImages.filter((url) => url !== imgUrl);
                                        if (prevCover && !remaining.includes(prevCover)) {
                                          remaining.unshift(prevCover);
                                        }
                                        setNewProdImages(remaining);
                                      }
                                    }
                                    setIsPickerOpen(false);
                                  }}
                                  className={`relative h-32 border-2 cursor-pointer transition-all overflow-hidden group ${
                                    isMain
                                      ? "border-amber-500 ring-2 ring-amber-400/50 shadow-md"
                                      : "border-slate-200 hover:border-slate-900"
                                  }`}
                                >
                                  <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                                  {isMain ? (
                                    <div className="absolute top-2 left-2 bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 uppercase flex items-center gap-1 shadow-sm">
                                      <Check className="w-3 h-3" />
                                      <span>MAIN COVER</span>
                                    </div>
                                  ) : (
                                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <span className="bg-white text-slate-950 font-black text-[10px] uppercase px-3 py-1 shadow-md flex items-center gap-1">
                                        <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                                        Make Main Cover
                                      </span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          <div className="flex justify-end pt-3 border-t border-slate-200">
                            <button
                              type="button"
                              onClick={() => setIsPickerOpen(false)}
                              className="px-4 py-2 bg-slate-900 text-white font-bold text-xs uppercase cursor-pointer"
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: UNIVERSAL SPECS & BENCHMARKS */}
                {addTab === 'specs' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Target Gender</label>
                        <CustomSelect
                          value={newProdTargetGender}
                          onChange={(val) => setNewProdTargetGender?.(val)}
                          options={TARGET_GENDER_OPTIONS}
                          triggerClassName="w-full justify-between py-2 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Origin Country</label>
                        <input
                          type="text"
                          value={newProdOriginCountry}
                          onChange={(e) => setNewProdOriginCountry?.(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 p-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                          placeholder="e.g. Japan, Germany, USA"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Shelf Life / Guarantee</label>
                        <input
                          type="text"
                          value={newProdShelfLife}
                          onChange={(e) => setNewProdShelfLife?.(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 p-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                          placeholder="e.g. 2 Years International Warranty"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Bought in Past Month (Social Proof)</label>
                        <input
                          type="number"
                          value={newProdBoughtPastMonth}
                          onChange={(e) => setNewProdBoughtPastMonth?.(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 p-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                          placeholder="e.g. 150"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Key Benefits Summary</label>
                      <input
                        type="text"
                        value={newProdKeyBenefits}
                        onChange={(e) => setNewProdKeyBenefits?.(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 p-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                        placeholder="e.g. Active Noise Cancelling, 40h Battery, Hi-Res Audio"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Feature Highlights (Comma separated)</label>
                      <textarea
                        rows={3}
                        value={newProdHighlights}
                        onChange={(e) => setNewProdHighlights?.(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                        placeholder="Ultra-lightweight design, Fast Bluetooth 5.3 Sync, Sweat Resistant IPX5"
                      />
                    </div>
                  </div>
                )}

                {/* TAB 4: SHIPPING & USAGE INSTRUCTIONS */}
                {addTab === 'shipping' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Package Includes (Comma separated)</label>
                      <input
                        type="text"
                        value={newProdPackageIncludes}
                        onChange={(e) => setNewProdPackageIncludes?.(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 p-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                        placeholder="1x AURA Headphones, 1x USB-C Cable, 1x Travel Case, 1x Manual"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Usage Instructions</label>
                        <textarea
                          rows={3}
                          value={newProdUsage}
                          onChange={(e) => setNewProdUsage?.(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                          placeholder="Hold power button for 3 seconds to pair via Bluetooth..."
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Care & Maintenance</label>
                        <textarea
                          rows={3}
                          value={newProdCare}
                          onChange={(e) => setNewProdCare?.(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                          placeholder="Clean ear cushions with microfiber cloth..."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Custom Delivery Info</label>
                      <input
                        type="text"
                        value={newProdDeliveryInfo}
                        onChange={(e) => setNewProdDeliveryInfo?.(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 p-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                        placeholder="Standard express shipping within 24-48 hours"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Custom Return Policy</label>
                      <input
                        type="text"
                        value={newProdReturnPolicy}
                        onChange={(e) => setNewProdReturnPolicy?.(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 p-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                        placeholder="14-day money-back guarantee with inspection upon receipt"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons Footer */}
              <div className="bg-slate-100 p-4 flex items-center justify-between border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <div className="flex items-center space-x-3">
                  {addTab !== 'shipping' ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (addTab === 'basic') setAddTab('gallery');
                        else if (addTab === 'gallery') setAddTab('specs');
                        else if (addTab === 'specs') setAddTab('shipping');
                      }}
                      className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs uppercase flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700 shadow-xs"
                    >
                      <span>Next Step</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : null}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-slate-950 hover:bg-black text-white font-black text-xs uppercase tracking-wider border border-slate-900 transition-all cursor-pointer flex items-center space-x-2 disabled:opacity-50 shadow-md"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving Product...</span>
                      </>
                    ) : (
                      <>
                        <span>Publish Product to Supabase</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
