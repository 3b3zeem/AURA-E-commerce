"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Loader2 } from "lucide-react";
import { Product, Category, Story } from "@/types";
import { CustomSelect } from "@/components/ui/CustomSelect";

const PRODUCT_BADGE_OPTIONS = [
  { value: "", label: "No Badge (None)" },
  { value: "NEW", label: "NEW - جديد" },
  { value: "HOT", label: "HOT - الأكثر طلباً" },
  { value: "BESTSELLER", label: "BESTSELLER - الأكثر مبيعاً" },
  { value: "LIMITED", label: "LIMITED - كمية محدودة" },
  { value: "SALE", label: "SALE - خصم خاص" },
  { value: "TRENDING", label: "TRENDING - تريند" },
  { value: "PREMIUM", label: "PREMIUM - منتج فاخر" },
];

interface AdminModalsProps {
  categoriesList: Category[];
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
  newProdFeatured: boolean;
  setNewProdFeatured: (v: boolean) => void;
  newProdFlashDeal: boolean;
  setNewProdFlashDeal: (v: boolean) => void;
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
}

export function AdminModals({
  categoriesList,
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
  newProdFeatured,
  setNewProdFeatured,
  newProdFlashDeal,
  setNewProdFlashDeal,
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
}: AdminModalsProps) {
  return (
    <>
      {/* MODAL 1: ADD PRODUCT */}
      <AnimatePresence>
        {isAddProductOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 w-full max-w-lg p-6 space-y-6 text-slate-900 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <h3 className="text-lg font-black uppercase text-slate-900">
                  Create New Product
                </h3>
                <button
                  onClick={onCloseAddProduct}
                  className="p-1 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={onAddProductSubmit}
                className="space-y-4 text-xs font-semibold"
              >
                <div>
                  <label className="block text-slate-600 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                    placeholder="e.g. AURA CyberHeadset Pro"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-600 mb-1">
                      Category
                    </label>
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
                    <label className="block text-slate-600 mb-1">Badge Tag</label>
                    <CustomSelect
                      value={newProdBadge}
                      onChange={(val) => setNewProdBadge(val)}
                      options={PRODUCT_BADGE_OPTIONS}
                      triggerClassName="w-full justify-between py-2.5 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-600 mb-1">
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">
                      Original Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newProdOrigPrice}
                      onChange={(e) => setNewProdOrigPrice(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Stock</label>
                    <input
                      type="number"
                      value={newProdStock}
                      onChange={(e) => setNewProdStock(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                  </div>
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
                            onFileUpload(e, (url) => setNewProdImage(url))
                          }
                        />
                      </label>
                      <input
                        type="text"
                        value={newProdImage}
                        onChange={(e) => setNewProdImage(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-300 p-2 text-slate-900 text-xs font-mono focus:outline-none focus:border-slate-900"
                        placeholder="Paste image URL..."
                      />
                    </div>
                    {newProdImage && (
                      <div className="relative w-16 h-16 border border-slate-200">
                        <img
                          src={newProdImage}
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
                  <textarea
                    rows={3}
                    value={newProdDesc}
                    onChange={(e) => setNewProdDesc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div className="flex items-center space-x-4 pt-1 text-slate-700">
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

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-slate-900 hover:bg-black text-white font-black text-xs uppercase border border-slate-800 transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Product...</span>
                    </>
                  ) : (
                    <span>Save Product to Supabase</span>
                  )}
                </button>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 w-full max-w-lg p-6 space-y-6 text-slate-900 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <h3 className="text-lg font-black uppercase text-slate-900">Edit Product</h3>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="p-1 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={onUpdateProductSubmit}
                className="space-y-4 text-xs font-semibold"
              >
                <div>
                  <label className="block text-slate-600 mb-1">
                    Product Title *
                  </label>
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
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-600 mb-1">
                      Slug (URL Identifier)
                    </label>
                    <input
                      type="text"
                      value={editingProduct.slug || ""}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          slug: e.target.value,
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 font-mono text-[11px] focus:outline-none focus:border-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">
                      Category
                    </label>
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
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-600 mb-1">
                      Price ($) *
                    </label>
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
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">
                      Original Price ($)
                    </label>
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
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Stock</label>
                    <input
                      type="number"
                      value={editingProduct.stock ?? 10}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          stock: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Badge Tag</label>
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
                              setEditingProduct({
                                ...editingProduct,
                                images: [url],
                              }),
                            )
                          }
                        />
                      </label>
                      <input
                        type="text"
                        value={editingProduct.images?.[0] || ""}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            images: [e.target.value],
                          })
                        }
                        className="flex-1 bg-slate-50 border border-slate-300 p-2 text-slate-900 text-xs font-mono focus:outline-none focus:border-slate-900"
                        placeholder="Paste image URL..."
                      />
                    </div>
                    {editingProduct.images?.[0] && (
                      <div className="relative w-16 h-16 border border-slate-200">
                        <img
                          src={editingProduct.images[0]}
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
                  <textarea
                    rows={3}
                    value={editingProduct.description || ""}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        description: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div className="flex flex-wrap gap-4 pt-1 text-slate-700">
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
                    <span>In Stock</span>
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
                      <span>Updating Product...</span>
                    </>
                  ) : (
                    <span>Update Product in Supabase</span>
                  )}
                </button>
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
    </>
  );
}
