"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Loader2, Filter, Plus, Trash2, Image as ImageIcon, ArrowRight, Edit2 } from "lucide-react";
import { Product, Category, Brand, Story, Offer } from "@/types";
import { CustomSelect } from "@/components/ui/CustomSelect";

const PRODUCT_BADGE_OPTIONS = [
  { value: "", label: "No Badge" },
  { value: "NEW", label: "NEW" },
  { value: "HOT", label: "HOT" },
  { value: "BESTSELLER", label: "BESTSELLER" },
  { value: "LIMITED", label: "LIMITED" },
  { value: "SALE", label: "SALE" },
  { value: "TRENDING", label: "TRENDING" },
  { value: "PREMIUM", label: "PREMIUM" },
];

const TARGET_GENDER_OPTIONS = [
  { value: "unisex", label: "Unisex" },
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
];

export const DEFAULT_PRODUCT_BRANDS = [
  { value: "AURA Official", label: "AURA Official" },
  { value: "Anker", label: "Anker" },
  { value: "Sony", label: "Sony" },
  { value: "Apple", label: "Apple" },
  { value: "Samsung", label: "Samsung" },
  { value: "Logitech", label: "Logitech" },
  { value: "Razer", label: "Razer" },
  { value: "Bose", label: "Bose" },
  { value: "Asus", label: "Asus" },
  { value: "Xiaomi", label: "Xiaomi" },
  { value: "Baseus", label: "Baseus" },
  { value: "JBL", label: "JBL" },
  { value: "Other", label: "+ Custom / Other Brand" },
];

interface AdminModalsProps {
  categoriesList: Category[];
  brandsList?: Brand[];
  isSubmitting: boolean;
  onFileUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (url: string) => void,
  ) => void;

  // Add Product Modal
  isAddProductOpen: boolean;
  onCloseAddProduct: () => void;
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

  onAddProductSubmit: (e: React.FormEvent) => void;

  // Add Category Modal
  isAddCategoryOpen: boolean;
  onCloseAddCategory: () => void;
  newCatName: string;
  setNewCatName: (v: string) => void;
  newCatSlug: string;
  setNewCatSlug: (v: string) => void;
  newCatDesc: string;
  setNewCatDesc: (v: string) => void;
  newCatImage: string;
  setNewCatImage: (v: string) => void;
  newCatFeatured: boolean;
  setNewCatFeatured: (v: boolean) => void;
  onAddCategorySubmit: (e: React.FormEvent) => void;

  // Add Story Modal
  isAddStoryOpen: boolean;
  onCloseAddStory: () => void;
  newStoryTitle: string;
  setNewStoryTitle: (v: string) => void;
  newStorySub: string;
  setNewStorySub: (v: string) => void;
  newStoryImg: string;
  setNewStoryImg: (v: string) => void;
  onAddStorySubmit: (e: React.FormEvent) => void;

  // Add Trending Modal
  isAddTrendingOpen: boolean;
  onCloseAddTrending: () => void;
  newTrendingQuery: string;
  setNewTrendingQuery: (v: string) => void;
  onAddTrendingSubmit: (e: React.FormEvent) => void;

  // Edit Product Modal
  editingProduct: Product | null;
  setEditingProduct: (p: Product | null) => void;
  onUpdateProductSubmit: (e: React.FormEvent) => void;

  // Edit Category Modal
  editingCategory: Category | null;
  setEditingCategory: (c: Category | null) => void;
  onUpdateCategorySubmit: (e: React.FormEvent) => void;

  // Edit Story Modal
  editingStory: Story | null;
  setEditingStory: (s: Story | null) => void;
  onUpdateStorySubmit: (e: React.FormEvent) => void;

  // Add / Edit Offer Modal Props
  productsList?: Product[];
  isAddOfferOpen?: boolean;
  onCloseAddOffer?: () => void;
  newOfferTitle?: string;
  setNewOfferTitle?: (v: string) => void;
  newOfferSub?: string;
  setNewOfferSub?: (v: string) => void;
  newOfferDesc?: string;
  setNewOfferDesc?: (v: string) => void;
  newOfferBadge?: string;
  setNewOfferBadge?: (v: string) => void;
  newOfferImage?: string;
  setNewOfferImage?: (v: string) => void;
  newOfferOrigPrice?: string;
  setNewOfferOrigPrice?: (v: string) => void;
  newOfferPrice?: string;
  setNewOfferPrice?: (v: string) => void;
  newOfferSelectedProductIds?: string[];
  setNewOfferSelectedProductIds?: (ids: string[]) => void;
  newOfferOverlay?: boolean;
  setNewOfferOverlay?: (v: boolean) => void;
  onAddOfferSubmit?: (e: React.FormEvent) => void;

  editingOffer?: Offer | null;
  setEditingOffer?: (o: Offer | null) => void;
  onUpdateOfferSubmit?: (e: React.FormEvent) => void;
}

export function AdminModals({
  categoriesList,
  brandsList,
  isSubmitting,
  onFileUpload,

  isAddProductOpen,
  onCloseAddProduct,
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
  newProdImages = [newProdImage],
  setNewProdImages,
  newProdFeatured,
  setNewProdFeatured,
  newProdFlashDeal,
  setNewProdFlashDeal,
  newProdBrand,
  setNewProdBrand,
  newProdBoughtPastMonth,
  setNewProdBoughtPastMonth,
  newProdSku,
  setNewProdSku,
  newProdTargetGender,
  setNewProdTargetGender,
  newProdOriginCountry,
  setNewProdOriginCountry,
  newProdShelfLife,
  setNewProdShelfLife,
  newProdKeyBenefits,
  setNewProdKeyBenefits,
  newProdHighlights,
  setNewProdHighlights,
  newProdUsage,
  setNewProdUsage,
  newProdCare,
  setNewProdCare,
  newProdPackageIncludes,
  setNewProdPackageIncludes,
  newProdDeliveryInfo,
  setNewProdDeliveryInfo,
  newProdReturnPolicy,
  setNewProdReturnPolicy,
  onAddProductSubmit,

  isAddCategoryOpen,
  onCloseAddCategory,
  newCatName,
  setNewCatName,
  newCatSlug,
  setNewCatSlug,
  newCatDesc,
  setNewCatDesc,
  newCatImage,
  setNewCatImage,
  newCatFeatured,
  setNewCatFeatured,
  onAddCategorySubmit,

  isAddStoryOpen,
  onCloseAddStory,
  newStoryTitle,
  setNewStoryTitle,
  newStorySub,
  setNewStorySub,
  newStoryImg,
  setNewStoryImg,
  onAddStorySubmit,

  isAddTrendingOpen,
  onCloseAddTrending,
  newTrendingQuery,
  setNewTrendingQuery,
  onAddTrendingSubmit,

  editingProduct,
  setEditingProduct,
  onUpdateProductSubmit,

  editingCategory,
  setEditingCategory,
  onUpdateCategorySubmit,

  editingStory,
  setEditingStory,
  onUpdateStorySubmit,

  productsList = [],
  isAddOfferOpen = false,
  onCloseAddOffer,
  newOfferTitle = "",
  setNewOfferTitle,
  newOfferSub = "",
  setNewOfferSub,
  newOfferDesc = "",
  setNewOfferDesc,
  newOfferBadge = "SPECIAL BUNDLE",
  setNewOfferBadge,
  newOfferImage = "",
  setNewOfferImage,
  newOfferOrigPrice = "",
  setNewOfferOrigPrice,
  newOfferPrice = "",
  setNewOfferPrice,
  newOfferSelectedProductIds = [],
  setNewOfferSelectedProductIds,
  newOfferOverlay = false,
  setNewOfferOverlay,
  onAddOfferSubmit,

  editingOffer = null,
  setEditingOffer,
  onUpdateOfferSubmit,
}: AdminModalsProps) {
  const brandSelectOptions = [
    ...(brandsList || []).map((b) => ({ value: b.name, label: b.name })),
    { value: "Other", label: "+ Custom / Other Brand" },
  ];

  const [addOfferCategoryFilter, setAddOfferCategoryFilter] = useState<string>("ALL");
  const [editOfferCategoryFilter, setEditOfferCategoryFilter] = useState<string>("ALL");
  const [addTab, setAddTab] = useState<'basic' | 'gallery' | 'specs' | 'shipping'>('basic');
  const [editTab, setEditTab] = useState<'basic' | 'gallery' | 'specs' | 'shipping'>('basic');

  const isAnyModalOpen = Boolean(
    isAddProductOpen ||
      editingProduct ||
      isAddCategoryOpen ||
      editingCategory ||
      isAddStoryOpen ||
      editingStory ||
      isAddOfferOpen ||
      editingOffer,
  );

  useEffect(() => {
    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isAnyModalOpen]);

  return (
    <>
      {/* MODAL 1: ADD PRODUCT */}
      <AnimatePresence>
        {isAddProductOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-4xl bg-white border border-slate-200 shadow-2xl overflow-hidden text-slate-900 my-auto"
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
                  onClick={onCloseAddProduct}
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

              {/* Main Form Content */}
              <form onSubmit={onAddProductSubmit} className="flex flex-col">
                <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto text-xs font-semibold">
                  {/* TAB 1: BASIC & PRICING */}
                  {addTab === 'basic' && (
                    <div className="space-y-5 animate-fadeIn">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          Product Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={newProdName}
                          onChange={(e) => setNewProdName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 p-3 text-slate-900 font-bold text-sm focus:outline-none focus:border-slate-900"
                          placeholder="e.g. AURA CyberHeadset Pro Edition"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Category</label>
                          <CustomSelect
                            value={newProdCategory}
                            onChange={(val) => setNewProdCategory(val)}
                            placeholder="Select Category..."
                            options={[
                              { value: "", label: "Select Category..." },
                              ...categoriesList.map((c) => ({ value: c.id, label: c.name })),
                            ]}
                            triggerClassName="w-full justify-between py-2.5"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Brand</label>
                          <div className="space-y-1.5">
                            {brandSelectOptions.length > 1 && (
                              <CustomSelect
                                value={
                                  brandSelectOptions.some(b => b.value === newProdBrand)
                                    ? newProdBrand || ''
                                    : 'Other'
                                }
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

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Price ($) *</label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={newProdPrice}
                            onChange={(e) => setNewProdPrice(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 font-mono text-sm focus:outline-none focus:border-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Original Price ($)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={newProdOrigPrice}
                            onChange={(e) => setNewProdOrigPrice(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 font-mono text-sm focus:outline-none focus:border-slate-900"
                            placeholder="Optional"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Stock Quantity *</label>
                          <input
                            type="number"
                            value={newProdStock}
                            onChange={(e) => setNewProdStock(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 font-bold focus:outline-none focus:border-slate-900"
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

                      <div className="flex items-center space-x-6 p-3.5 bg-slate-50 border border-slate-200">
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
                    </div>
                  )}

                  {/* TAB 2: COVER & MEDIA GALLERY */}
                  {addTab === 'gallery' && (
                    <div className="space-y-6 animate-fadeIn">
                      {/* Main Cover Image */}
                      <div className="p-4 bg-slate-50 border border-slate-200 space-y-3">
                        <label className="block text-slate-900 font-black text-xs uppercase flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-slate-900" />
                          Main Cover Image *
                        </label>
                        <div className="flex items-center space-x-2">
                          <label className="px-4 py-2.5 bg-white border border-slate-300 text-slate-900 font-bold text-xs hover:border-slate-900 transition-colors cursor-pointer flex items-center space-x-1.5 whitespace-nowrap shadow-xs">
                            <Upload className="w-4 h-4 text-slate-900" />
                            <span>Upload File</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                onFileUpload(e, (url) => {
                                  setNewProdImage(url);
                                  if (setNewProdImages) {
                                    const curr = [...(newProdImages || [])];
                                    curr[0] = url;
                                    setNewProdImages(curr);
                                  }
                                })
                              }
                            />
                          </label>
                          <input
                            type="text"
                            value={newProdImage}
                            onChange={(e) => {
                              setNewProdImage(e.target.value);
                              if (setNewProdImages) {
                                const curr = [...(newProdImages || [])];
                                curr[0] = e.target.value;
                                setNewProdImages(curr);
                              }
                            }}
                            className="flex-1 bg-white border border-slate-300 p-2.5 text-slate-900 text-xs font-mono focus:outline-none focus:border-slate-900"
                            placeholder="Paste Main Cover Image URL..."
                          />
                        </div>

                        {newProdImage && (
                          <div className="relative w-32 h-32 border-2 border-slate-900 mt-3 bg-white shadow-md">
                            <img
                              src={newProdImage}
                              alt="Main Cover Preview"
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-0 inset-x-0 bg-slate-900 text-white text-[9px] font-black uppercase text-center py-1">
                              MAIN COVER
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Secondary Thumbnails Gallery */}
                      <div className="p-4 bg-slate-50 border border-slate-200 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <label className="block text-slate-900 font-black text-xs uppercase">
                            Thumbnails Gallery
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              if (setNewProdImages) {
                                const curr = [...(newProdImages || [])];
                                curr.push("");
                                setNewProdImages(curr);
                              }
                            }}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-[10px] font-bold uppercase flex items-center gap-1 cursor-pointer shadow-xs"
                          >
                            <Plus className="w-3.5 h-3.5 text-white" />
                            <span>Add Thumbnail</span>
                          </button>
                        </div>

                        <div className="space-y-2.5">
                          {(newProdImages || [newProdImage]).map((imgUrl, idx) => (
                            <div key={idx} className="flex items-center space-x-2 bg-white p-2.5 border border-slate-200 shadow-xs">
                              <span className="text-[10px] font-mono font-bold text-slate-600 w-14 text-center bg-slate-100 py-1 border border-slate-200">
                                {idx === 0 ? "MAIN COVER" : `#${idx}`}
                              </span>

                              <div className="w-12 h-12 border border-slate-300 flex-shrink-0 overflow-hidden bg-slate-100 relative">
                                {imgUrl ? (
                                  <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-[9px]">
                                    Empty
                                  </div>
                                )}
                              </div>

                              <input
                                type="text"
                                value={imgUrl}
                                onChange={(e) => {
                                  if (setNewProdImages) {
                                    const curr = [...(newProdImages || [])];
                                    curr[idx] = e.target.value;
                                    setNewProdImages(curr);
                                    if (idx === 0) setNewProdImage(e.target.value);
                                  } else if (idx === 0) {
                                    setNewProdImage(e.target.value);
                                  }
                                }}
                                className="flex-1 bg-slate-50 border border-slate-300 p-2 text-slate-900 text-xs font-mono focus:outline-none focus:border-slate-900"
                                placeholder={idx === 0 ? "Main image URL..." : `Thumbnail #${idx} URL...`}
                              />

                              <label className="p-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 cursor-pointer">
                                <Upload className="w-3.5 h-3.5 text-slate-800" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) =>
                                    onFileUpload(e, (url) => {
                                      if (setNewProdImages) {
                                        const curr = [...(newProdImages || [])];
                                        curr[idx] = url;
                                        setNewProdImages(curr);
                                        if (idx === 0) setNewProdImage(url);
                                      } else if (idx === 0) {
                                        setNewProdImage(url);
                                      }
                                    })
                                  }
                                />
                              </label>

                              {idx > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (setNewProdImages) {
                                      const curr = (newProdImages || []).filter((_, i) => i !== idx);
                                      setNewProdImages(curr);
                                    }
                                  }}
                                  className="p-2 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 border border-rose-200 cursor-pointer transition-colors"
                                  title="Delete Thumbnail"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: UNIVERSAL SPECS & HOOK */}
                  {addTab === 'specs' && (
                    <div className="space-y-5 animate-fadeIn">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">SKU Code</label>
                          <input
                            type="text"
                            value={newProdSku || ''}
                            onChange={(e) => setNewProdSku?.(e.target.value)}
                            placeholder="e.g. AUR-PRO-001"
                            className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 font-mono focus:outline-none focus:border-slate-900"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Target Audience / Gender</label>
                          <CustomSelect
                            value={newProdTargetGender || 'unisex'}
                            onChange={(val) => setNewProdTargetGender?.(val)}
                            options={TARGET_GENDER_OPTIONS}
                            triggerClassName="w-full justify-between py-2.5"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Country of Origin</label>
                          <input
                            type="text"
                            value={newProdOriginCountry || ''}
                            onChange={(e) => setNewProdOriginCountry?.(e.target.value)}
                            placeholder="e.g. Germany, Japan"
                            className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Shelf Life / Warranty</label>
                          <input
                            type="text"
                            value={newProdShelfLife || ''}
                            onChange={(e) => setNewProdShelfLife?.(e.target.value)}
                            placeholder="e.g. 24 Months Warranty"
                            className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Bought Past Month (Sales)</label>
                          <input
                            type="number"
                            value={newProdBoughtPastMonth || '50'}
                            onChange={(e) => setNewProdBoughtPastMonth?.(e.target.value)}
                            placeholder="e.g. 50"
                            className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Key Benefit Hook</label>
                        <input
                          type="text"
                          value={newProdKeyBenefits || ''}
                          onChange={(e) => setNewProdKeyBenefits?.(e.target.value)}
                          placeholder="e.g. Ultra-fast 45W charging with active surge protection"
                          className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Product Highlights (Comma Separated)</label>
                        <input
                          type="text"
                          value={newProdHighlights || ''}
                          onChange={(e) => setNewProdHighlights?.(e.target.value)}
                          placeholder="e.g. Fast Charging, Dual USB-C Ports, 2-Year Warranty"
                          className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 4: SHIPPING & INSTRUCTIONS */}
                  {addTab === 'shipping' && (
                    <div className="space-y-5 animate-fadeIn">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Usage & Operation Instructions</label>
                          <textarea
                            rows={3}
                            value={newProdUsage || ''}
                            onChange={(e) => setNewProdUsage?.(e.target.value)}
                            placeholder="Operating procedure and usage notes..."
                            className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Care & Maintenance</label>
                          <textarea
                            rows={3}
                            value={newProdCare || ''}
                            onChange={(e) => setNewProdCare?.(e.target.value)}
                            placeholder="Storage guidelines and care tips..."
                            className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Package Includes (Comma Separated)</label>
                        <input
                          type="text"
                          value={newProdPackageIncludes || ''}
                          onChange={(e) => setNewProdPackageIncludes?.(e.target.value)}
                          placeholder="e.g. 1x Main Charger Unit, 1x Type-C Cable, 1x User Manual"
                          className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Delivery & Shipping Info</label>
                          <input
                            type="text"
                            value={newProdDeliveryInfo || ''}
                            onChange={(e) => setNewProdDeliveryInfo?.(e.target.value)}
                            placeholder="e.g. Express delivery within 24-48 hours"
                            className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Return & Inspection Policy</label>
                          <input
                            type="text"
                            value={newProdReturnPolicy || ''}
                            onChange={(e) => setNewProdReturnPolicy?.(e.target.value)}
                            placeholder="e.g. Inspection upon delivery + 14-day hassle-free return"
                            className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Executive Sticky Footer */}
                <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={onCloseAddProduct}
                    className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-200 font-bold text-xs uppercase transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-slate-900 hover:bg-black text-white font-black text-xs uppercase border border-slate-800 transition-all cursor-pointer flex items-center space-x-2 shadow-lg disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving Product...</span>
                      </>
                    ) : (
                      <>
                        <span>Save Product to Supabase</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: ADD CATEGORY */}
      <AnimatePresence>
        {isAddCategoryOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 w-full max-w-md p-6 space-y-6 text-slate-900"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <h3 className="text-lg font-black uppercase text-slate-900">
                  Add New Category
                </h3>
                <button
                  onClick={onCloseAddCategory}
                  className="p-1 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={onAddCategorySubmit}
                className="space-y-4 text-xs font-semibold"
              >
                <div>
                  <label className="block text-slate-600 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                    placeholder="e.g. Headphones"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">
                    Slug (URL identifier)
                  </label>
                  <input
                    type="text"
                    value={newCatSlug}
                    onChange={(e) => setNewCatSlug(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 font-mono text-[11px] focus:outline-none focus:border-slate-900"
                    placeholder="e.g. headphones (auto-generated if empty)"
                  />
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
                            onFileUpload(e, (url) => setNewCatImage(url))
                          }
                        />
                      </label>
                      <input
                        type="text"
                        value={newCatImage}
                        onChange={(e) => setNewCatImage(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-300 p-2 text-slate-900 text-xs font-mono focus:outline-none focus:border-slate-900"
                        placeholder="Paste image URL..."
                      />
                    </div>
                    {newCatImage && (
                      <div className="relative w-16 h-16 border border-slate-200">
                        <img
                          src={newCatImage}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-1 text-slate-700">
                  <input
                    type="checkbox"
                    id="add-cat-featured"
                    checked={newCatFeatured}
                    onChange={(e) => setNewCatFeatured(e.target.checked)}
                    className="w-4 h-4 accent-slate-900 cursor-pointer"
                  />
                  <label
                    htmlFor="add-cat-featured"
                    className="text-slate-700 font-bold cursor-pointer"
                  >
                    Featured Category (Show on Homepage)
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
                      <span>Saving Category...</span>
                    </>
                  ) : (
                    <span>Save Category to Supabase</span>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: ADD STORY */}
      <AnimatePresence>
        {isAddStoryOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 w-full max-w-md p-6 space-y-6 text-slate-900"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <h3 className="text-lg font-black uppercase text-slate-900">
                  Add New Story / Drop
                </h3>
                <button
                  onClick={onCloseAddStory}
                  className="p-1 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={onAddStorySubmit}
                className="space-y-4 text-xs font-semibold"
              >
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

      {/* MODAL 4: ADD TRENDING KEYWORD */}
      <AnimatePresence>
        {isAddTrendingOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 w-full max-w-md p-6 space-y-6 text-slate-900"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <h3 className="text-lg font-black uppercase text-slate-900">
                  Add Trending Keyword
                </h3>
                <button
                  onClick={onCloseAddTrending}
                  className="p-1 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={onAddTrendingSubmit}
                className="space-y-4 text-xs font-semibold"
              >
                <div>
                  <label className="block text-slate-600 mb-1">
                    Keyword / Query
                  </label>
                  <input
                    type="text"
                    required
                    value={newTrendingQuery}
                    onChange={(e) => setNewTrendingQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                    placeholder="e.g. Wireless Audio"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-slate-900 hover:bg-black text-white font-black text-xs uppercase border border-slate-800 transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Keyword...</span>
                    </>
                  ) : (
                    <span>Add Keyword to Supabase</span>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT MODAL 1: EDIT PRODUCT */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-4xl bg-white border border-slate-200 shadow-2xl overflow-hidden text-slate-900 my-auto"
            >
              {/* Executive Dark Header */}
              <div className="bg-slate-950 text-white p-5 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-slate-800 border border-slate-700 text-amber-400">
                    <Edit2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase tracking-wider text-white">
                      Edit Product: {editingProduct.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      ID: {editingProduct.id} • SKU: {editingProduct.sku || "N/A"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer border border-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modern Tab Bar Header */}
              <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setEditTab('basic')}
                  className={`flex-1 py-3 px-4 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    editTab === 'basic'
                      ? 'border-slate-900 text-slate-950 bg-white shadow-xs'
                      : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>BASIC & PRICING</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditTab('gallery')}
                  className={`flex-1 py-3 px-4 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    editTab === 'gallery'
                      ? 'border-slate-900 text-slate-950 bg-white shadow-xs'
                      : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>MEDIA GALLERY</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditTab('specs')}
                  className={`flex-1 py-3 px-4 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    editTab === 'specs'
                      ? 'border-slate-900 text-slate-950 bg-white shadow-xs'
                      : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>UNIVERSAL SPECS</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditTab('shipping')}
                  className={`flex-1 py-3 px-4 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    editTab === 'shipping'
                      ? 'border-slate-900 text-slate-950 bg-white shadow-xs'
                      : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>SHIPPING & USAGE</span>
                </button>
              </div>

              {/* Main Form Content */}
              <form onSubmit={onUpdateProductSubmit} className="flex flex-col">
                <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto text-xs font-semibold">
                  {/* TAB 1: BASIC & PRICING */}
                  {editTab === 'basic' && (
                    <div className="space-y-5 animate-fadeIn">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Product Title *</label>
                        <input
                          type="text"
                          required
                          value={editingProduct.name}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              name: e.target.value,
                            })
                          }
                          className="w-full bg-slate-50 border border-slate-300 p-3 text-slate-900 font-bold text-sm focus:outline-none focus:border-slate-900"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">URL Slug</label>
                          <input
                            type="text"
                            value={editingProduct.slug || ""}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                slug: e.target.value,
                              })
                            }
                            className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Category</label>
                          <CustomSelect
                            value={editingProduct.category_id || ""}
                            onChange={(val) =>
                              setEditingProduct({
                                ...editingProduct,
                                category_id: val || null,
                              })
                            }
                            placeholder="No Category"
                            options={[
                              { value: "", label: "No Category" },
                              ...categoriesList.map((c) => ({ value: c.id, label: c.name })),
                            ]}
                            triggerClassName="w-full justify-between py-2.5"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Brand</label>
                          <div className="space-y-1.5">
                            {brandSelectOptions.length > 1 && (
                              <CustomSelect
                                value={
                                  brandSelectOptions.some(b => b.value === editingProduct.brand)
                                    ? editingProduct.brand || ''
                                    : 'Other'
                                }
                                onChange={(val) => {
                                  if (val !== 'Other') {
                                    setEditingProduct({ ...editingProduct, brand: val });
                                  }
                                }}
                                options={brandSelectOptions}
                                triggerClassName="w-full justify-between py-2 font-bold"
                              />
                            )}
                            <input
                              type="text"
                              value={editingProduct.brand || ''}
                              onChange={(e) =>
                                setEditingProduct({
                                  ...editingProduct,
                                  brand: e.target.value,
                                })
                              }
                              placeholder="Type brand name freely..."
                              className="w-full bg-slate-50 border border-slate-300 p-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Badge Tag</label>
                          <CustomSelect
                            value={editingProduct.badge || ""}
                            onChange={(val) =>
                              setEditingProduct({
                                ...editingProduct,
                                badge: val,
                              })
                            }
                            options={PRODUCT_BADGE_OPTIONS}
                            triggerClassName="w-full justify-between py-2.5 font-bold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Price ($) *</label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={editingProduct.price}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                price: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 font-mono text-sm focus:outline-none focus:border-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Original Price ($)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={editingProduct.original_price || ""}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                original_price: parseFloat(e.target.value) || undefined,
                              })
                            }
                            className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 font-mono text-sm focus:outline-none focus:border-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Stock Quantity *</label>
                          <input
                            type="number"
                            value={editingProduct.stock ?? 10}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                stock: parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 font-bold focus:outline-none focus:border-slate-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Description</label>
                        <textarea
                          rows={4}
                          value={editingProduct.description || ""}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              description: e.target.value,
                            })
                          }
                          className="w-full bg-slate-50 border border-slate-300 p-3 text-slate-900 leading-relaxed focus:outline-none focus:border-slate-900"
                        />
                      </div>

                      <div className="flex flex-wrap gap-6 p-3.5 bg-slate-50 border border-slate-200">
                        <label className="flex items-center space-x-2 cursor-pointer font-bold">
                          <input
                            type="checkbox"
                            checked={editingProduct.is_featured || false}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                is_featured: e.target.checked,
                              })
                            }
                            className="w-4 h-4 accent-slate-900 cursor-pointer"
                          />
                          <span>Featured Product</span>
                        </label>

                        <label className="flex items-center space-x-2 cursor-pointer font-bold">
                          <input
                            type="checkbox"
                            checked={editingProduct.is_flash_deal || false}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                is_flash_deal: e.target.checked,
                              })
                            }
                            className="w-4 h-4 accent-slate-900 cursor-pointer"
                          />
                          <span>Flash Deal Item</span>
                        </label>

                        <label className="flex items-center space-x-2 cursor-pointer font-bold">
                          <input
                            type="checkbox"
                            checked={editingProduct.in_stock ?? true}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                in_stock: e.target.checked,
                              })
                            }
                            className="w-4 h-4 accent-slate-900 cursor-pointer"
                          />
                          <span>In Stock Status</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: COVER & MEDIA GALLERY */}
                  {editTab === 'gallery' && (
                    <div className="space-y-6 animate-fadeIn">
                      {/* Main Cover Image */}
                      <div className="p-4 bg-slate-50 border border-slate-200 space-y-3">
                        <label className="block text-slate-900 font-black text-xs uppercase flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-slate-900" />
                          Main Cover Image *
                        </label>
                        <div className="flex items-center space-x-2">
                          <label className="px-4 py-2.5 bg-white border border-slate-300 text-slate-900 font-bold text-xs hover:border-slate-900 transition-colors cursor-pointer flex items-center space-x-1.5 whitespace-nowrap shadow-xs">
                            <Upload className="w-4 h-4 text-slate-900" />
                            <span>Upload File</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                onFileUpload(e, (url) => {
                                  const curr = [...(editingProduct.images || [])];
                                  curr[0] = url;
                                  setEditingProduct({ ...editingProduct, images: curr });
                                })
                              }
                            />
                          </label>
                          <input
                            type="text"
                            value={editingProduct.images?.[0] || ""}
                            onChange={(e) => {
                              const curr = [...(editingProduct.images || [])];
                              curr[0] = e.target.value;
                              setEditingProduct({ ...editingProduct, images: curr });
                            }}
                            className="flex-1 bg-white border border-slate-300 p-2.5 text-slate-900 text-xs font-mono focus:outline-none focus:border-slate-900"
                            placeholder="Paste Main Cover Image URL..."
                          />
                        </div>
                      </div>

                      {/* Secondary Thumbnails Gallery */}
                      <div className="p-4 bg-slate-50 border border-slate-200 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <label className="block text-slate-900 font-black text-xs uppercase">
                            Thumbnails Gallery
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const curr = [...(editingProduct.images || [])];
                              curr.push("");
                              setEditingProduct({ ...editingProduct, images: curr });
                            }}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-[10px] font-bold uppercase flex items-center gap-1 cursor-pointer shadow-xs"
                          >
                            <Plus className="w-3.5 h-3.5 text-white" />
                            <span>Add Thumbnail</span>
                          </button>
                        </div>

                        <div className="space-y-2.5">
                          {(editingProduct.images || []).map((imgUrl, idx) => (
                            <div key={idx} className="flex items-center space-x-2 bg-white p-2.5 border border-slate-200 shadow-xs">
                              <span className="text-[10px] font-mono font-bold text-slate-600 w-14 text-center bg-slate-100 py-1 border border-slate-200">
                                {idx === 0 ? "MAIN COVER" : `#${idx}`}
                              </span>

                              <div className="w-12 h-12 border border-slate-300 flex-shrink-0 overflow-hidden bg-slate-100 relative">
                                {imgUrl ? (
                                  <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-[9px]">
                                    Empty
                                  </div>
                                )}
                              </div>

                              <input
                                type="text"
                                value={imgUrl}
                                onChange={(e) => {
                                  const curr = [...(editingProduct.images || [])];
                                  curr[idx] = e.target.value;
                                  setEditingProduct({ ...editingProduct, images: curr });
                                }}
                                className="flex-1 bg-slate-50 border border-slate-300 p-2 text-slate-900 text-xs font-mono focus:outline-none focus:border-slate-900"
                                placeholder={idx === 0 ? "Main image URL..." : `Thumbnail #${idx} URL...`}
                              />

                              <label className="p-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 cursor-pointer">
                                <Upload className="w-3.5 h-3.5 text-slate-800" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) =>
                                    onFileUpload(e, (url) => {
                                      const curr = [...(editingProduct.images || [])];
                                      curr[idx] = url;
                                      setEditingProduct({ ...editingProduct, images: curr });
                                    })
                                  }
                                />
                              </label>

                              {idx > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const curr = editingProduct.images.filter((_, i) => i !== idx);
                                    setEditingProduct({ ...editingProduct, images: curr });
                                  }}
                                  className="p-2 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 border border-rose-200 cursor-pointer transition-colors"
                                  title="Delete Thumbnail"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: UNIVERSAL SPECS & HOOK */}
                  {editTab === 'specs' && (
                    <div className="space-y-5 animate-fadeIn">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">SKU Code</label>
                          <input
                            type="text"
                            value={editingProduct.sku || ''}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                sku: e.target.value,
                              })
                            }
                            placeholder="e.g. AUR-PRO-001"
                            className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 font-mono focus:outline-none focus:border-slate-900"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Target Audience / Gender</label>
                          <CustomSelect
                            value={editingProduct.target_gender || 'unisex'}
                            onChange={(val) =>
                              setEditingProduct({
                                ...editingProduct,
                                target_gender: val,
                              })
                            }
                            options={TARGET_GENDER_OPTIONS}
                            triggerClassName="w-full justify-between py-2.5"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Country of Origin</label>
                          <input
                            type="text"
                            value={editingProduct.origin_country || ''}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                origin_country: e.target.value,
                              })
                            }
                            placeholder="e.g. Germany, Japan"
                            className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Shelf Life / Warranty</label>
                          <input
                            type="text"
                            value={editingProduct.shelf_life || ''}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                shelf_life: e.target.value,
                              })
                            }
                            placeholder="e.g. 24 Months Warranty"
                            className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Bought Past Month (Sales)</label>
                          <input
                            type="number"
                            value={editingProduct.bought_past_month ?? 50}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                bought_past_month: parseInt(e.target.value) || 0,
                              })
                            }
                            placeholder="e.g. 50"
                            className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Key Benefit Hook</label>
                        <input
                          type="text"
                          value={editingProduct.key_benefits || ''}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              key_benefits: e.target.value,
                            })
                          }
                          placeholder="e.g. Ultra-fast 45W charging with active surge protection"
                          className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Product Highlights (Comma Separated)</label>
                        <input
                          type="text"
                          value={
                            Array.isArray(editingProduct.highlights)
                              ? editingProduct.highlights.join(', ')
                              : editingProduct.highlights || ''
                          }
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              highlights: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                            })
                          }
                          placeholder="e.g. Fast Charging, Dual USB-C Ports, 2-Year Warranty"
                          className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 4: SHIPPING & INSTRUCTIONS */}
                  {editTab === 'shipping' && (
                    <div className="space-y-5 animate-fadeIn">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Usage & Operation Instructions</label>
                          <textarea
                            rows={3}
                            value={editingProduct.usage_instructions || ''}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                usage_instructions: e.target.value,
                              })
                            }
                            placeholder="Operating procedure and usage notes..."
                            className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Care & Maintenance</label>
                          <textarea
                            rows={3}
                            value={editingProduct.care_instructions || ''}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                care_instructions: e.target.value,
                              })
                            }
                            placeholder="Storage guidelines and care tips..."
                            className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Package Includes (Comma Separated)</label>
                        <input
                          type="text"
                          value={
                            Array.isArray(editingProduct.package_includes)
                              ? editingProduct.package_includes.join(', ')
                              : editingProduct.package_includes || ''
                          }
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              package_includes: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                            })
                          }
                          placeholder="e.g. 1x Main Charger Unit, 1x Type-C Cable, 1x User Manual"
                          className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Delivery & Shipping Info</label>
                          <input
                            type="text"
                            value={editingProduct.delivery_info || ''}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                delivery_info: e.target.value,
                              })
                            }
                            placeholder="e.g. Express delivery within 24-48 hours"
                            className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Return & Inspection Policy</label>
                          <input
                            type="text"
                            value={editingProduct.return_policy || ''}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                return_policy: e.target.value,
                              })
                            }
                            placeholder="e.g. Inspection upon delivery + 14-day hassle-free return"
                            className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Executive Sticky Footer */}
                <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-200 font-bold text-xs uppercase transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-slate-900 hover:bg-black text-white font-black text-xs uppercase border border-slate-800 transition-all cursor-pointer flex items-center space-x-2 shadow-lg disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating Product...</span>
                      </>
                    ) : (
                      <>
                        <span>Update Product in Supabase</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT MODAL 2: EDIT CATEGORY */}
      <AnimatePresence>
        {editingCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 w-full max-w-md p-6 space-y-6 text-slate-900"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <h3 className="text-lg font-black uppercase text-slate-900">Edit Category</h3>
                <button
                  onClick={() => setEditingCategory(null)}
                  className="p-1 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={onUpdateCategorySubmit}
                className="space-y-4 text-xs font-semibold"
              >
                <div>
                  <label className="block text-slate-600 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCategory.name}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        name: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">
                    Slug (URL identifier)
                  </label>
                  <input
                    type="text"
                    value={editingCategory.slug || ""}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        slug: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 font-mono text-[11px] focus:outline-none focus:border-slate-900"
                  />
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
                            onFileUpload(e, (url) =>
                              setEditingCategory({
                                ...editingCategory,
                                image_url: url,
                              }),
                            )
                          }
                        />
                      </label>
                      <input
                        type="text"
                        value={editingCategory.image_url || ""}
                        onChange={(e) =>
                          setEditingCategory({
                            ...editingCategory,
                            image_url: e.target.value,
                          })
                        }
                        className="flex-1 bg-slate-50 border border-slate-300 p-2 text-slate-900 text-xs font-mono focus:outline-none focus:border-slate-900"
                        placeholder="Paste image URL..."
                      />
                    </div>
                    {editingCategory.image_url && (
                      <div className="relative w-16 h-16 border border-slate-200">
                        <img
                          src={editingCategory.image_url}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={editingCategory.description || ""}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        description: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-1 text-slate-700">
                  <input
                    type="checkbox"
                    id="edit-cat-featured"
                    checked={editingCategory.is_featured || false}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        is_featured: e.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-slate-900 cursor-pointer"
                  />
                  <label
                    htmlFor="edit-cat-featured"
                    className="text-slate-700 font-bold cursor-pointer"
                  >
                    Featured Category (Show on Homepage)
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
                      <span>Updating Category...</span>
                    </>
                  ) : (
                    <span>Update Category in Supabase</span>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT MODAL 3: EDIT STORY */}
      <AnimatePresence>
        {editingStory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 w-full max-w-md p-6 space-y-6 text-slate-900"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <h3 className="text-lg font-black uppercase text-slate-900">Edit Story</h3>
                <button
                  onClick={() => setEditingStory(null)}
                  className="p-1 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={onUpdateStorySubmit}
                className="space-y-4 text-xs font-semibold"
              >
                <div>
                  <label className="block text-slate-600 mb-1">
                    Campaign Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editingStory.title}
                    onChange={(e) =>
                      setEditingStory({
                        ...editingStory,
                        title: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={editingStory.subtitle || ""}
                    onChange={(e) =>
                      setEditingStory({
                        ...editingStory,
                        subtitle: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                  />
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
                            onFileUpload(e, (url) =>
                              setEditingStory({
                                ...editingStory,
                                image_url: url,
                              }),
                            )
                          }
                        />
                      </label>
                      <input
                        type="text"
                        value={editingStory.image_url || ""}
                        onChange={(e) =>
                          setEditingStory({
                            ...editingStory,
                            image_url: e.target.value,
                          })
                        }
                        className="flex-1 bg-slate-50 border border-slate-300 p-2 text-slate-900 text-xs font-mono focus:outline-none focus:border-slate-900"
                        placeholder="Paste image URL..."
                      />
                    </div>
                    {editingStory.image_url && (
                      <div className="relative w-16 h-16 border border-slate-200">
                        <img
                          src={editingStory.image_url}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-slate-900 hover:bg-black text-white font-black text-xs uppercase border border-slate-800 transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating Story...</span>
                    </>
                  ) : (
                    <span>Update Story in Supabase</span>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ADD OFFER BUNDLE */}
      <AnimatePresence>
        {isAddOfferOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 w-full max-w-lg p-6 space-y-6 text-slate-900 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <h3 className="text-lg font-black uppercase text-slate-900">
                  Create New Offer Bundle
                </h3>
                {onCloseAddOffer && (
                  <button
                    onClick={onCloseAddOffer}
                    className="p-1 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              <form onSubmit={onAddOfferSubmit} className="space-y-4 text-xs font-semibold">
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
                    {productsList && newOfferSelectedProductIds && newOfferSelectedProductIds.length > 0 && (
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
                      value={addOfferCategoryFilter}
                      onChange={(val) => setAddOfferCategoryFilter(val)}
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
                        if (addOfferCategoryFilter === "ALL") return true;
                        return p.category_id === addOfferCategoryFilter || p.category?.id === addOfferCategoryFilter;
                      })
                      .map((p) => {
                      const isSelected = (newOfferSelectedProductIds || []).includes(p.id);
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
                                ? [...(newOfferSelectedProductIds || []), p.id]
                                : (newOfferSelectedProductIds || []).filter((id) => id !== p.id);
                              
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

      {/* MODAL: EDIT OFFER BUNDLE */}
      <AnimatePresence>
        {editingOffer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 w-full max-w-lg p-6 space-y-6 text-slate-900 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <h3 className="text-lg font-black uppercase text-slate-900">
                  Edit Offer Bundle
                </h3>
                {setEditingOffer && (
                  <button
                    onClick={() => setEditingOffer(null)}
                    className="p-1 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              <form onSubmit={onUpdateOfferSubmit} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-slate-600 mb-1">Offer Title *</label>
                  <input
                    type="text"
                    required
                    value={editingOffer.title}
                    onChange={(e) =>
                      setEditingOffer && setEditingOffer({ ...editingOffer, title: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-600 mb-1">Badge</label>
                    <input
                      type="text"
                      value={editingOffer.badge || ""}
                      onChange={(e) =>
                        setEditingOffer && setEditingOffer({ ...editingOffer, badge: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={editingOffer.subtitle || ""}
                      onChange={(e) =>
                        setEditingOffer && setEditingOffer({ ...editingOffer, subtitle: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                  </div>
                </div>

                {/* Multi-Select Products for Edit Offer */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-slate-900 font-bold uppercase text-[11px]">
                      1. Select Included Products:
                    </label>
                    {productsList && editingOffer.product_ids && editingOffer.product_ids.length > 0 && (
                      <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                        Total Reg Price: $
                        {productsList
                          .filter((p) => (editingOffer.product_ids || []).includes(p.id))
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
                      value={editOfferCategoryFilter}
                      onChange={(val) => setEditOfferCategoryFilter(val)}
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
                        if (editOfferCategoryFilter === "ALL") return true;
                        return p.category_id === editOfferCategoryFilter || p.category?.id === editOfferCategoryFilter;
                      })
                      .map((p) => {
                      const isSelected = (editingOffer.product_ids || []).includes(p.id);
                      return (
                        <label
                          key={p.id}
                          className="flex items-center space-x-2 p-1.5 hover:bg-white cursor-pointer border border-transparent hover:border-slate-200"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (!setEditingOffer) return;
                              const currentIds = editingOffer.product_ids || [];
                              const updatedIds = e.target.checked
                                ? [...currentIds, p.id]
                                : currentIds.filter((id) => id !== p.id);

                              const newTotalOrig = (productsList || [])
                                .filter((item) => updatedIds.includes(item.id))
                                .reduce((acc, item) => acc + (Number(item.price) || 0), 0);

                              setEditingOffer({
                                ...editingOffer,
                                product_ids: updatedIds,
                                original_price: newTotalOrig > 0 ? newTotalOrig : editingOffer.original_price,
                              });
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

                {/* Quick Discount Percent Picker */}
                <div className="bg-slate-50 p-3 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-800 font-bold uppercase text-[10px]">
                      2. Quick Apply Discount Percentage:
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[10, 15, 20, 25, 30, 35, 40, 50].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => {
                          if (!setEditingOffer) return;
                          const currentOrig = Number(editingOffer.original_price) || 0;
                          if (currentOrig > 0) {
                            const calculatedOfferP = parseFloat((currentOrig * (1 - pct / 100)).toFixed(2));
                            setEditingOffer({
                              ...editingOffer,
                              offer_price: calculatedOfferP,
                              badge: `${pct}% OFF BUNDLE`,
                            });
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
                    <label className="block text-slate-600 mb-1">Original Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingOffer.original_price}
                      onChange={(e) =>
                        setEditingOffer &&
                        setEditingOffer({
                          ...editingOffer,
                          original_price: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Offer Price ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={editingOffer.offer_price}
                      onChange={(e) =>
                        setEditingOffer &&
                        setEditingOffer({
                          ...editingOffer,
                          offer_price: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 font-bold focus:outline-none focus:border-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Banner Image URL</label>
                  <input
                    type="text"
                    value={editingOffer.image_url}
                    onChange={(e) =>
                      setEditingOffer && setEditingOffer({ ...editingOffer, image_url: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div className="flex items-center space-x-4 pt-1 text-slate-700">
                  <label className="flex items-center space-x-2 cursor-pointer font-bold">
                    <input
                      type="checkbox"
                      checked={editingOffer.is_active}
                      onChange={(e) =>
                        setEditingOffer &&
                        setEditingOffer({ ...editingOffer, is_active: e.target.checked })
                      }
                      className="w-4 h-4 accent-slate-900 cursor-pointer"
                    />
                    <span>Active Offer</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer font-bold text-amber-700">
                    <input
                      type="checkbox"
                      checked={editingOffer.show_in_overlay}
                      onChange={(e) =>
                        setEditingOffer &&
                        setEditingOffer({ ...editingOffer, show_in_overlay: e.target.checked })
                      }
                      className="w-4 h-4 accent-amber-500 cursor-pointer"
                    />
                    <span>Overlay Popup</span>
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
                      <span>Updating Offer...</span>
                    </>
                  ) : (
                    <span>Update Offer in Supabase</span>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
